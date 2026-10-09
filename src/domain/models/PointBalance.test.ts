import { describe, expect, it } from 'vitest'
import { PointBalance } from './PointBalance'

function createBalance(): PointBalance {
  return new PointBalance({
    childId: 'default',
    totalEarned: 100,
    totalSpentOnPet: 30,
    totalSpentOnReward: 20,
  })
}

describe('PointBalance.reversePetSpend', () => {
  it('成功时只减少 totalSpentOnPet', () => {
    const balance = createBalance()

    balance.reversePetSpend(10)

    expect(balance.totalSpentOnPet).toBe(20)
    expect(balance.totalSpentOnReward).toBe(20)
    expect(balance.totalEarned).toBe(100)
    expect(balance.currentBalance).toBe(60)
  })

  it('金额等于宠物消费时减回至 0', () => {
    const balance = createBalance()

    balance.reversePetSpend(30)

    expect(balance.totalSpentOnPet).toBe(0)
    expect(balance.totalSpentOnReward).toBe(20)
    expect(balance.totalEarned).toBe(100)
  })

  it('金额超过宠物消费时抛错，余额不变', () => {
    const balance = createBalance()

    expect(() => balance.reversePetSpend(31)).toThrow('回滚积分不能超过宠物消费总额')
    expect(balance.totalSpentOnPet).toBe(30)
    expect(balance.totalSpentOnReward).toBe(20)
    expect(balance.totalEarned).toBe(100)
    expect(balance.currentBalance).toBe(50)
  })

  it('金额不为正时抛错，余额不变', () => {
    const balance = createBalance()

    expect(() => balance.reversePetSpend(0)).toThrow('回滚积分必须为正数')
    expect(() => balance.reversePetSpend(-5)).toThrow('回滚积分必须为正数')
    expect(balance.totalSpentOnPet).toBe(30)
    expect(balance.totalSpentOnReward).toBe(20)
    expect(balance.totalEarned).toBe(100)
    expect(balance.currentBalance).toBe(50)
  })
})
