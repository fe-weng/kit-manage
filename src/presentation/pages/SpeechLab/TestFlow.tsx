import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Export, ShareNetwork, Copy, Microphone, SpeakerHigh, Stop } from '@phosphor-icons/react'
import { toast } from '@/shared/toast'
import { collectCapability, pickRecorderMime } from './capability'
import { ZH_TRIAL_OPTIONS, levenshtein, matchClosedSet, normalizeSpeech } from './closedSetMatch'
import { cancelSpeech, speakDemo } from './tts'
import { WebSpeechController, type SpeechRecognitionResult } from './webSpeech'
import {
  FLOW_PHASES,
  buildExportPayload,
  clearRun,
  copyExport,
  createRun,
  downloadExport,
  loadRun,
  saveRun,
  shareExport,
  toMatchRecord,
  upsertSpeechTrial,
  type FlowPhase,
  type RecognitionSource,
  type TestRun,
} from './testProtocol'

const MAX_LISTEN_MS = 8000
const STABLE_INTERIM_MS = 600

interface TestFlowProps {
  onLog: (channel: string, message: string) => void
}

function persist(run: TestRun): TestRun {
  const next = { ...run, updatedAt: new Date().toISOString() }
  saveRun(next)
  return next
}

function matchesPrompt(result: SpeechRecognitionResult, prompt: string): boolean {
  const expected = normalizeSpeech(prompt)
  return result.alternatives.some((item) => {
    const actual = normalizeSpeech(item.transcript)
    if (actual.length === 0) return false
    if (actual.includes(expected)) return true
    const maxLength = Math.max(actual.length, expected.length)
    return 1 - levenshtein(actual, expected) / maxLength >= 0.72
  })
}

