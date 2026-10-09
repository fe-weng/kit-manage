import { describe, expect, it } from 'vitest'
import {
  OUTFIT_CATALOG,
  isOutfitPackReady,
  resolveOutfitSetId,
} from './outfitCatalog'
import type { OutfitSetDefinition } from './outfitCatalog'

const PACK_FILES = [
  'young_ske.json',
  'young_tex.json',
  'young_tex.png',
  'grown_ske.json',
  'grown_tex.json',
  'grown_tex.png',
] as const

const paidSet: OutfitSetDefinition = {
  id: 'star-gown',
  name: '星星裙',
  points: 50,
  pack: 'pets/outfits/star-gown',
}

function paidPackFiles(): string[] {
  return PACK_FILES.map((name) => `${paidSet.pack}/${name}`)
}

describe('outfitCatalog', () => {
  it('本期目录只有 default', () => {
    expect(OUTFIT_CATALOG).toEqual([
      { id: 'default', name: '默认套', points: 0, pack: null },
    ])
  })

  it('空串和未知 id 解析为 default', () => {
    expect(resolveOutfitSetId('')).toBe('default')
    expect(resolveOutfitSetId('no-such-set')).toBe('default')
  })

  it('default 在文件列表为空时就绪', () => {
    const defaultSet = OUTFIT_CATALOG.find((set) => set.id === 'default')
    if (defaultSet === undefined) {
      throw new Error('目录缺少 default')
    }
    expect(isOutfitPackReady(defaultSet, [])).toBe(true)
  })

  it('付费套六文件齐才就绪，缺任意一个不就绪', () => {
    expect(isOutfitPackReady(paidSet, paidPackFiles())).toBe(true)
    expect(isOutfitPackReady(paidSet, [...PACK_FILES])).toBe(false)

    for (const name of PACK_FILES) {
      const files = paidPackFiles().filter((file) => file !== `${paidSet.pack}/${name}`)
      expect(isOutfitPackReady(paidSet, files)).toBe(false)
    }
  })
})
