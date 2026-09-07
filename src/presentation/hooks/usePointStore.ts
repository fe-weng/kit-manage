import { create } from 'zustand'
import { pointService } from '@/shared/container'
import type { PointBalance } from '@/domain/models/PointBalance'

interface PointStore {
  balance: PointBalance | null
  loading: boolean
  fetchBalance: () => Promise<void>
}

export const usePointStore = create<PointStore>((set) => ({
  balance: null,
  loading: false,

  fetchBalance: async () => {
    set({ loading: true })
    try {
      const balance = await pointService.getBalance()
      set({ balance })
    } finally {
      set({ loading: false })
    }
  },
}))
