import { create } from 'zustand'
import { petService } from '@/shared/container'
import type {
  AdoptionCheckResult,
  PetCollection,
  PetStatus,
} from '@/application/services/PetService'
import { usePointStore } from './usePointStore'

interface PetStore {
  status: PetStatus | null
  raisingStatus: PetStatus | null
  collection: PetCollection | null
  loading: boolean
  collectionLoading: boolean
  adopting: boolean
  renaming: boolean
  switchingDisplay: boolean
  fetchPet: () => Promise<void>
  fetchCollection: () => Promise<void>
  feed: () => Promise<{ success: boolean; evolved: boolean }>
  petAction: () => Promise<void>
  createPet: (name: string, type: string) => Promise<void>
  checkAdoption: (type: string) => Promise<AdoptionCheckResult>
  adoptPet: (name: string, type: string) => Promise<void>
  rename: (newName: string) => Promise<void>
  renamePet: (petId: string, newName: string) => Promise<void>
  setDisplayed: (petId: string) => Promise<void>
}

export const usePetStore = create<PetStore>((set, get) => ({
  status: null,
  raisingStatus: null,
  collection: null,
  loading: false,
  collectionLoading: false,
  adopting: false,
  renaming: false,
  switchingDisplay: false,

  fetchPet: async () => {
    set({ loading: true })
    try {
      const [status, raisingStatus] = await Promise.all([
        petService.getPetStatus(),
        petService.getRaisingStatus(),
      ])
      set({ status, raisingStatus })
    } finally {
      set({ loading: false })
    }
  },

  fetchCollection: async () => {
    set({ collectionLoading: true })
    try {
      const collection = await petService.getCollection()
      set({ collection })
    } finally {
      set({ collectionLoading: false })
    }
  },

  feed: async () => {
    try {
      const result = await petService.feed()
      if (result.success) {
        const [status, raisingStatus] = await Promise.all([
          petService.getPetStatus(),
          petService.getRaisingStatus(),
        ])
        set({ status, raisingStatus })
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
      const [status, raisingStatus] = await Promise.all([
        petService.getPetStatus(),
        petService.getRaisingStatus(),
      ])
      set({ status, raisingStatus })
    } catch { /* UI 层已有 ref 锁，静默忽略 */ }
  },

  createPet: async (name, type) => {
    await petService.createPet(name, type)
    await get().fetchPet()
  },

  checkAdoption: async (type) => {
    return petService.checkAdoption(type)
  },

  adoptPet: async (name, type) => {
    set({ adopting: true })
    try {
      await petService.adoptPet(name, type)
      await Promise.all([get().fetchPet(), get().fetchCollection()])
      await usePointStore.getState().fetchBalance()
    } finally {
      set({ adopting: false })
    }
  },

  rename: async (newName) => {
    set({ renaming: true })
    try {
      await petService.rename(newName)
      await get().fetchPet()
    } finally {
      set({ renaming: false })
    }
  },

  renamePet: async (petId, newName) => {
    set({ renaming: true })
    try {
      await petService.renamePet(petId, newName)
      await get().fetchPet()
      if (get().collection) await get().fetchCollection()
    } finally {
      set({ renaming: false })
    }
  },

  setDisplayed: async (petId) => {
    set({ switchingDisplay: true })
    try {
      await petService.setDisplayed(petId)
      await get().fetchPet()
      if (get().collection) await get().fetchCollection()
    } finally {
      set({ switchingDisplay: false })
    }
  },
}))
