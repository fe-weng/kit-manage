import type { IPointRepository } from '@/domain/repositories/IPointRepository'
import { PointBalance } from '@/domain/models/PointBalance'
import type { KidManageDB, PointBalanceRecord } from '../DexieDatabase'

export class DexiePointRepository implements IPointRepository {
  constructor(private db: KidManageDB) {}

  async findByChildId(childId: string): Promise<PointBalance | null> {
    const record = await this.db.pointBalances.get(childId)
    return record ? this.toDomain(record) : null
  }

  async save(balance: PointBalance): Promise<void> {
    await this.db.pointBalances.put(this.toPersistence(balance))
  }

  private toDomain(record: PointBalanceRecord): PointBalance {
    return new PointBalance({
      childId: record.childId,
      totalEarned: record.totalEarned,
      totalSpentOnPet: record.totalSpentOnPet,
      totalSpentOnReward: record.totalSpentOnReward,
    })
  }

  private toPersistence(balance: PointBalance): PointBalanceRecord {
    return {
      childId: balance.childId,
      totalEarned: balance.totalEarned,
      totalSpentOnPet: balance.totalSpentOnPet,
      totalSpentOnReward: balance.totalSpentOnReward,
    }
  }
}
