import type { IRewardRepository } from '@/domain/repositories/IRewardRepository'
import { Reward } from '@/domain/models/Reward'
import { RewardLog } from '@/domain/models/RewardLog'
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

  private toDomain(record: RewardRecord): Reward {
    return new Reward({
      id: record.id,
      title: record.title,
      description: record.description,
      points: record.points,
      icon: record.icon,
      category: record.category,
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
      category: reward.category,
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
    }
  }
}