export default function TestFlow({ onLog }: TestFlowProps) {
  const [run, setRun] = useState<TestRun>(() => loadRun() ?? createRun())
  const speechRef = useRef(new WebSpeechController())
  const autoStopRef = useRef<number | null>(null)
  const processingRef = useRef(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [lastSpeechText, setLastSpeechText] = useState('')
  const [lastResultSource, setLastResultSource] = useState<RecognitionSource>('none')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordUrlRef = useRef<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordUrl, setRecordUrl] = useState<string | null>(null)
  const [tapped, setTapped] = useState<string[]>([])

  const phase: FlowPhase = FLOW_PHASES[run.stepIndex] ?? { id: 'done' }
  const progress = Math.min(run.stepIndex + 1, FLOW_PHASES.length)
  const currentSpeechDone = phase.id === 'speech' && run.speechTrials.some(
    (item) => item.lang === phase.lang && item.prompt === phase.prompt && item.trial === phase.trial,
  )
  const currentMatchDone = phase.id === 'matchSpeech' && run.matchTrials.some(
    (item) => item.source === 'speech' && item.prompt === phase.prompt,
  )

  const updateRun = useCallback((updater: (prev: TestRun) => TestRun) => {
    setRun((prev) => persist(updater(prev)))
  }, [])

  useEffect(() => {
    return () => {
      speechRef.current.abort()
      cancelSpeech()
      if (autoStopRef.current !== null) window.clearTimeout(autoStopRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (recordUrlRef.current !== null) URL.revokeObjectURL(recordUrlRef.current)
    }
  }, [])

  const goNext = useCallback(() => {
    updateRun((prev) => ({
      ...prev,
      stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
    }))
    setInterim('')
    setLastSpeechText('')
    setLastResultSource('none')
    processingRef.current = false
    setListening(false)
  }, [updateRun])

  const handleIntroNext = useCallback(() => {
    const cap = collectCapability()
    onLog('flow', `开始流程 standalone=${String(cap.navigatorStandalone)} speech=${cap.speechRecognitionCtor}`)
    updateRun((prev) => ({
      ...prev,
      capability: cap,
      stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
    }))
  }, [onLog, updateRun])

  const handleEnvNext = useCallback(() => {
    const cap = collectCapability()
    updateRun((prev) => ({
      ...prev,
      capability: cap,
      stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
    }))
    onLog('flow', `环境确认 voices=${cap.voiceCount} secure=${String(cap.isSecureContext)}`)
  }, [onLog, updateRun])

  const clearAutoStop = useCallback(() => {
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current)
      autoStopRef.current = null
    }
  }, [])

  const startSpeechTrial = useCallback((lang: 'zh-CN' | 'en-US', prompt: string, trial: number, of: number, forMatch: boolean) => {
    if (processingRef.current) return
    processingRef.current = true
    cancelSpeech()
    clearAutoStop()
    setInterim('')
    setLastSpeechText('')
    setLastResultSource('none')
    const startedAt = new Date().toISOString()
    let hadOnStart = false
    let settled = false
    let lastError: string | null = null
    let lastInterim: SpeechRecognitionResult | null = null
    let latestMatchResult: SpeechRecognitionResult | null = null
    let stableOptionId: string | null = null
    let stableTimer: number | null = null
    const startedMs = performance.now()
    onLog('flow', `听写 ${lang} prompt=${prompt} ${trial}/${of}`)

    const clearStableTimer = () => {
      if (stableTimer !== null) {
        window.clearTimeout(stableTimer)
        stableTimer = null
      }
    }

    const finishTrial = (
      result: SpeechRecognitionResult | null,
      source: RecognitionSource,
      error: string | null,
    ) => {
      if (settled) return
      settled = true
      clearStableTimer()
      const alternatives = result?.alternatives ?? []
      const top = alternatives[0]?.transcript ?? ''
      setLastSpeechText(top)
      setLastResultSource(source)
      setInterim('')
      updateRun((prev) => upsertSpeechTrial(prev, {
        lang,
        prompt,
        trial,
        of,
        skipped: false,
        startedAt,
        endedAt: new Date().toISOString(),
        elapsedMs: result?.elapsedMs ?? Math.round(performance.now() - startedMs),
        hadFinal: source === 'final',
        hadOnStart,
        resultSource: source,
        matchedPrompt: result !== null && matchesPrompt(result, prompt),
        error,
        alternatives,
        lastInterimAlternatives: lastInterim?.alternatives ?? [],
      }))
      onLog(
        'flow',
        `result source=${source} prompt=${prompt} text=${JSON.stringify(top)} error=${error ?? '-'}`,
      )
    }

    const finishMatch = (
      result: SpeechRecognitionResult | null,
      source: RecognitionSource,
      error: string | null,
    ) => {
      if (settled) return
      settled = true
      clearStableTimer()
      const texts = result?.alternatives.map((item) => item.transcript) ?? []
      const decision = matchClosedSet(texts, ZH_TRIAL_OPTIONS)
      setLastSpeechText(texts[0] ?? '')
      setLastResultSource(source)
      setInterim('')
      updateRun((prev) => ({
        ...prev,
        matchTrials: [
          ...prev.matchTrials.filter((item) => !(item.source === 'speech' && item.prompt === prompt)),
          {
            ...toMatchRecord('speech', source, prompt, texts, decision, false),
            reason: error ?? decision.reason,
          },
        ],
      }))
      onLog(
        'flow',
        `match source=${source} prompt=${prompt} picked=${decision.option?.display ?? '-'} text=${JSON.stringify(texts[0] ?? '')}`,
      )
      if (source === 'interim-stable') {
        speechRef.current.stop()
      }
    }

    speechRef.current.start({
      lang,
      onStart: () => {
        hadOnStart = true
        setListening(true)
      },
      onSpeechStart: () => {
        onLog('flow', 'onspeechstart')
      },
      onSpeechEnd: () => {
        onLog('flow', 'onspeechend')
      },
      onInterim: (result) => {
        lastInterim = result
        const text = result.alternatives[0]?.transcript ?? ''
        setInterim(text)
        onLog('flow', `interim ${result.elapsedMs}ms ${JSON.stringify(text)}`)

        if (!forMatch || settled) return
        latestMatchResult = result
        const decision = matchClosedSet(
          result.alternatives.map((item) => item.transcript),
          ZH_TRIAL_OPTIONS,
        )
        const nextOptionId = decision.kind === 'hit' ? decision.option?.id ?? null : null
        if (nextOptionId === null) {
          stableOptionId = null
          clearStableTimer()
          return
        }
        if (stableOptionId === nextOptionId && stableTimer !== null) return

        stableOptionId = nextOptionId
        clearStableTimer()
        stableTimer = window.setTimeout(() => {
          if (settled || stableOptionId !== nextOptionId || latestMatchResult === null) return
          finishMatch(latestMatchResult, 'interim-stable', null)
        }, STABLE_INTERIM_MS)
      },
      onFinal: (result) => {
        if (forMatch) {
          finishMatch(result, 'final', null)
        } else {
          finishTrial(result, 'final', null)
        }
      },
      onError: (code, raw) => {
        lastError = code
        onLog('flow', `error ${code} ${raw}`)
        if (code !== 'aborted' && lastInterim === null) {
          if (forMatch) {
            finishMatch(null, 'none', code)
          } else {
            finishTrial(null, 'none', code)
          }
          toast.error(`听写失败：${code}`)
          clearAutoStop()
          setListening(false)
          processingRef.current = false
        }
      },
      onEnd: ({ hadFinal, lastInterim: controllerInterim }) => {
        clearAutoStop()
        clearStableTimer()
        setListening(false)
        processingRef.current = false
        if (settled || hadFinal) return
        const fallback = controllerInterim ?? lastInterim
        if (forMatch) {
          finishMatch(fallback, fallback === null ? 'none' : 'interim-fallback', fallback === null ? lastError ?? 'no-result' : null)
        } else {
          finishTrial(fallback, fallback === null ? 'none' : 'interim-fallback', fallback === null ? lastError ?? 'no-result' : null)
        }
      },
    })

    autoStopRef.current = window.setTimeout(() => {
      speechRef.current.stop()
    }, MAX_LISTEN_MS)
  }, [clearAutoStop, onLog, updateRun])

  const skipSpeech = useCallback((lang: 'zh-CN' | 'en-US', prompt: string, trial: number, of: number) => {
    updateRun((prev) => ({
      ...upsertSpeechTrial(prev, {
        lang,
        prompt,
        trial,
        of,
        skipped: true,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        elapsedMs: 0,
        hadFinal: false,
        hadOnStart: false,
        resultSource: 'none',
        matchedPrompt: false,
        error: null,
        alternatives: [],
        lastInterimAlternatives: [],
      }),
      stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
    }))
  }, [updateRun])

  const stopMicTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRef.current = null
    setRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    cancelSpeech()
    speechRef.current.abort()
    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
      updateRun((prev) => ({
        ...prev,
        mic: {
          skipped: false,
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          mime: '',
          byteSize: 0,
          error: 'no-getUserMedia',
          playbackHeard: null,
        },
      }))
      toast.error('没有麦克风接口')
      return
    }
    const startedAt = new Date().toISOString()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = pickRecorderMime()
      const recorder = mime !== undefined
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/mp4' })
        if (recordUrlRef.current !== null) URL.revokeObjectURL(recordUrlRef.current)
        const url = URL.createObjectURL(blob)
        recordUrlRef.current = url
        setRecordUrl(url)
        updateRun((prev) => ({
          ...prev,
          mic: {
            skipped: false,
            startedAt,
            endedAt: new Date().toISOString(),
            mime: recorder.mimeType,
            byteSize: blob.size,
            error: null,
            playbackHeard: prev.mic?.playbackHeard ?? null,
          },
        }))
        onLog('flow', `录音结束 mime=${recorder.mimeType} size=${blob.size}`)
        stopMicTracks()
      }
      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      updateRun((prev) => ({
        ...prev,
        mic: {
          skipped: false,
          startedAt,
          endedAt: new Date().toISOString(),
          mime: '',
          byteSize: 0,
          error: message,
          playbackHeard: null,
        },
      }))
      toast.error('麦克风不可用')
    }
  }, [onLog, stopMicTracks, updateRun])

  const stopRecording = useCallback(() => {
    try {
      if (mediaRef.current !== null && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop()
      } else {
        stopMicTracks()
      }
    } catch {
      stopMicTracks()
    }
  }, [stopMicTracks])

  const handleExport = useCallback(async (mode: 'share' | 'copy' | 'download') => {
    const payload = {
      ...run,
      capability: run.capability ?? collectCapability(),
    }
    const exportPayload = buildExportPayload(payload)
    try {
      if (mode === 'download') {
        downloadExport(exportPayload)
        toast.success('已尝试下载，iPad 上更推荐点「发给自己」')
        return
      }
      if (mode === 'copy') {
        await copyExport(exportPayload)
        toast.success('已复制，发给我就行')
        return
      }
      const result = await shareExport(exportPayload)
      if (result === 'shared') toast.success('请选「信息」或「文件」发给自己')
      if (result === 'copied') toast.success('分享不可用，已复制到剪贴板')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      toast.error('导出失败，请点「复制」')
    }
  }, [run])

  const handleReset = useCallback(() => {
    speechRef.current.abort()
    cancelSpeech()
    clearRun()
    setTapped([])
    setRecordUrl(null)
    setRun(persist(createRun()))
    onLog('flow', '清空重测')
  }, [onLog])

  return (
    <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="flex items-center justify-between">
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>测试流程 v2</h2>
        <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
          {progress}/{FLOW_PHASES.length}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#F0E8E0' }}>
        <div
          style={{
            height: 6,
            borderRadius: 99,
            width: `${Math.round((progress / FLOW_PHASES.length) * 100)}%`,
            background: 'var(--color-accent)',
          }}
        />
      </div>

      {phase.id === 'intro' && (
        <>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
            跟着屏幕做就行，不必翻文档。大约 8–10 分钟。新版会记录 final 和正在听结果，并在 final 缺失时使用最后一次有效文字。
          </p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            请用主屏图标打开的 App 来测。中途可离开，进度会保留。
          </p>
          <PrimaryButton onClick={handleIntroNext}>开始</PrimaryButton>
        </>
      )}

      {phase.id === 'env' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>先确认当前环境</p>
          <EnvFacts />
          <PrimaryButton onClick={handleEnvNext}>环境无误，下一步</PrimaryButton>
        </>
      )}

      {phase.id === 'speech' && (
        <>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            {phase.lang === 'zh-CN' ? '中文听写' : '英文听写'} · 第 {phase.trial}/{phase.of} 次 · 最多等待 8 秒
          </p>
          <p style={{ margin: 0, fontSize: 40, fontWeight: 800, textAlign: 'center' }}>{phase.prompt}</p>
          <PrimaryButton
            danger={listening}
            onClick={() => {
              if (listening) {
                speechRef.current.stop()
                return
              }
              startSpeechTrial(phase.lang, phase.prompt, phase.trial, phase.of, false)
            }}
          >
            {listening ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
            {listening ? '停止' : '开始听写'}
          </PrimaryButton>
          <ResultLine label="正在听" value={interim || '—'} />
          <ResultLine label="结果" value={lastSpeechText || '—'} />
          <ResultLine label="采用来源" value={resultSourceLabel(lastResultSource)} />
          <PrimaryButton
            onClick={() => {
              goNext()
              setInterim('')
              setLastSpeechText('')
            }}
            disabled={listening || !currentSpeechDone}
          >
            {currentSpeechDone ? '下一题' : '完成本次识别后继续'}
          </PrimaryButton>
          <GhostButton onClick={() => skipSpeech(phase.lang, phase.prompt, phase.trial, phase.of)}>跳过</GhostButton>
        </>
      )}

      {phase.id === 'mic' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>麦克风通路</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            随便说一句，停止后点播放。能听到自己的声音就选「能听到」。
          </p>
          <PrimaryButton danger={recording} onClick={recording ? stopRecording : startRecording}>
            {recording ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
            {recording ? '停止录音' : '开始录音'}
          </PrimaryButton>
          {recordUrl !== null && <audio controls src={recordUrl} style={{ width: '100%' }} />}
          {run.mic?.error !== null && run.mic?.error !== undefined && run.mic.error !== '' && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-danger)' }}>{run.mic.error}</p>
          )}
          <div className="flex" style={{ gap: 8 }}>
            <PrimaryButton
              onClick={() => {
                updateRun((prev) => ({
                  ...prev,
                  mic: prev.mic === null
                    ? { skipped: false, startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), mime: '', byteSize: 0, error: 'no-recording', playbackHeard: true }
                    : { ...prev.mic, playbackHeard: true },
                  stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
                }))
              }}
            >
              能听到回放
            </PrimaryButton>
          </div>
          <GhostButton
            onClick={() => {
              updateRun((prev) => ({
                ...prev,
                mic: prev.mic === null
                  ? { skipped: false, startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), mime: '', byteSize: 0, error: 'no-recording', playbackHeard: false }
                  : { ...prev.mic, playbackHeard: false },
                stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
              }))
            }}
          >
            听不到 / 失败
          </GhostButton>
          <GhostButton
            onClick={() => {
              updateRun((prev) => ({
                ...prev,
                mic: {
                  skipped: true,
                  startedAt: new Date().toISOString(),
                  endedAt: new Date().toISOString(),
                  mime: '',
                  byteSize: 0,
                  error: null,
                  playbackHeard: null,
                },
                stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
              }))
            }}
          >
            跳过
          </GhostButton>
        </>
      )}

      {phase.id === 'tts' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>朗读 {phase.lang}</p>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 800, textAlign: 'center' }}>{phase.text}</p>
          <PrimaryButton
            onClick={() => {
              const result = speakDemo(phase.text, phase.lang)
              updateRun((prev) => ({
                ...prev,
                tts: [
                  ...prev.tts.filter((t) => t.lang !== phase.lang),
                  {
                    lang: phase.lang,
                    text: phase.text,
                    skipped: false,
                    speakOk: result.ok,
                    voiceName: result.voiceName,
                    heard: null,
                  },
                ],
              }))
            }}
          >
            <SpeakerHigh size={18} weight="bold" />
            点我朗读
          </PrimaryButton>
          <PrimaryButton
            onClick={() => {
              cancelSpeech()
              updateRun((prev) => ({
                ...prev,
                tts: upsertTts(prev.tts, {
                  lang: phase.lang,
                  text: phase.text,
                  skipped: false,
                  speakOk: prev.tts.find((t) => t.lang === phase.lang)?.speakOk ?? false,
                  voiceName: prev.tts.find((t) => t.lang === phase.lang)?.voiceName ?? '',
                  heard: true,
                }),
                stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
              }))
            }}
          >
            听到了
          </PrimaryButton>
          <GhostButton
            onClick={() => {
              cancelSpeech()
              updateRun((prev) => ({
                ...prev,
                tts: upsertTts(prev.tts, {
                  lang: phase.lang,
                  text: phase.text,
                  skipped: false,
                  speakOk: prev.tts.find((t) => t.lang === phase.lang)?.speakOk ?? false,
                  voiceName: prev.tts.find((t) => t.lang === phase.lang)?.voiceName ?? '',
                  heard: false,
                }),
                stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
              }))
            }}
          >
            没听到
          </GhostButton>
        </>
      )}

      {phase.id === 'matchTap' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>闭集点选</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>请把三个词都点一遍。</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {ZH_TRIAL_OPTIONS.map((opt) => {
              const done = tapped.includes(opt.display)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const decision = matchClosedSet([opt.display], ZH_TRIAL_OPTIONS)
                    updateRun((prev) => ({
                      ...prev,
                      matchTrials: [
                        ...prev.matchTrials.filter((m) => !(m.source === 'tap' && m.prompt === opt.display)),
                        toMatchRecord('tap', 'tap', opt.display, [opt.display], decision, false),
                      ],
                    }))
                    setTapped((prev) => (prev.includes(opt.display) ? prev : [...prev, opt.display]))
                  }}
                  style={{
                    minHeight: 72,
                    border: done ? '2px solid var(--color-accent)' : 'none',
                    borderRadius: 14,
                    background: '#FFF8F0',
                    boxShadow: 'var(--shadow-clay-button)',
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {opt.display}
                </button>
              )
            })}
          </div>
          <PrimaryButton onClick={goNext} disabled={tapped.length < 3}>
            {tapped.length < 3 ? `再点 ${3 - tapped.length} 个` : '下一步'}
          </PrimaryButton>
        </>
      )}

      {phase.id === 'matchSpeech' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>闭集听写</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>读出这个词，看会不会选中它。</p>
          <p style={{ margin: 0, fontSize: 40, fontWeight: 800, textAlign: 'center' }}>{phase.prompt}</p>
          <PrimaryButton
            danger={listening}
            onClick={() => {
              if (listening) {
                speechRef.current.stop()
                return
              }
              startSpeechTrial('zh-CN', phase.prompt, 1, 1, true)
            }}
          >
            {listening ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
            {listening ? '停止' : '读这个词'}
          </PrimaryButton>
          <ResultLine label="正在听" value={interim || '—'} />
          <MatchSummary run={run} prompt={phase.prompt} />
          <PrimaryButton onClick={goNext} disabled={listening || !currentMatchDone}>
            {currentMatchDone ? '下一题' : '完成本次识别后继续'}
          </PrimaryButton>
          <GhostButton
            onClick={() => {
              const decision = matchClosedSet([], ZH_TRIAL_OPTIONS)
              updateRun((prev) => ({
                ...prev,
                matchTrials: [
                  ...prev.matchTrials.filter((m) => !(m.source === 'speech' && m.prompt === phase.prompt)),
                  toMatchRecord('speech', 'none', phase.prompt, [], decision, true),
                ],
                stepIndex: Math.min(prev.stepIndex + 1, FLOW_PHASES.length - 1),
              }))
            }}
          >
            跳过
          </GhostButton>
        </>
      )}

      {phase.id === 'done' && (
        <>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>测完了</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            点「发给自己」存到信息或文件；明天把这份 JSON 发给我就行。进度已保存在本机，不导出也不会丢。
          </p>
          <textarea
            value={run.note}
            onChange={(e) => updateRun((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="可选备注：例如「孩子读的」「我自己读的」"
            style={{
              minHeight: 72,
              padding: '10px 14px',
              fontSize: 15,
              border: '1.5px solid #E8E0D8',
              borderRadius: 12,
              background: '#F5F5F8',
              resize: 'vertical',
            }}
          />
          <PrimaryButton onClick={() => void handleExport('share')}>
            <ShareNetwork size={18} weight="bold" />
            发给自己
          </PrimaryButton>
          <GhostButton onClick={() => void handleExport('copy')}>
            <Copy size={16} weight="bold" />
            复制 JSON
          </GhostButton>
          <GhostButton onClick={() => handleExport('download')}>
            <Export size={16} weight="bold" />
            下载文件
          </GhostButton>
          <GhostButton onClick={handleReset}>清空重测</GhostButton>
        </>
      )}

      {phase.id !== 'done' && phase.id !== 'intro' && (
        <GhostButton onClick={() => void handleExport('share')}>先导出目前的结果</GhostButton>
      )}
    </section>
  )
}

function upsertTts(
  list: TestRun['tts'],
  record: TestRun['tts'][number],
): TestRun['tts'] {
  return [...list.filter((t) => t.lang !== record.lang), record]
}

function EnvFacts() {
  const cap = collectCapability()
  const rows = [
    ['主屏 standalone', String(cap.navigatorStandalone)],
    ['display-mode', cap.displayModeStandalone ? '是' : '否'],
    ['安全上下文', cap.isSecureContext ? '是' : '否'],
    ['听写', cap.speechRecognitionCtor],
    ['麦克风', cap.mediaDevices ? '是' : '否'],
    ['朗读', cap.speechSynthesis ? '是' : '否'],
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between">
          <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-sub)' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>{value}</p>
    </div>
  )
}

