import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { Pet } from '@/domain/models/Pet'
import {
  canEvolve,
  getExpToNextStage,
  getExpProgress,
  FEED_EXP_GAIN,
  FEED_POINT_COST,
  PET_ADOPTION_COST,
} from '@/domain/rules/PetGrowthRule'
import { getStageConfig, getNextStageConfig } from '@/domain/valueObjects/PetStage'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

const MAX_PET_NAME_LENGTH = 10

export const ADOPTABLE_PET_TYPES = [
  { type: 'chicken', label: '小鸡' },
  { type: 'rabbit', label: '小兔' },
] as const

export interface PetStatus {
  pet: Pet
  isMaxLevel: boolean
  stageName: string
  expToNext: number | null
  expProgress: number
  nextStageName: string | null
  feedCost: number
}

export interface PetCollectionItem {
  type: string
  typeLabel: string
  adopted: boolean
  pet: Pet | null
  isDisplayed: boolean
  isMaxLevel: boolean
  stageName: string | null
  canAdopt: boolean
}

export interface PetCollection {
  items: PetCollectionItem[]
  adoptedCount: number
  totalCount: number
  isComplete: boolean
}

export type AdoptionCheckResult =
  | { allowed: true }
  | { allowed: false; message: string }

export class PetService {
  private mutationLocked = false

  constructor(
    private petRepo: IPetRepository,
    private pointService: PointService,
  ) {}

  async getPet(): Promise<Pet | null> {
    const pet = await this.petRepo.findDisplayedByChildId(DEFAULT_CHILD_ID)
    if (pet) await this.persistDecay(pet)
    return pet
  }

  async getRaisingPet(): Promise<Pet | null> {
    const pet = await this.petRepo.findRaisingByChildId(DEFAULT_CHILD_ID)
    if (pet) await this.persistDecay(pet)
    return pet
  }

  async getPetStatus(): Promise<PetStatus | null> {
    const pet = await this.getPet()
    if (!pet) return null
    return this.toStatus(pet)
  }

  async getRaisingStatus(): Promise<PetStatus | null> {
    const pet = await this.getRaisingPet()
    if (!pet) return null
    return this.toStatus(pet)
  }

  async getCollection(): Promise<PetCollection> {
    const pets = await this.petRepo.findAllByChildId(DEFAULT_CHILD_ID)
    for (const pet of pets) {
      await this.persistDecay(pet)
    }

    const raising = pets.find((pet) => pet.canContinueRaising()) ?? null
    const byType = new Map(pets.map((pet) => [pet.type, pet]))
    const items: PetCollectionItem[] = ADOPTABLE_PET_TYPES.map((catalog) => {
      const pet = byType.get(catalog.type) ?? null
      return {
        type: catalog.type,
        typeLabel: catalog.label,
        adopted: pet !== null,
        pet,
        isDisplayed: pet?.isDisplayed ?? false,
        isMaxLevel: pet?.isMaxLevel() ?? false,
        stageName: pet ? getStageConfig(pet.stage).name : null,
        canAdopt: pet === null && raising === null && pets.length > 0,
      }
    })

    const adoptedCount = items.filter((item) => item.adopted).length
    const isComplete = items.every((item) => item.adopted && item.isMaxLevel)

    return {
      items,
      adoptedCount,
      totalCount: items.length,
      isComplete,
    }
  }

  async createPet(name: string, type: string): Promise<Pet> {
    return this.withMutationLock(async () => {
      const trimmedName = this.assertValidName(name)
      this.assertValidType(type)

      const existing = await this.petRepo.findAllByChildId(DEFAULT_CHILD_ID)
      if (existing.length > 0) {
        throw new Error('当前宠物满级后才能领养下一只')
      }

      const pet = Pet.create({
        id: crypto.randomUUID(),
        childId: DEFAULT_CHILD_ID,
        name: trimmedName,
        type,
      })
      await this.petRepo.save(pet)
      return pet
    })
  }

  async checkAdoption(type: string): Promise<AdoptionCheckResult> {
    const message = await this.getAdoptionBlocker(type)
    if (message) return { allowed: false, message }
    return { allowed: true }
  }

