import type { SpeechLang } from './webSpeech'

export function listVoicesFor(lang: SpeechLang): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return []
  const prefix = lang.slice(0, 2)
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function speakDemo(text: string, lang: SpeechLang): { ok: boolean; voiceName: string } {
  if (typeof speechSynthesis === 'undefined') {
    return { ok: false, voiceName: '' }
  }

  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9

  const voices = listVoicesFor(lang)
  const preferred =
    voices.find((v) => v.localService) ??
    voices.find((v) => v.default) ??
    voices[0]
  if (preferred !== undefined) {
    utterance.voice = preferred
  }

  speechSynthesis.speak(utterance)
  return { ok: true, voiceName: preferred?.name ?? '(default)' }
}

export function cancelSpeech(): void {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
}
