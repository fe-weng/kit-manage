import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { Pet } from '@/domain/models/Pet'
import { canEvolve, getExpToNextStage, getExpProgress, FEED_EXP_GAIN, FEED_POINT_COST } from '@/domain/rules/PetGrowthRule'
import { getStageConfig, getNextStageConfig, PetStage } from '@/domain/valueObjects/PetStage'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

export class PetService {
  constructor(
    private petRepo: IPetRepository,
    private pointService: PointService
  ) {}

  async getPet(): Promise<Pet | null> {
    const pet = await this.petRepo.findByChildId(DEFAULT_CHILD_ID)
    if (pet) {
      pet.applyMoodDecay()
      await this.petRepo.save(pet)
    }
    return pet
  }

  async createPet(name: string, type: string): Promise<Pet> {
    const pet = Pet.create({
      id: crypto.randomUUID(),
      childId: DEFAULT_CHILD_ID,
      name,
      type,
    })
    await this.petRepo.save(pet)
    return pet
  }

  async feed(): Promise<{ success: boolean; evolved: boolean; pet: Pet | null }> {
    const pet = await this.petRepo.findByChildId(DEFAULT_CHILD_ID)
    if (!pet) return { success: false, evolved: false, pet: null }

    const isMaxLevel = pet.stage >= PetStage.MAX
    if (!isMaxLevel) {
      const canSpend = await this.pointService.spendOnPet(FEED_POINT_COST)
      if (!canSpend) return { success: false, evolved: false, pet }
    }

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
    const pet = await this.petRepo.findByChildId(DEFAULT_CHILD_ID)
    if (!pet) return null

    pet.applyMoodDecay()
    pet.pet()
    await this.petRepo.save(pet)
    return pet
  }

  async rename(newName: string): Promise<Pet | null> {
    const pet = await this.petRepo.findByChildId(DEFAULT_CHILD_ID)
    if (!pet) return null

    pet.rename(newName)
    await this.petRepo.save(pet)
    return pet
  }

  async getPetStatus(): Promise<{
    pet: Pet
    isMaxLevel: boolean
    stageName: string
    expToNext: number | null
    expProgress: number
    nextStageName: string | null
    feedCost: number
  } | null> {
    const pet = await this.getPet()
    if (!pet) return null

    const stageConfig = getStageConfig(pet.stage)
    const nextConfig = getNextStageConfig(pet.stage)

    return {
      pet,
      isMaxLevel: pet.stage >= PetStage.MAX,
      stageName: stageConfig.name,
      expToNext: getExpToNextStage(pet),
      expProgress: getExpProgress(pet),
      nextStageName: nextConfig?.name ?? null,
      feedCost: FEED_POINT_COST,
    }
  }
}
