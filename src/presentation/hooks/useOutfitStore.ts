import { create } from 'zustand'
import { OUTFIT_CATALOG, isOutfitPackReady } from '@/domain/outfits/outfitCatalog'
import type { OutfitSetDefinition } from '@/domain/outfits/outfitCatalog'
import type { OutfitLog } from '@/domain/models/OutfitLog'
import type { Pet } from '@/domain/models/Pet'
import type { OutfitBuyResult, OutfitEquipResult } from '@/application/services/OutfitService'
import { outfitService, petService } from '@/shared/container'
import { PET_ASSET_FILES } from '@/presentation/pet/petAssetManifest'
import { usePetStore } from './usePetStore'
import { usePointStore } from './usePointStore'

interface OutfitStore {
  outfits: OutfitSetDefinition[]
  pet: Pet | null
  logs: OutfitLog[]
  loading: boolean
  buying: boolean
  equipping: boolean
  fetchOutfits: () => Promise<void>
  buy: (outfitSetId: string) => Promise<OutfitBuyResult>
  equip: (outfitSetId: string) => Promise<OutfitEquipResult>
}

function readyOutfits(): OutfitSetDefinition[] {
  return OUTFIT_CATALOG.filter((set) => isOutfitPackReady(set, PET_ASSET_FILES))
}

export const useOutfitStore = create<OutfitStore>((set, get) => {
  async function load(): Promise<void> {
    const [status, logs] = await Promise.all([
      petService.getPetStatus(),
      outfitService.listLogs(),
    ])
    await usePointStore.getState().fetchBalance()
    set({
      outfits: readyOutfits(),
      pet: status === null ? null : status.pet,
      logs,
    })
  }

  return {
    outfits: [],
    pet: null,
    logs: [],
    loading: false,
    buying: false,
    equipping: false,

    fetchOutfits: async () => {
      set({ loading: true })
      try {
        await load()
      } finally {
        set({ loading: false })
      }
    },

    buy: async (outfitSetId) => {
      if (get().buying || get().equipping) return { ok: false, reason: 'busy' }
      set({ buying: true })
      try {
        const result = await outfitService.buy(outfitSetId)
        if (result.ok) {
          await load()
          await usePetStore.getState().fetchPet()
        }
        return result
      } finally {
        set({ buying: false })
      }
    },

    equip: async (outfitSetId) => {
      const pet = get().pet
      if (pet === null) return { ok: false, reason: 'not_found' }
      if (get().buying || get().equipping) return { ok: false, reason: 'busy' }
      set({ equipping: true })
      try {
        const result = await outfitService.equip(pet.id, outfitSetId)
        if (result.ok) {
          await load()
          await usePetStore.getState().fetchPet()
        }
        return result
      } finally {
        set({ equipping: false })
      }
    },
  }
})
