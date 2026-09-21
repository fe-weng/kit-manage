import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Microphone,
  SpeakerHigh,
  Stop,
} from '@phosphor-icons/react'
import { toast } from '@/shared/toast'
import { ROUTES } from '@/shared/constants'
import { collectCapability, pickRecorderMime, type CapabilitySnapshot } from './capability'
import { EN_TRIAL_OPTIONS, ZH_TRIAL_OPTIONS, matchClosedSet, type MatchDecision } from './closedSetMatch'
import { cancelSpeech, speakDemo } from './tts'
import { WebSpeechController, type SpeechLang } from './webSpeech'
import TestFlow from './TestFlow'

type LabTab = 'flow' | 'env' | 'speech' | 'mic' | 'tts' | 'match'

interface LabLogEntry {
  id: number
  at: string
  channel: string
  message: string
}

const TABS: { id: LabTab; label: string }[] = [
  { id: 'flow', label: '流程' },
  { id: 'env', label: '环境' },
  { id: 'speech', label: '听写 A' },
  { id: 'mic', label: '麦克风' },
  { id: 'tts', label: '朗读' },
  { id: 'match', label: '闭集' },
]

function formatNow(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

function boolLabel(value: boolean): string {
  return value ? '是' : '否'
}

export default function SpeechLabPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<LabTab>('flow')
  const [cap, setCap] = useState<CapabilitySnapshot>(() => collectCapability())
  const [logs, setLogs] = useState<LabLogEntry[]>([])
  const logIdRef = useRef(0)

  const speechRef = useRef(new WebSpeechController())
  const autoStopRef = useRef<number | null>(null)
  const [lang, setLang] = useState<SpeechLang>('zh-CN')
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [finalText, setFinalText] = useState('')
  const [alternatives, setAlternatives] = useState<string[]>([])

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordUrlRef = useRef<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [recordUrl, setRecordUrl] = useState<string | null>(null)
  const [recordMime, setRecordMime] = useState('')
  const [micError, setMicError] = useState('')

  const [matchDecision, setMatchDecision] = useState<MatchDecision | null>(null)
  const [matchSource, setMatchSource] = useState<'speech' | 'tap'>('speech')

  const appendLog = useCallback((channel: string, message: string) => {
    logIdRef.current += 1
    const entry: LabLogEntry = {
      id: logIdRef.current,
      at: formatNow(),
      channel,
      message,
    }
    setLogs((prev) => [...prev, entry].slice(-80))
  }, [])

  const refreshCapability = useCallback(() => {
    const next = collectCapability()
    setCap(next)
    appendLog('env', `刷新能力：standalone=${String(next.navigatorStandalone)} displayMode=${String(next.displayModeStandalone)} speech=${next.speechRecognitionCtor} voices=${next.voiceCount}`)
  }, [appendLog])

  useEffect(() => {
    refreshCapability()
    const onVoices = () => {
      const next = collectCapability()
      setCap(next)
      appendLog('tts', `voiceschanged，共 ${next.voiceCount} 个音色`)
    }
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.addEventListener('voiceschanged', onVoices)
    }
    appendLog('env', '进入语音实验页')
    return () => {
      if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.removeEventListener('voiceschanged', onVoices)
      }
      speechRef.current.abort()
      cancelSpeech()
      if (autoStopRef.current !== null) {
        window.clearTimeout(autoStopRef.current)
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (recordUrlRef.current !== null) {
        URL.revokeObjectURL(recordUrlRef.current)
      }
    }
  }, [appendLog, refreshCapability])

  const clearAutoStop = useCallback(() => {
    if (autoStopRef.current !== null) {
      window.clearTimeout(autoStopRef.current)
      autoStopRef.current = null
    }
  }, [])

  const stopMicTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    mediaRef.current = null
    setRecording(false)
  }, [])

  const startListen = useCallback(() => {
    cancelSpeech()
    if (recording) {
      try {
        mediaRef.current?.stop()
      } catch {
        stopMicTracks()
      }
    }

    setInterim('')
    setFinalText('')
    setAlternatives([])
    appendLog('speech', `start lang=${lang}`)

    speechRef.current.start({
      lang,
      onStart: () => {
        setListening(true)
        appendLog('speech', 'onstart')
      },
      onSpeechStart: () => {
        appendLog('speech', 'onspeechstart')
      },
      onInterim: (text) => {
        setInterim(text)
      },
      onFinal: (result) => {
        const texts = result.alternatives.map((a) => a.transcript)
        const top = texts[0] ?? ''
        setFinalText(top)
        setAlternatives(texts)
        setInterim('')
        appendLog(
          'speech',
          `final ${result.elapsedMs}ms conf=${result.alternatives[0]?.confidence ?? 0} alts=${texts.map((t) => JSON.stringify(t)).join(' | ')}`,
        )
      },
      onError: (code, raw) => {
        appendLog('speech', `error code=${code} raw=${raw}`)
        toast.error(`听写失败：${code}`)
      },
      onEnd: (hadFinal) => {
        clearAutoStop()
        setListening(false)
        appendLog('speech', `onend hadFinal=${String(hadFinal)}`)
      },
    })

    clearAutoStop()
    autoStopRef.current = window.setTimeout(() => {
      speechRef.current.stop()
    }, 4000)
  }, [appendLog, clearAutoStop, lang, recording, stopMicTracks])

  const stopListen = useCallback(() => {
    clearAutoStop()
    speechRef.current.stop()
  }, [clearAutoStop])

  const startRecording = useCallback(async () => {
    setMicError('')
    cancelSpeech()
    speechRef.current.abort()
    setListening(false)

    if (navigator.mediaDevices === undefined || navigator.mediaDevices.getUserMedia === undefined) {
      setMicError('当前环境没有 getUserMedia')
      appendLog('mic', 'getUserMedia 不存在')
      return
    }

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
        if (recordUrlRef.current !== null) {
          URL.revokeObjectURL(recordUrlRef.current)
        }
        const url = URL.createObjectURL(blob)
        recordUrlRef.current = url
        setRecordUrl(url)
        setRecordMime(recorder.mimeType)
        appendLog('mic', `录音结束 mime=${recorder.mimeType} size=${blob.size}`)
        stopMicTracks()
      }
      recorder.onerror = () => {
        appendLog('mic', 'MediaRecorder error')
        setMicError('录音出错')
        stopMicTracks()
      }
      mediaRef.current = recorder
      recorder.start()
      setRecording(true)
      appendLog('mic', `录音开始 mime=${recorder.mimeType}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setMicError(message)
      appendLog('mic', `getUserMedia 失败：${message}`)
      toast.error('麦克风权限被拒绝或不可用')
    }
  }, [appendLog, stopMicTracks])

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

  const handleSpeak = useCallback((text: string) => {
    speechRef.current.abort()
    const result = speakDemo(text, lang)
    appendLog('tts', result.ok ? `speak "${text}" voice=${result.voiceName}` : 'speechSynthesis 不可用')
    if (!result.ok) toast.error('当前环境没有语音合成')
  }, [appendLog, lang])

  const applyMatchFromTranscripts = useCallback((transcripts: string[]) => {
    const options = lang === 'zh-CN' ? ZH_TRIAL_OPTIONS : EN_TRIAL_OPTIONS
    const decision = matchClosedSet(transcripts, options)
    setMatchDecision(decision)
    const picked = decision.option?.display ?? '-'
    appendLog(
      'match',
      `${decision.kind}/${decision.reason} pick=${picked} score=${formatScore(decision.score)} second=${formatScore(decision.secondScore)} from=${JSON.stringify(decision.from)}`,
    )
  }, [appendLog, lang])

  const handleMatchListen = useCallback(() => {
    setMatchDecision(null)
    cancelSpeech()
    setInterim('')
    appendLog('match', `闭集听写 lang=${lang}`)
    speechRef.current.start({
      lang,
      onStart: () => {
        setListening(true)
      },
      onSpeechStart: () => {
        appendLog('match', 'onspeechstart')
      },
      onInterim: (text) => {
        setInterim(text)
      },
      onFinal: (result) => {
        const texts = result.alternatives.map((a) => a.transcript)
        setFinalText(texts[0] ?? '')
        setAlternatives(texts)
        applyMatchFromTranscripts(texts)
      },
      onError: (code, raw) => {
        appendLog('match', `error code=${code} raw=${raw}`)
        toast.error(`听写失败：${code}`)
      },
      onEnd: (hadFinal) => {
        clearAutoStop()
        setListening(false)
        if (!hadFinal) {
          applyMatchFromTranscripts([])
        }
      },
    })
    clearAutoStop()
    autoStopRef.current = window.setTimeout(() => {
      speechRef.current.stop()
    }, 4000)
  }, [appendLog, applyMatchFromTranscripts, clearAutoStop, lang])

  const handleCopyLog = useCallback(async () => {
    const envLines = [
      `capturedAt=${cap.capturedAt}`,
      `href=${cap.href}`,
      `ua=${cap.userAgent}`,
      `secure=${String(cap.isSecureContext)} protocol=${cap.protocol}`,
      `navigator.standalone=${String(cap.navigatorStandalone)}`,
      `display-mode:standalone=${String(cap.displayModeStandalone)}`,
      `speech=${cap.speechRecognitionCtor}`,
      `mediaDevices=${String(cap.mediaDevices)} mediaRecorder=${String(cap.mediaRecorder)} mimes=${cap.mediaRecorderMimes.join(',')}`,
      `tts=${String(cap.speechSynthesis)} voices=${cap.voiceCount}`,
      ...cap.voices.map((v) => `voice ${v.lang} ${v.name} local=${String(v.localService)} default=${String(v.default)}`),
      '---',
      ...logs.map((e) => `[${e.at}] [${e.channel}] ${e.message}`),
    ]
    const text = envLines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('实验日志已复制')
    } catch {
      toast.error('复制失败，请手动选中下方日志')
    }
  }, [cap, logs])

  const trialOptions = lang === 'zh-CN' ? ZH_TRIAL_OPTIONS : EN_TRIAL_OPTIONS
  const demoWord = lang === 'zh-CN' ? '苹果' : 'apple'

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 16px)',
        paddingBottom: '24px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '16px',
      }}
    >
      <header className="flex items-center" style={{ gap: '10px' }}>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="flex items-center justify-center bg-card shadow-clay-button active:scale-[0.98]"
          style={{ width: 44, height: 44, borderRadius: 14, border: 'none' }}
          aria-label="返回设置"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
            语音实验
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-sub)', margin: '2px 0 0' }}>
            iPad 主屏 PWA 路线验证，不接积分
          </p>
        </div>
      </header>

      <div className="bg-card rounded-clay shadow-clay" style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-main)', margin: 0 }}>
          主屏 {boolLabel(cap.navigatorStandalone === true || cap.displayModeStandalone)}
          {' · '}听写 {cap.speechRecognition ? cap.speechRecognitionCtor : '无'}
          {' · '}麦克风 {boolLabel(cap.mediaDevices)}
          {' · '}朗读 {boolLabel(cap.speechSynthesis)}
        </p>
      </div>

      <div
        className="flex bg-card rounded-clay shadow-clay overflow-hidden"
        style={{ padding: 4, gap: 4 }}
      >
        {TABS.map((item) => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className="flex-1"
              style={{
                minHeight: 40,
                border: 'none',
                borderRadius: 12,
                background: active ? 'var(--color-accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--color-text-sub)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {tab !== 'flow' && (
      <div className="flex" style={{ gap: 8 }}>
        {(['zh-CN', 'en-US'] as const).map((item) => {
          const active = lang === item
          return (
            <button
              key={item}
              type="button"
              onClick={() => {
                setLang(item)
                setMatchDecision(null)
                setFinalText('')
                setAlternatives([])
                appendLog('env', `切换语言 ${item}`)
              }}
              style={{
                minHeight: 40,
                padding: '0 14px',
                border: 'none',
                borderRadius: 12,
                background: active ? 'var(--color-primary)' : '#FFFFFF',
                color: active ? '#FFFFFF' : 'var(--color-text-main)',
                fontWeight: 600,
                boxShadow: 'var(--shadow-clay-button)',
              }}
            >
              {item === 'zh-CN' ? '中文 zh-CN' : '英文 en-US'}
            </button>
          )
        })}
      </div>
      )}

      {tab === 'flow' && <TestFlow onLog={appendLog} />}

      {tab === 'env' && (
        <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>能力探测</h2>
          <Fact label="navigator.standalone" value={String(cap.navigatorStandalone)} />
          <Fact label="display-mode: standalone" value={boolLabel(cap.displayModeStandalone)} />
          <Fact label="isSecureContext" value={boolLabel(cap.isSecureContext)} />
          <Fact label="SpeechRecognition" value={cap.speechRecognitionCtor} />
          <Fact label="getUserMedia" value={boolLabel(cap.mediaDevices)} />
          <Fact label="MediaRecorder" value={boolLabel(cap.mediaRecorder)} />
          <Fact label="录音 MIME" value={cap.mediaRecorderMimes.join(', ') || '无'} />
          <Fact label="speechSynthesis" value={boolLabel(cap.speechSynthesis)} />
          <Fact label="音色数量" value={String(cap.voiceCount)} />
          <p style={{ fontSize: 12, color: 'var(--color-text-sub)', margin: 0, wordBreak: 'break-all' }}>
            {cap.userAgent}
          </p>
          {cap.voices.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--color-text-sub)' }}>
              {cap.voices.slice(0, 12).map((v) => (
                <li key={`${v.lang}-${v.name}`}>
                  {v.lang} · {v.name}
                  {v.localService ? ' · 本地' : ''}
                  {v.default ? ' · 默认' : ''}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={refreshCapability}
            className="bg-accent text-white font-semibold active:scale-[0.98]"
            style={{ minHeight: 44, border: 'none', borderRadius: 14 }}
          >
            重新探测
          </button>
        </section>
      )}

      {tab === 'speech' && (
        <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>路线 A · Web Speech</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            点开始后请在 4 秒内读一个词。这是 iPad 主屏 PWA 的一票否决项。
          </p>
          <div className="flex" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={listening ? stopListen : startListen}
              className="flex-1 flex items-center justify-center font-semibold active:scale-[0.98]"
              style={{
                minHeight: 48,
                border: 'none',
                borderRadius: 14,
                gap: 8,
                background: listening ? 'var(--color-danger)' : 'var(--color-accent)',
                color: '#FFFFFF',
              }}
            >
              {listening ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
              {listening ? '停止' : '开始听写'}
            </button>
          </div>
          <ResultBox label="中间结果" value={interim || '—'} />
          <ResultBox label="最终结果" value={finalText || '—'} />
          {alternatives.length > 0 && (
            <ResultBox label="全部候选" value={alternatives.join('  /  ')} />
          )}
        </section>
      )}

      {tab === 'mic' && (
        <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>麦克风通路</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            不识别内容，只验证主屏 PWA 能否拿到麦克风。若听写失败但这里能录音，才值得后续做离线模型。
          </p>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className="flex items-center justify-center font-semibold active:scale-[0.98]"
            style={{
              minHeight: 48,
              border: 'none',
              borderRadius: 14,
              gap: 8,
              background: recording ? 'var(--color-danger)' : 'var(--color-accent)',
              color: '#FFFFFF',
            }}
          >
            {recording ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
            {recording ? '停止录音' : '开始录音'}
          </button>
          {micError !== '' && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-danger)' }}>{micError}</p>
          )}
          {recordUrl !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-sub)' }}>MIME：{recordMime || '未知'}</p>
              <audio controls src={recordUrl} style={{ width: '100%' }} />
            </div>
          )}
        </section>
      )}

      {tab === 'tts' && (
        <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>示范朗读</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            游戏里选项要能先听再读。开始听写时会自动 cancel，避免把自己的声音录进去。
          </p>
          <button
            type="button"
            onClick={() => handleSpeak(demoWord)}
            className="flex items-center justify-center font-semibold active:scale-[0.98]"
            style={{
              minHeight: 48,
              border: 'none',
              borderRadius: 14,
              gap: 8,
              background: 'var(--color-secondary)',
              color: '#FFFFFF',
            }}
          >
            <SpeakerHigh size={18} weight="bold" />
            朗读「{demoWord}」
          </button>
          <button
            type="button"
            onClick={() => {
              cancelSpeech()
              appendLog('tts', 'cancel')
            }}
            style={{
              minHeight: 44,
              border: 'none',
              borderRadius: 14,
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-clay-button)',
              fontWeight: 600,
            }}
          >
            停止朗读
          </button>
        </section>
      )}

      {tab === 'match' && (
        <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>闭集选路</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-sub)' }}>
            模拟游戏：读一个选项，看匹配层会选哪条路。点选始终可用。
          </p>
          <div className="flex" style={{ gap: 8 }}>
            {(['speech', 'tap'] as const).map((src) => {
              const active = matchSource === src
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setMatchSource(src)}
                  style={{
                    minHeight: 40,
                    padding: '0 12px',
                    border: 'none',
                    borderRadius: 12,
                    background: active ? 'var(--color-accent)' : '#F5F5F8',
                    color: active ? '#FFFFFF' : 'var(--color-text-main)',
                    fontWeight: 600,
                  }}
                >
                  {src === 'speech' ? '用听写' : '用点选'}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {trialOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (matchSource === 'tap') {
                    applyMatchFromTranscripts([opt.display])
                    return
                  }
                  handleSpeak(opt.display)
                }}
                className="active:scale-[0.98]"
                style={{
                  minHeight: 72,
                  border: matchDecision?.option?.id === opt.id ? '2px solid var(--color-accent)' : 'none',
                  borderRadius: 14,
                  background: '#FFF8F0',
                  boxShadow: 'var(--shadow-clay-button)',
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{opt.display}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>{opt.phonetic}</div>
              </button>
            ))}
          </div>
          {matchSource === 'speech' && (
            <button
              type="button"
              onClick={listening ? stopListen : handleMatchListen}
              className="flex items-center justify-center font-semibold active:scale-[0.98]"
              style={{
                minHeight: 48,
                border: 'none',
                borderRadius: 14,
                gap: 8,
                background: listening ? 'var(--color-danger)' : 'var(--color-accent)',
                color: '#FFFFFF',
              }}
            >
              {listening ? <Stop size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
              {listening ? '停止' : '读一个选项'}
            </button>
          )}
          {interim !== '' && <ResultBox label="正在听" value={interim} />}
          {matchDecision !== null && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: matchDecision.kind === 'hit' ? '#E8F8F5' : '#FFF3E0',
              }}
            >
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                {matchDecision.kind === 'hit'
                  ? `走「${matchDecision.option?.display}」`
                  : '没听清，请再说一次或点选'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-sub)' }}>
                {matchDecision.reason} · {formatScore(matchDecision.score)} · 来自 {matchDecision.from || '（空）'}
              </p>
            </div>
          )}
        </section>
      )}

      <section className="bg-card rounded-clay shadow-clay" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="flex items-center justify-between">
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>实验日志</h2>
          <button
            type="button"
            onClick={handleCopyLog}
            className="flex items-center"
            style={{
              minHeight: 36,
              padding: '0 12px',
              border: 'none',
              borderRadius: 10,
              background: '#F5F5F8',
              gap: 6,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Copy size={14} weight="bold" />
            复制
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            maxHeight: 220,
            overflow: 'auto',
            fontSize: 11,
            lineHeight: 1.45,
            background: '#F5F5F8',
            borderRadius: 12,
            padding: 10,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {logs.length === 0
            ? '暂无日志'
            : logs.map((e) => `[${e.at}] [${e.channel}] ${e.message}`).join('\n')}
        </pre>
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between" style={{ gap: 12 }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-main)', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

function ResultBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-sub)' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--color-text-main)' }}>
        {value}
      </p>
    </div>
  )
}
