import { describe, expect, it } from 'vitest'
import { normalizeOutfitLogs, normalizeOutfitSetId } from './backupNormalize'

describe('normalizeOutfitSetId', () => {
  it('缺 outfitSetId 写成 default', () => {
    expect(normalizeOutfitSetId(undefined)).toBe('default')
    expect(normalizeOutfitSetId('')).toBe('default')
  })

  it('未知套装写成 default', () => {
    expect(normalizeOutfitSetId('star-gown')).toBe('default')
  })

  it('目录中的 id 保持不变', () => {
    expect(normalizeOutfitSetId('default')).toBe('default')
  })
})

describe('normalizeOutfitLogs', () => {
  it('缺失当空数组', () => {
    expect(normalizeOutfitLogs(undefined)).toEqual([])
  })

  it('非数组则拒绝', () => {
    expect(() => normalizeOutfitLogs(null)).toThrow('备份数据 outfitLogs 格式错误')
    expect(() => normalizeOutfitLogs({})).toThrow('备份数据 outfitLogs 格式错误')
    expect(() => normalizeOutfitLogs('logs')).toThrow('备份数据 outfitLogs 格式错误')
  })

  it('数组原样保留', () => {
    const logs = [{ id: 'log-1', outfitSetId: 'star-gown' }]
    expect(normalizeOutfitLogs(logs)).toBe(logs)
  })
})
