import { create } from 'zustand'
import { petService } from '@/shared/container'
import type { Pet } from '@/domain/models/Pet'
import { usePointStore } from './usePointStore'

interface PetStatus {
  pet: Pet
  isMaxLevel: boolean
  stageName: string
  expToNext: number | null
  expProgress: number
  nextStageName: string | null
  feedCost: number
}

interface PetStore {
  status: PetStatus | null
  loading: boolean
  fetchPet: () => Promise<void>
  feed: () => Promise<{ success: boolean; evolved: boolean }>
  petAction: () => Promise<void>
  createPet: (name: string, type: string) => Promise<void>
  rename: (newName: string) => Promise<void>
}

export const usePetStore = create<PetStore>((set, get) => ({
  status: null,
  loading: false,

  fetchPet: async () => {
    set({ loading: true })
    try {
      const status = await petService.getPetStatus()
      set({ status })
    } finally {
      set({ loading: false })
    }
  },

  feed: async () => {
    try {
      const result = await petService.feed()
      if (result.success) {
        await get().fetchPet()
        await usePointStore.getState().fetchBalance()
      }
      return { success: result.success, evolved: result.evolved }
    } catch {
      return { success: false, evolved: false }
    }
  },

  petAction: async () => {
    try {
      await petService.pet()
      await get().fetchPet()
    } catch { /* UI 层已有 ref 锁，静默忽略 */ }
  },

  createPet: async (name, type) => {
    await petService.createPet(name, type)
    await get().fetchPet()
  },

  rename: async (newName) => {
    await petService.rename(newName)
    await get().fetchPet()
  },
}))
