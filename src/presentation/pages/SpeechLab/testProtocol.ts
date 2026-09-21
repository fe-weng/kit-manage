import type { CapabilitySnapshot } from './capability'
import type { SpeechLang } from './webSpeech'
import type { MatchDecision } from './closedSetMatch'

export const SPEECH_LAB_EXPORT_VERSION = 1
export const SPEECH_LAB_STORAGE_KEY = 'kid-manage-speech-lab-run'

export const ZH_FLOW_WORDS = ['苹果', '香蕉', '西瓜'] as const
export const EN_FLOW_WORDS = ['apple', 'banana', 'window'] as const
export const ZH_TRIALS_PER_WORD = 3
export const EN_TRIALS_PER_WORD = 2

export interface SpeechTrialRecord {
  lang: SpeechLang
  prompt: string
  trial: number
  of: number
  skipped: boolean
  startedAt: string
  endedAt: string
  elapsedMs: number
  hadFinal: boolean
  hadOnStart: boolean
  error: string | null
  alternatives: { transcript: string; confidence: number }[]
}

export interface MicRecord {
  skipped: boolean
  startedAt: string
  endedAt: string
  mime: string
  byteSize: number
  error: string | null
  playbackHeard: boolean | null
}

export interface TtsRecord {
  lang: SpeechLang
  text: string
  skipped: boolean
  speakOk: boolean
  voiceName: string
  heard: boolean | null
}

export interface MatchRecord {
  source: 'tap' | 'speech'
  prompt: string
  skipped: boolean
  recognized: string[]
  kind: string
  reason: string
  picked: string | null
  score: number
}

export type FlowPhase =
  | { id: 'intro' }
  | { id: 'env' }
  | { id: 'speech'; lang: SpeechLang; prompt: string; trial: number; of: number }
  | { id: 'mic' }
  | { id: 'tts'; lang: SpeechLang; text: string }
  | { id: 'matchTap' }
  | { id: 'matchSpeech'; prompt: string }
  | { id: 'done' }

export interface TestRun {
  version: number
  startedAt: string
  updatedAt: string
  stepIndex: number
  note: string
  capability: CapabilitySnapshot | null
  speechTrials: SpeechTrialRecord[]
  mic: MicRecord | null
  tts: TtsRecord[]
  matchTrials: MatchRecord[]
}

export function buildFlowPhases(): FlowPhase[] {
  const phases: FlowPhase[] = [{ id: 'intro' }, { id: 'env' }]

  for (const word of ZH_FLOW_WORDS) {
    for (let trial = 1; trial <= ZH_TRIALS_PER_WORD; trial++) {
      phases.push({ id: 'speech', lang: 'zh-CN', prompt: word, trial, of: ZH_TRIALS_PER_WORD })
    }
  }
  for (const word of EN_FLOW_WORDS) {
    for (let trial = 1; trial <= EN_TRIALS_PER_WORD; trial++) {
      phases.push({ id: 'speech', lang: 'en-US', prompt: word, trial, of: EN_TRIALS_PER_WORD })
    }
  }

  phases.push({ id: 'mic' })
  phases.push({ id: 'tts', lang: 'zh-CN', text: '苹果' })
  phases.push({ id: 'tts', lang: 'en-US', text: 'apple' })
  phases.push({ id: 'matchTap' })
  for (const word of ZH_FLOW_WORDS) {
    phases.push({ id: 'matchSpeech', prompt: word })
  }
  phases.push({ id: 'done' })
  return phases
}

export const FLOW_PHASES = buildFlowPhases()

export function createRun(): TestRun {
  const now = new Date().toISOString()
  return {
    version: SPEECH_LAB_EXPORT_VERSION,
    startedAt: now,
    updatedAt: now,
    stepIndex: 0,
    note: '',
    capability: null,
    speechTrials: [],
    mic: null,
    tts: [],
    matchTrials: [],
  }
}

