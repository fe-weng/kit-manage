export interface MatchOption {
  id: string
  display: string
  phonetic: string
  aliases: string[]
}

export type MatchKind = 'hit' | 'retry'

export interface MatchDecision {
  kind: MatchKind
  reason: 'ok' | 'below-threshold' | 'ambiguous' | 'empty'
  option: MatchOption | null
  score: number
  secondScore: number
  from: string
}

export type MatchEvidence = 'exact' | 'contains' | 'fuzzy'

export interface MatchAcceptance {
  evidence: MatchEvidence
  stabilityMs: number
}

const THRESHOLD = 0.72
const MARGIN = 0.12
const CONTAINS_STABILITY_MS = 250
const FUZZY_STABILITY_MS = 600

export const ZH_TRIAL_OPTIONS: MatchOption[] = [
  {
    id: 'apple',
    display: '苹果',
    phonetic: 'pingguo',
    aliases: ['苹果', '蘋果', 'pingguo', 'ping guo', 'ping2 guo3'],
  },
  {
    id: 'banana',
    display: '香蕉',
    phonetic: 'xiangjiao',
    aliases: ['香蕉', 'xiangjiao', 'xiang jiao'],
  },
  {
    id: 'watermelon',
    display: '西瓜',
    phonetic: 'xigua',
    aliases: ['西瓜', 'xigua', 'xi gua'],
  },
]

export const EN_TRIAL_OPTIONS: MatchOption[] = [
  {
    id: 'apple',
    display: 'apple',
    phonetic: 'apple',
    aliases: ['apple', 'apples'],
  },
  {
    id: 'banana',
    display: 'banana',
    phonetic: 'banana',
    aliases: ['banana', 'bananas'],
  },
  {
    id: 'window',
    display: 'window',
    phonetic: 'window',
    aliases: ['window', 'windows'],
  },
]

export function normalizeSpeech(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s.,!?;:'"()[\]{}，。！？；：、""''·\-]/g, '')
}

function normalizedCandidates(option: MatchOption): string[] {
  return [option.display, option.phonetic, ...option.aliases]
    .map(normalizeSpeech)
    .filter((item) => item.length > 0)
}

export function getMatchAcceptance(
  transcripts: string[],
  option: MatchOption,
): MatchAcceptance {
  const texts = transcripts.map(normalizeSpeech).filter((item) => item.length > 0)
  const candidates = normalizedCandidates(option)

  if (texts.some((text) => candidates.some((candidate) => text === candidate))) {
    return { evidence: 'exact', stabilityMs: 0 }
  }
  if (texts.some((text) => candidates.some((candidate) => text.includes(candidate)))) {
    return { evidence: 'contains', stabilityMs: CONTAINS_STABILITY_MS }
  }
  return { evidence: 'fuzzy', stabilityMs: FUZZY_STABILITY_MS }
}

export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const rows: number[][] = []
  for (let i = 0; i <= m; i++) {
    const row: number[] = []
    for (let j = 0; j <= n; j++) {
      row.push(0)
    }
    rows.push(row)
  }

  for (let i = 0; i <= m; i++) {
    rows[i]![0] = i
  }
  for (let j = 0; j <= n; j++) {
    rows[0]![j] = j
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      rows[i]![j] = Math.min(
        rows[i - 1]![j]! + 1,
        rows[i]![j - 1]! + 1,
        rows[i - 1]![j - 1]! + cost,
      )
    }
  }

  return rows[m]![n]!
}

export function scoreOption(recognized: string, option: MatchOption): number {
  const n = normalizeSpeech(recognized)
  if (n.length === 0) return 0

  const candidates = normalizedCandidates(option)
  let best = 0
  for (const c of candidates) {
    if (c.length === 0) continue
    if (n === c || n.includes(c)) {
      best = Math.max(best, 1)
      continue
    }
    const dist = levenshtein(n, c)
    const maxLen = Math.max(n.length, c.length)
    const sim = maxLen === 0 ? 0 : 1 - dist / maxLen
    best = Math.max(best, sim)
  }
  return best
}

export function matchClosedSet(transcripts: string[], options: MatchOption[]): MatchDecision {
  const texts = transcripts.map((t) => t.trim()).filter((t) => t.length > 0)
  if (texts.length === 0) {
    return {
      kind: 'retry',
      reason: 'empty',
      option: null,
      score: 0,
      secondScore: 0,
      from: '',
    }
  }

  const ranked = options
    .map((option) => {
      let score = 0
      let from = ''
      for (const text of texts) {
        const current = scoreOption(text, option)
        if (current > score) {
          score = current
          from = text
        }
      }
      return { option, score, from }
    })
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]
  const bestOption = best?.option ?? null
  const bestScore = best?.score ?? 0
  const bestFrom = best?.from ?? ''
  const secondScore = ranked[1]?.score ?? 0

  if (bestOption === null || bestScore < THRESHOLD) {
    return {
      kind: 'retry',
      reason: 'below-threshold',
      option: bestOption,
      score: bestScore,
      secondScore,
      from: bestFrom,
    }
  }

  if (bestScore - secondScore < MARGIN && secondScore > 0) {
    return {
      kind: 'retry',
      reason: 'ambiguous',
      option: bestOption,
      score: bestScore,
      secondScore,
      from: bestFrom,
    }
  }

  return {
    kind: 'hit',
    reason: 'ok',
    option: bestOption,
    score: bestScore,
    secondScore,
    from: bestFrom,
  }
}
