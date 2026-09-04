import type { Reward } from '../models/Reward'
import type { RewardLog } from '../models/RewardLog'
import type { Category } from '../models/Category'

export interface IRewardRepository {
  findById(id: string): Promise<Reward | null>
  findAll(): Promise<Reward[]>
  findActive(): Promise<Reward[]>
  save(reward: Reward): Promise<void>
  delete(id: string): Promise<void>

  findLogsByChildId(childId: string): Promise<RewardLog[]>
  findPendingLogsByChildId(childId: string): Promise<RewardLog[]>
  findLogById(logId: string): Promise<RewardLog | null>
  findPendingLogByRewardId(rewardId: string, childId: string): Promise<RewardLog | null>
  saveLog(log: RewardLog): Promise<void>

  findAllCategories(): Promise<Category[]>
  findCategoryByName(name: string): Promise<Category | null>
  saveCategory(category: Category): Promise<void>
  initPresetCategories(presets: string[]): Promise<void>
}
