import { PET_STAGE_CONFIGS, getNextStageConfig } from '../valueObjects/PetStage'
import type { Pet } from '../models/Pet'

/** 每次喂食获得的经验值 */
export const FEED_EXP_GAIN = 10

/** 每次喂食消耗的积分 */
export const FEED_POINT_COST = 10

export function canEvolve(pet: Pet): boolean {
  const nextConfig = getNextStageConfig(pet.stage)
  if (!nextConfig) return false
  return pet.exp >= nextConfig.requiredExp
}

export function getExpToNextStage(pet: Pet): number | null {
  const nextConfig = getNextStageConfig(pet.stage)
  if (!nextConfig) return null
  return Math.max(0, nextConfig.requiredExp - pet.exp)
}

export function getExpProgress(pet: Pet): number {
  const currentConfig = PET_STAGE_CONFIGS.find((c) => c.stage === pet.stage)!
  const nextConfig = getNextStageConfig(pet.stage)
  if (!nextConfig) return 1

  const rangeStart = currentConfig.requiredExp
  const rangeEnd = nextConfig.requiredExp
  const progress = (pet.exp - rangeStart) / (rangeEnd - rangeStart)
  return Math.min(1, Math.max(0, progress))
}

