import type { IRewardRepository } from '@/domain/repositories/IRewardRepository'
import { Reward } from '@/domain/models/Reward'
import { RewardLog } from '@/domain/models/RewardLog'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

export class RewardService {
  constructor(
    private rewardRepo: IRewardRepository,
    private pointService: PointService
  ) {}

  async getAllRewards(): Promise<Reward[]> {
    return this.rewardRepo.findActive()
  }

  async createReward(params: {
    title: string
    points: number
    category: string
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
    params: { title?: string; points?: number; category?: string; icon?: string; description?: string }
  ): Promise<Reward | null> {
    const reward = await this.rewardRepo.findById(rewardId)
    if (!reward) return null
    reward.update(params)
    await this.rewardRepo.save(reward)
    return reward
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

  async initPresetRewards(): Promise<void> {
    const existing = await this.rewardRepo.findAll()
    if (existing.length > 0) return

    const presets = [
      { title: '看1小时动画片', points: 50, category: '娱乐', icon: '📺' },
      { title: '玩30分钟游戏', points: 80, category: '娱乐', icon: '🎮' },
      { title: '吃一次冰淇淋', points: 30, category: '美食', icon: '🍦' },
      { title: '买零食', points: 40, category: '美食', icon: '🍬' },
      { title: '买一个小玩具', points: 200, category: '玩具', icon: '🎁' },
      { title: '晚睡30分钟', points: 60, category: '特权', icon: '⏰' },
    ]

    for (const preset of presets) {
      const reward = Reward.create({
        id: crypto.randomUUID(),
        ...preset,
        isPreset: true,
      })
      await this.rewardRepo.save(reward)
    }
  }
}
