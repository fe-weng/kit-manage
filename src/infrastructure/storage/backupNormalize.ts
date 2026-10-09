import { DEFAULT_OUTFIT_SET_ID } from '@/domain/models/Pet'
import { resolveOutfitSetId } from '@/domain/outfits/outfitCatalog'

export function normalizeOutfitSetId(outfitSetId: unknown): string {
  if (typeof outfitSetId !== 'string') return DEFAULT_OUTFIT_SET_ID
  return resolveOutfitSetId(outfitSetId)
}

export function normalizeOutfitLogs(outfitLogs: unknown): unknown[] {
  if (outfitLogs === undefined) return []
  if (!Array.isArray(outfitLogs)) {
    throw new Error('备份数据 outfitLogs 格式错误')
  }
  return outfitLogs
}
