import type { IPetTypeStrategy } from './IPetTypeStrategy'
import { CatPetTypeStrategy } from './CatPetTypeStrategy'
import { ChickenPetTypeStrategy } from './ChickenPetTypeStrategy'
import { DefaultPetTypeStrategy } from './DefaultPetTypeStrategy'
import { DogPetTypeStrategy } from './DogPetTypeStrategy'
import { RabbitPetTypeStrategy } from './RabbitPetTypeStrategy'

const FALLBACK_STRATEGY: IPetTypeStrategy = new DefaultPetTypeStrategy()

/** 图鉴可领养种类。新增宠物：实现策略并加入此数组。 */
const ADOPTABLE_STRATEGIES: readonly IPetTypeStrategy[] = [
  new ChickenPetTypeStrategy(),
  new RabbitPetTypeStrategy(),
  new CatPetTypeStrategy(),
  new DogPetTypeStrategy(),
]

export function getAdoptablePetStrategies(): readonly IPetTypeStrategy[] {
  return ADOPTABLE_STRATEGIES
}

export function resolvePetTypeStrategy(petType: string): IPetTypeStrategy {
  return ADOPTABLE_STRATEGIES.find((strategy) => strategy.matches(petType)) ?? FALLBACK_STRATEGY
}

export const ADOPTABLE_PET_TYPES = ADOPTABLE_STRATEGIES.map((strategy) => ({
  type: strategy.type,
  label: strategy.label,
}))

export function isAdoptablePetType(type: string): boolean {
  return ADOPTABLE_STRATEGIES.some((strategy) => strategy.type === type)
}

export function getPetEmoji(petType: string): string {
  return resolvePetTypeStrategy(petType).emoji
}
