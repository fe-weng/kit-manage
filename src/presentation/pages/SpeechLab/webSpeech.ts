export type SpeechLang = 'zh-CN' | 'en-US'

export interface SpeechAlternative {
  transcript: string
  confidence: number
}

export interface SpeechRecognitionResult {
  alternatives: SpeechAlternative[]
  elapsedMs: number
}

export interface SpeechEndResult {
  hadFinal: boolean
  lastInterim: SpeechRecognitionResult | null
}

export type SpeechErrorCode =
  | 'unsupported'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'audio-capture'
  | 'language-not-supported'
  | 'bad-grammar'
  | 'unknown'

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null
  onerror: ((this: SpeechRecognitionLike, ev: SpeechErrorLike) => void) | null
  onresult: ((this: SpeechRecognitionLike, ev: SpeechResultLike) => void) | null
  onspeechstart: ((this: SpeechRecognitionLike, ev: Event) => void) | null
  onspeechend: ((this: SpeechRecognitionLike, ev: Event) => void) | null
}

interface SpeechErrorLike extends Event {
  error: string
  message?: string
}

interface SpeechResultLike extends Event {
  resultIndex: number
  results: {
    length: number
    item(index: number): SpeechResultItem
    [index: number]: SpeechResultItem
  }
}

interface SpeechResultItem {
  isFinal: boolean
  length: number
  item(index: number): { transcript: string; confidence: number }
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isWebSpeechSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

function mapError(raw: string): SpeechErrorCode {
  switch (raw) {
    case 'not-allowed':
    case 'service-not-allowed':
    case 'no-speech':
    case 'network':
    case 'aborted':
    case 'audio-capture':
    case 'language-not-supported':
    case 'bad-grammar':
      return raw
    default:
      return 'unknown'
  }
}

interface StartOptions {
  lang: SpeechLang
  onStart: () => void
  onSpeechStart: () => void
  onSpeechEnd?: () => void
  onInterim: (result: SpeechRecognitionResult) => void
  onFinal: (result: SpeechRecognitionResult) => void
  onError: (code: SpeechErrorCode, raw: string) => void
  onEnd: (result: SpeechEndResult) => void
}

export class WebSpeechController {
  private rec: SpeechRecognitionLike | null = null
  private startedAt = 0

  start(options: StartOptions): void {
    const Ctor = getSpeechRecognitionCtor()
    if (Ctor === undefined || Ctor === null) {
      options.onError('unsupported', 'SpeechRecognition missing')
      return
    }

    this.abort()

    const rec = new Ctor()
    rec.lang = options.lang
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 5

    let hadFinal = false
    let lastInterim: SpeechRecognitionResult | null = null
    this.startedAt = performance.now()

    rec.onstart = () => {
      options.onStart()
    }

    rec.onspeechstart = () => {
      options.onSpeechStart()
    }

    rec.onspeechend = () => {
      options.onSpeechEnd?.()
    }

    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1]
      if (last === undefined) return

      const alternatives: SpeechAlternative[] = []
      for (let i = 0; i < last.length; i++) {
        const item = last.item(i)
        alternatives.push({
          transcript: item.transcript,
          confidence: Number.isFinite(item.confidence) ? item.confidence : 0,
        })
      }

      const result = {
        alternatives,
        elapsedMs: Math.round(performance.now() - this.startedAt),
      }
      if (last.isFinal) {
        hadFinal = true
        options.onFinal(result)
      } else {
        lastInterim = result
        options.onInterim(result)
      }
    }

    rec.onerror = (ev) => {
      options.onError(mapError(ev.error), ev.error)
    }

    rec.onend = () => {
      if (this.rec === rec) {
        this.rec = null
      }
      options.onEnd({ hadFinal, lastInterim })
    }

    this.rec = rec
    try {
      rec.start()
    } catch (err) {
      this.rec = null
      const message = err instanceof Error ? err.message : String(err)
      options.onError('unknown', message)
    }
  }

  stop(): void {
    try {
      this.rec?.stop()
    } catch {
      this.rec = null
    }
  }

  abort(): void {
    const rec = this.rec
    this.rec = null
    if (rec === null) return
    try {
      rec.abort()
    } catch {
      // iOS 在已结束时 abort 可能抛错
    }
  }
}