export function loadRun(): TestRun | null {
  try {
    const raw = localStorage.getItem(SPEECH_LAB_STORAGE_KEY)
    if (raw === null || raw === '') return null
    const parsed = JSON.parse(raw) as TestRun
    if (parsed.version !== SPEECH_LAB_EXPORT_VERSION) return null
    if (typeof parsed.stepIndex !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function saveRun(run: TestRun): void {
  const next = { ...run, updatedAt: new Date().toISOString() }
  localStorage.setItem(SPEECH_LAB_STORAGE_KEY, JSON.stringify(next))
}

export function clearRun(): void {
  localStorage.removeItem(SPEECH_LAB_STORAGE_KEY)
}

function rate(ok: number, total: number): string {
  if (total === 0) return '0/0'
  return `${ok}/${total}`
}

function summarize(run: TestRun) {
  const zh = run.speechTrials.filter((t) => t.lang === 'zh-CN' && !t.skipped)
  const en = run.speechTrials.filter((t) => t.lang === 'en-US' && !t.skipped)
  const zhFinal = zh.filter((t) => t.hadFinal).length
  const enFinal = en.filter((t) => t.hadFinal).length
  const errors = [...new Set(run.speechTrials.map((t) => t.error).filter((e) => e !== null))]
  const matchTap = run.matchTrials.filter((m) => m.source === 'tap' && !m.skipped)
  const matchSpeech = run.matchTrials.filter((m) => m.source === 'speech' && !m.skipped)

  return {
    standalone:
      run.capability?.navigatorStandalone === true || run.capability?.displayModeStandalone === true,
    isSecureContext: run.capability?.isSecureContext ?? false,
    speechCtor: run.capability?.speechRecognitionCtor ?? 'none',
    speechZhFinal: rate(zhFinal, zh.length),
    speechEnFinal: rate(enFinal, en.length),
    speechHadOnStart: run.speechTrials.some((t) => t.hadOnStart),
    speechErrors: errors,
    micPlaybackHeard: run.mic?.playbackHeard ?? null,
    micError: run.mic?.error ?? null,
    ttsHeard: run.tts.map((t) => ({ lang: t.lang, heard: t.heard, speakOk: t.speakOk })),
    matchTapHits: rate(matchTap.filter((m) => m.kind === 'hit').length, matchTap.length),
    matchSpeechHits: rate(matchSpeech.filter((m) => m.kind === 'hit').length, matchSpeech.length),
    stepIndex: run.stepIndex,
    totalSteps: FLOW_PHASES.length,
  }
}

export interface SpeechLabExport {
  app: 'kid-manage-speech-lab'
  version: number
  exportedAt: string
  summary: ReturnType<typeof summarize>
  run: TestRun
}

export function buildExportPayload(run: TestRun): SpeechLabExport {
  return {
    app: 'kid-manage-speech-lab',
    version: SPEECH_LAB_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    summary: summarize(run),
    run,
  }
}

export function exportFilename(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `speech-lab-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`
}

export async function shareExport(payload: SpeechLabExport): Promise<'shared' | 'copied' | 'aborted'> {
  const json = JSON.stringify(payload, null, 2)
  const filename = exportFilename()

  try {
    if (navigator.share !== undefined) {
      const file = new File([json], filename, { type: 'application/json' })
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
      if (nav.canShare !== undefined && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '语音实验测试结果' })
        return 'shared'
      }
      await navigator.share({ text: json, title: '语音实验测试结果' })
      return 'shared'
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return 'aborted'
  }

  await navigator.clipboard.writeText(json)
  return 'copied'
}

export async function copyExport(payload: SpeechLabExport): Promise<void> {
  await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
}

export function downloadExport(payload: SpeechLabExport): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = exportFilename()
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function upsertSpeechTrial(run: TestRun, record: SpeechTrialRecord): TestRun {
  return {
    ...run,
    speechTrials: [
      ...run.speechTrials.filter(
        (t) => !(t.lang === record.lang && t.prompt === record.prompt && t.trial === record.trial),
      ),
      record,
    ],
  }
}

export function toMatchRecord(
  source: MatchRecord['source'],
  prompt: string,
  recognized: string[],
  decision: MatchDecision,
  skipped: boolean,
): MatchRecord {
  return {
    source,
    prompt,
    skipped,
    recognized,
    kind: decision.kind,
    reason: decision.reason,
    picked: decision.option?.display ?? null,
    score: decision.score,
  }
}
