import { PetStage } from '@/domain/valueObjects/PetStage'
import { resolvePetTypeStrategy } from '@/shared/petTypes'

function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export function getPetImage(petType: string, stage: PetStage): string {
  return withBase(resolvePetTypeStrategy(petType).stageImage(stage))
}