function resultSourceLabel(source: RecognitionSource): string {
  switch (source) {
    case 'final':
      return '最终结果 final'
    case 'interim-stable':
      return '稳定的正在听结果'
    case 'interim-fallback':
      return '结束时采用正在听结果'
    case 'none':
      return '尚无结果'
  }
}

function MatchSummary({ run, prompt }: { run: TestRun; prompt: string }) {
  const rec = [...run.matchTrials].reverse().find((m) => m.source === 'speech' && m.prompt === prompt)
  if (rec === undefined) return null
  return (
    <div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
        {rec.kind === 'hit' ? `走「${rec.picked}」` : `没听清（${rec.reason}）`}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-sub)' }}>
        来源：{rec.recognitionSource === 'tap' ? '点选' : resultSourceLabel(rec.recognitionSource)}
      </p>
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center font-semibold active:scale-[0.98]"
      style={{
        minHeight: 48,
        border: 'none',
        borderRadius: 14,
        gap: 8,
        opacity: disabled === true ? 0.5 : 1,
        background: danger === true ? 'var(--color-danger)' : 'var(--color-accent)',
        color: '#FFFFFF',
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center font-semibold"
      style={{
        minHeight: 44,
        border: 'none',
        borderRadius: 14,
        gap: 6,
        background: '#F5F5F8',
        color: 'var(--color-text-main)',
      }}
    >
      {children}
    </button>
  )
}
