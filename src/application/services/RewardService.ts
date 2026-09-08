import type { IRewardRepository } from '@/domain/repositories/IRewardRepository'
import { Reward } from '@/domain/models/Reward'
import { RewardLog } from '@/domain/models/RewardLog'
import { Category } from '@/domain/models/Category'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID, REWARD_CATEGORIES } from '@/shared/constants'

export class RewardService {
  constructor(
    private rewardRepo: IRewardRepository,
    private pointService: PointService
  ) {}

  async getAllRewards(): Promise<Reward[]> {
    const rewards = await this.rewardRepo.findActive()
    return rewards.sort((a, b) => a.points - b.points)
  }

  async getAllCategories(): Promise<Category[]> {
    return this.rewardRepo.findAllCategories()
  }

  async createReward(params: {
    title: string
    points: number
    categoryId: string
    icon?: string
    description?: string
  }): Promise<Reward> {
    const reward = Reward.create({
      id: crypto.randomUUID(),
      ...params,
    })
    await this.rewardRepo.save(reward)
    return reward
  }

  async updateReward(
    rewardId: string,
    params: { title?: string; points?: number; categoryId?: string; icon?: string; description?: string }
  ): Promise<Reward | null> {
    const reward = await this.rewardRepo.findById(rewardId)
    if (!reward) return null
    reward.update(params)
    await this.rewardRepo.save(reward)
    return reward
  }

  async addCustomCategory(name: string): Promise<Category> {
    const existing = await this.rewardRepo.findCategoryByName(name)
    if (existing) return existing
    const category = Category.create({ name, isPreset: false })
    await this.rewardRepo.saveCategory(category)
    return category
  }

  async deleteReward(rewardId: string): Promise<void> {
    const reward = await this.rewardRepo.findById(rewardId)
    if (reward) {
      reward.deactivate()
      await this.rewardRepo.save(reward)
    }
  }

  async redeem(rewardId: string): Promise<{ success: boolean; log: RewardLog | null; reason?: string }> {
    const reward = await this.rewardRepo.findById(rewardId)
    if (!reward) return { success: false, log: null }

    const existingPending = await this.rewardRepo.findPendingLogByRewardId(rewardId, DEFAULT_CHILD_ID)
    if (existingPending) return { success: false, log: null, reason: 'has_pending' }

    const canSpend = await this.pointService.spendOnReward(reward.points)
    if (!canSpend) return { success: false, log: null, reason: 'insufficient_points' }

    const log = RewardLog.create({
      id: crypto.randomUUID(),
      rewardId: reward.id,
      childId: DEFAULT_CHILD_ID,
      rewardTitle: reward.title,
      pointsCost: reward.points,
    })

    await this.rewardRepo.saveLog(log)
    return { success: true, log }
  }

  async getPendingCoupons(): Promise<RewardLog[]> {
    return this.rewardRepo.findPendingLogsByChildId(DEFAULT_CHILD_ID)
  }

  async getAllLogs(): Promise<RewardLog[]> {
    return this.rewardRepo.findLogsByChildId(DEFAULT_CHILD_ID)
  }

  async markUsed(logId: string): Promise<boolean> {
    const log = await this.rewardRepo.findLogById(logId)
    if (!log || !log.isPending) return false
    log.markUsed()
    await this.rewardRepo.saveLog(log)
    return true
  }

  async returnCoupon(logId: string): Promise<{ success: boolean; reason?: string }> {
    const log = await this.rewardRepo.findLogById(logId)
    if (!log) return { success: false, reason: 'not_found' }
    if (!log.isPending) return { success: false, reason: 'not_pending' }

    await this.pointService.refundReward(log.pointsCost)
    log.markReturned()
    await this.rewardRepo.saveLog(log)
    return { success: true }
  }

  async initPresetRewards(): Promise<void> {
    await this.rewardRepo.initPresetCategories([...REWARD_CATEGORIES])
    const categories = await this.rewardRepo.findAllCategories()
    const categoryMap = new Map(categories.map((c) => [c.name, c.id]))

    const existing = await this.rewardRepo.findAll()
    if (existing.length > 0) return

    const presets = [
      { title: '看1小时动画片', points: 50, categoryName: '娱乐', icon: '📺' },
      { title: '玩30分钟游戏', points: 80, categoryName: '娱乐', icon: '🎮' },
      { title: '吃一次冰淇淋', points: 30, categoryName: '美食', icon: '🍦' },
      { title: '买零食', points: 40, categoryName: '美食', icon: '🍬' },
      { title: '买一个小玩具', points: 200, categoryName: '玩具', icon: '🎁' },
      { title: '晚睡30分钟', points: 60, categoryName: '特权', icon: '⏰' },
    ]

    for (const preset of presets) {
      const categoryId = categoryMap.get(preset.categoryName)
      if (!categoryId) continue
      const reward = Reward.create({
        id: crypto.randomUUID(),
        title: preset.title,
        points: preset.points,
        categoryId,
        icon: preset.icon,
        isPreset: true,
      })
      await this.rewardRepo.save(reward)
    }
  }
}
