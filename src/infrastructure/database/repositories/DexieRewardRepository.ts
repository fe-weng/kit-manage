import type { IRewardRepository } from '@/domain/repositories/IRewardRepository'
import { Reward } from '@/domain/models/Reward'
import { RewardLog } from '@/domain/models/RewardLog'
import { Category } from '@/domain/models/Category'
import type { KidManageDB, RewardRecord, RewardLogRecord } from '../DexieDatabase'

export class DexieRewardRepository implements IRewardRepository {
  constructor(private db: KidManageDB) {}

  async findById(id: string): Promise<Reward | null> {
    const record = await this.db.rewards.get(id)
    return record ? this.toDomain(record) : null
  }

  async findAll(): Promise<Reward[]> {
    const records = await this.db.rewards.toArray()
    return records.map((r) => this.toDomain(r))
  }

  async findActive(): Promise<Reward[]> {
    const records = await this.db.rewards.where('isActive').equals(1).toArray()
    return records.map((r) => this.toDomain(r))
  }

  async save(reward: Reward): Promise<void> {
    await this.db.rewards.put(this.toPersistence(reward))
  }

  async delete(id: string): Promise<void> {
    await this.db.rewards.delete(id)
  }

  async findLogsByChildId(childId: string): Promise<RewardLog[]> {
    const records = await this.db.rewardLogs.where('childId').equals(childId).toArray()
    return records.map((r) => this.toLogDomain(r))
  }

  async findPendingLogsByChildId(childId: string): Promise<RewardLog[]> {
    const records = await this.db.rewardLogs
      .where('[childId+status]')
      .equals([childId, 'pending'])
      .toArray()
    return records.map((r) => this.toLogDomain(r))
  }

  async findLogById(logId: string): Promise<RewardLog | null> {
    const record = await this.db.rewardLogs.get(logId)
    return record ? this.toLogDomain(record) : null
  }

  async findPendingLogByRewardId(rewardId: string, childId: string): Promise<RewardLog | null> {
    const record = await this.db.rewardLogs
      .where('[rewardId+childId+status]')
      .equals([rewardId, childId, 'pending'])
      .first()
    return record ? this.toLogDomain(record) : null
  }

  async saveLog(log: RewardLog): Promise<void> {
    await this.db.rewardLogs.put(this.toLogPersistence(log))
  }

  async findAllCategories(): Promise<Category[]> {
    const records = await this.db.categories.orderBy('createdAt').toArray()
    return records.map((r) => new Category({
      id: r.id,
      name: r.name,
      isPreset: r.isPreset === 1,
      createdAt: r.createdAt,
    }))
  }

  async findCategoryByName(name: string): Promise<Category | null> {
    const record = await this.db.categories.where('name').equals(name).first()
    if (!record) return null
    return new Category({
      id: record.id,
      name: record.name,
      isPreset: record.isPreset === 1,
      createdAt: record.createdAt,
    })
  }

  async saveCategory(category: Category): Promise<void> {
    await this.db.categories.put({
      id: category.id,
      name: category.name,
      isPreset: category.isPreset ? 1 : 0,
      createdAt: category.createdAt,
    })
  }

  async initPresetCategories(presets: string[]): Promise<void> {
    for (const name of presets) {
      const existing = await this.db.categories.where('name').equals(name).first()
      if (!existing) {
        await this.db.categories.put({
          id: crypto.randomUUID(),
          name,
          isPreset: 1,
          createdAt: Date.now(),
        })
      }
    }
  }

  private toDomain(record: RewardRecord): Reward {
    return new Reward({
      id: record.id,
      title: record.title,
      description: record.description,
      points: record.points,
      icon: record.icon,
      categoryId: record.categoryId,
      isPreset: record.isPreset === 1,
      isActive: record.isActive === 1,
      createdAt: record.createdAt,
    })
  }

  private toPersistence(reward: Reward): RewardRecord {
    return {
      id: reward.id,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      icon: reward.icon,
      categoryId: reward.categoryId,
      isPreset: reward.isPreset ? 1 : 0,
      isActive: reward.isActive ? 1 : 0,
      createdAt: reward.createdAt,
    }
  }

  private toLogDomain(record: RewardLogRecord): RewardLog {
    return new RewardLog({
      id: record.id,
      rewardId: record.rewardId,
      childId: record.childId,
      rewardTitle: record.rewardTitle,
      pointsCost: record.pointsCost,
      redeemedAt: record.redeemedAt,
      status: record.status as RewardLog['status'],
      usedAt: record.usedAt,
      returnedAt: record.returnedAt,
    })
  }

  private toLogPersistence(log: RewardLog): RewardLogRecord {
    return {
      id: log.id,
      rewardId: log.rewardId,
      childId: log.childId,
      rewardTitle: log.rewardTitle,
      pointsCost: log.pointsCost,
      redeemedAt: log.redeemedAt,
      status: log.status,
      usedAt: log.usedAt,
      returnedAt: log.returnedAt,
    }
  }
}
