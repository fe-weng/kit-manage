import { DEFAULT_OUTFIT_SET_ID } from '../models/Pet'

export interface OutfitSetDefinition {
  id: string
  name: string
  points: number
  /**
   * 相对 public 的目录。
   * default 为 null，附件画在 young/grown 身体包里。
   * 付费套目录内同时有 young_* 与 grown_* 各一套 ske/tex/png。
   */
  pack: string | null
}

const OUTFIT_PACK_FILES = [
  'young_ske.json',
  'young_tex.json',
  'young_tex.png',
  'grown_ske.json',
  'grown_tex.json',
  'grown_tex.png',
] as const

export const OUTFIT_CATALOG: readonly OutfitSetDefinition[] = [
  {
    id: DEFAULT_OUTFIT_SET_ID,
    name: '默认套',
    points: 0,
    pack: null,
  },
]

export function resolveOutfitSetId(id: string): string {
  const known = OUTFIT_CATALOG.some((set) => set.id === id)
  return known ? id : DEFAULT_OUTFIT_SET_ID
}

export function isOutfitPackReady(
  def: OutfitSetDefinition,
  files: readonly string[],
): boolean {
  if (def.id === DEFAULT_OUTFIT_SET_ID || def.pack === null) return true
  const directory = def.pack.endsWith('/') ? def.pack.slice(0, -1) : def.pack
  return OUTFIT_PACK_FILES.every((name) => files.includes(`${directory}/${name}`))
}
