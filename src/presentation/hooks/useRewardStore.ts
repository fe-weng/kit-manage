import { create } from 'zustand'
import { rewardService } from '@/shared/container'
import type { Reward } from '@/domain/models/Reward'
import type { RewardLog } from '@/domain/models/RewardLog'
import { usePointStore } from './usePointStore'

interface RewardStore {
  rewards: Reward[]
  pendingCoupons: RewardLog[]
  loading: boolean
  fetchRewards: () => Promise<void>
  fetchPendingCoupons: () => Promise<void>
  initPresets: () => Promise<void>
  createReward: (params: { title: string; points: number; category: string; icon?: string }) => Promise<void>
  updateReward: (id: string, params: { title?: string; points?: number; category?: string }) => Promise<void>
  deleteReward: (id: string) => Promise<void>
  redeem: (rewardId: string) => Promise<{ success: boolean; reason?: string }>
  markUsed: (logId: string) => Promise<boolean>
}

export const useRewardStore = create<RewardStore>((set, get) => ({
  rewards: [],
  pendingCoupons: [],
  loading: false,

  fetchRewards: async () => {
    set({ loading: true })
    const rewards = await rewardService.getAllRewards()
    set({ rewards, loading: false })
  },

  fetchPendingCoupons: async () => {
    const pendingCoupons = await rewardService.getPendingCoupons()
    set({ pendingCoupons })
  },

  initPresets: async () => {
    await rewardService.initPresetRewards()
    await get().fetchRewards()
  },

  createReward: async (params) => {
    await rewardService.createReward(params)
    await get().fetchRewards()
  },

  updateReward: async (id, params) => {
    await rewardService.updateReward(id, params)
    await get().fetchRewards()
  },

  deleteReward: async (id) => {
    await rewardService.deleteReward(id)
    await get().fetchRewards()
  },

  redeem: async (rewardId) => {
    const result = await rewardService.redeem(rewardId)
    if (result.success) {
      await usePointStore.getState().fetchBalance()
      await get().fetchPendingCoupons()
    }
    return { success: result.success, reason: result.reason }
  },

  markUsed: async (logId) => {
    const ok = await rewardService.markUsed(logId)
    if (ok) {
      await get().fetchPendingCoupons()
    }
    return ok
  },
}))
