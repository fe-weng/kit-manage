export interface VoiceInfo {
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export interface CapabilitySnapshot {
  capturedAt: string
  userAgent: string
  isSecureContext: boolean
  protocol: string
  href: string
  navigatorStandalone: boolean | null
  displayModeStandalone: boolean
  speechRecognition: boolean
  speechRecognitionCtor: 'SpeechRecognition' | 'webkitSpeechRecognition' | 'none'
  mediaDevices: boolean
  mediaRecorder: boolean
  mediaRecorderMimes: string[]
  speechSynthesis: boolean
  voiceCount: number
  voices: VoiceInfo[]
}

const RECORDER_MIME_CANDIDATES = [
  'audio/mp4',
  'audio/aac',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mpeg',
]

export function collectCapability(): CapabilitySnapshot {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  const w = window as Window & {
    SpeechRecognition?: unknown
    webkitSpeechRecognition?: unknown
  }

  let speechRecognitionCtor: CapabilitySnapshot['speechRecognitionCtor'] = 'none'
  if (w.SpeechRecognition !== undefined) {
    speechRecognitionCtor = 'SpeechRecognition'
  } else if (w.webkitSpeechRecognition !== undefined) {
    speechRecognitionCtor = 'webkitSpeechRecognition'
  }

  const recMimes =
    typeof MediaRecorder !== 'undefined'
      ? RECORDER_MIME_CANDIDATES.filter((m) => MediaRecorder.isTypeSupported(m))
      : []

  const voices =
    typeof speechSynthesis !== 'undefined'
      ? speechSynthesis.getVoices().map((v) => ({
          name: v.name,
          lang: v.lang,
          localService: v.localService,
          default: v.default,
        }))
      : []

  return {
    capturedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    href: window.location.href,
    navigatorStandalone: typeof nav.standalone === 'boolean' ? nav.standalone : null,
    displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
    speechRecognition: speechRecognitionCtor !== 'none',
    speechRecognitionCtor,
    mediaDevices: navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined,
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    mediaRecorderMimes: recMimes,
    speechSynthesis: typeof speechSynthesis !== 'undefined',
    voiceCount: voices.length,
    voices,
  }
}

export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return RECORDER_MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m))
}
