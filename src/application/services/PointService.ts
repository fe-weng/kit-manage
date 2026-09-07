import type { IPointRepository } from '@/domain/repositories/IPointRepository'
import { PointBalance } from '@/domain/models/PointBalance'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

export class PointService {
  constructor(private pointRepo: IPointRepository) {}

  async getBalance(): Promise<PointBalance> {
    const existing = await this.pointRepo.findByChildId(DEFAULT_CHILD_ID)
    if (existing) return existing
    const balance = PointBalance.create(DEFAULT_CHILD_ID)
    await this.pointRepo.save(balance)
    return balance
  }

  async earn(amount: number): Promise<PointBalance> {
    const balance = await this.getBalance()
    balance.earn(amount)
    await this.pointRepo.save(balance)
    return balance
  }

  async deduct(amount: number): Promise<PointBalance> {
    const balance = await this.getBalance()
    balance.deduct(amount)
    await this.pointRepo.save(balance)
    return balance
  }

  async spendOnPet(amount: number): Promise<boolean> {
    const balance = await this.getBalance()
    const success = balance.spendOnPet(amount)
    if (success) {
      await this.pointRepo.save(balance)
    }
    return success
  }

  async spendOnReward(amount: number): Promise<boolean> {
    const balance = await this.getBalance()
    const success = balance.spendOnReward(amount)
    if (success) {
      await this.pointRepo.save(balance)
    }
    return success
  }

  async refundReward(amount: number): Promise<void> {
    const balance = await this.getBalance()
    balance.refundReward(amount)
    await this.pointRepo.save(balance)
  }
}