  async adoptPet(name: string, type: string): Promise<Pet> {
    return this.withMutationLock(async () => {
      const trimmedName = this.assertValidName(name)
      const message = await this.getAdoptionBlocker(type)
      if (message) throw new Error(message)

      const spent = await this.pointService.spendOnPet(PET_ADOPTION_COST)
      if (!spent) {
        const balance = await this.pointService.getBalance()
        const shortfall = PET_ADOPTION_COST - balance.currentBalance
        throw new Error(`积分不足，还差 ${Math.max(1, shortfall)} 分`)
      }

      const pet = Pet.create({
        id: crypto.randomUUID(),
        childId: DEFAULT_CHILD_ID,
        name: trimmedName,
        type,
      })
      await this.petRepo.save(pet)
      await this.petRepo.switchDisplayed(DEFAULT_CHILD_ID, pet.id)
      return pet
    })
  }

  async feed(): Promise<{ success: boolean; evolved: boolean; pet: Pet | null }> {
    const pet = await this.petRepo.findRaisingByChildId(DEFAULT_CHILD_ID)
    if (!pet || !pet.canContinueRaising()) {
      return { success: false, evolved: false, pet: pet ?? null }
    }

    const canSpend = await this.pointService.spendOnPet(FEED_POINT_COST)
    if (!canSpend) return { success: false, evolved: false, pet }

    pet.applyMoodDecay()
    pet.feed(FEED_EXP_GAIN)

    let evolved = false
    if (canEvolve(pet)) {
      pet.evolve()
      evolved = true
    }

    await this.petRepo.save(pet)
    return { success: true, evolved, pet }
  }

  async pet(): Promise<Pet | null> {
    const pet = await this.petRepo.findDisplayedByChildId(DEFAULT_CHILD_ID)
    if (!pet) return null

    pet.applyMoodDecay()
    pet.pet()
    await this.petRepo.save(pet)
    return pet
  }

  async rename(newName: string): Promise<Pet | null> {
    const pet = await this.petRepo.findDisplayedByChildId(DEFAULT_CHILD_ID)
    if (!pet) return null
    return this.renamePet(pet.id, newName)
  }

  async renamePet(petId: string, newName: string): Promise<Pet | null> {
    const pet = await this.petRepo.findById(petId)
    if (!pet) return null

    pet.rename(this.assertValidName(newName))
    await this.petRepo.save(pet)
    return pet
  }

  async setDisplayed(petId: string): Promise<void> {
    await this.petRepo.switchDisplayed(DEFAULT_CHILD_ID, petId)
  }

  private async getAdoptionBlocker(type: string): Promise<string | null> {
    this.assertValidType(type)

    const raising = await this.petRepo.findRaisingByChildId(DEFAULT_CHILD_ID)
    if (raising) return '当前宠物满级后才能领养下一只'

    const all = await this.petRepo.findAllByChildId(DEFAULT_CHILD_ID)
    if (all.length === 0) return '当前宠物满级后才能领养下一只'
    if (all.some((pet) => pet.canContinueRaising())) {
      return '请先把正在养成的宠物养到满级'
    }

    const owned = await this.petRepo.existsByChildIdAndType(DEFAULT_CHILD_ID, type)
    if (owned) return '已经领养过这种宠物'

    const balance = await this.pointService.getBalance()
    const shortfall = PET_ADOPTION_COST - balance.currentBalance
    if (shortfall > 0) return `积分不足，还差 ${shortfall} 分`

    return null
  }

  private async persistDecay(pet: Pet): Promise<void> {
    const mood = pet.mood
    const moodUpdatedAt = pet.moodUpdatedAt
    pet.applyMoodDecay()
    if (pet.mood !== mood || pet.moodUpdatedAt !== moodUpdatedAt) {
      await this.petRepo.save(pet)
    }
  }

  private toStatus(pet: Pet): PetStatus {
    const stageConfig = getStageConfig(pet.stage)
    const nextConfig = getNextStageConfig(pet.stage)
    return {
      pet,
      isMaxLevel: pet.isMaxLevel(),
      stageName: stageConfig.name,
      expToNext: getExpToNextStage(pet),
      expProgress: getExpProgress(pet),
      nextStageName: nextConfig?.name ?? null,
      feedCost: FEED_POINT_COST,
    }
  }

  private assertValidName(name: string): string {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('名字不能为空')
    if (trimmed.length > MAX_PET_NAME_LENGTH) throw new Error('名字最多 10 个字符')
    return trimmed
  }

  private assertValidType(type: string): void {
    if (!ADOPTABLE_PET_TYPES.some((item) => item.type === type)) {
      throw new Error('已经领养过这种宠物')
    }
  }

  private async withMutationLock<T>(fn: () => Promise<T>): Promise<T> {
    if (this.mutationLocked) {
      throw new Error('请先把正在养成的宠物养到满级')
    }
    this.mutationLocked = true
    try {
      return await fn()
    } finally {
      this.mutationLocked = false
    }
  }
}
