import type { Reward } from '../models/Reward'
import type { RewardLog } from '../models/RewardLog'

export interface IRewardRepository {
  findById(id: string): Promise<Reward | null>
  findAll(): Promise<Reward[]>
  findActive(): Promise<Reward[]>
  save(reward: Reward): Promise<void>
  delete(id: string): Promise<void>

  findLogsByChildId(childId: string): Promise<RewardLog[]>
  saveLog(log: RewardLog): Promise<void>
}
