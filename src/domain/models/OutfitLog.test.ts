import { describe, expect, it } from 'vitest'
import { OutfitLog } from './OutfitLog'

function createLog(pointsCost: number): OutfitLog {
  return new OutfitLog({
    id: 'log-1',
    childId: 'default',
    outfitSetId: 'star-gown',
    outfitName: '星星裙',
    pointsCost,
    redeemedAt: 1,
  })
}

describe('OutfitLog', () => {
  it('pointsCost 为 0 时创建失败', () => {
    expect(() => createLog(0)).toThrow('兑换积分必须为正整数')
  })

  it('pointsCost 为负数时创建失败', () => {
    expect(() => createLog(-1)).toThrow('兑换积分必须为正整数')
  })

  it('pointsCost 不是整数时创建失败', () => {
    expect(() => createLog(1.5)).toThrow('兑换积分必须为正整数')
  })
})
