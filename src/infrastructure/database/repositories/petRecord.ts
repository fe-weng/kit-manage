import { Pet } from '@/domain/models/Pet'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { PetRecord } from '../DexieDatabase'

export function petFromRecord(record: PetRecord): Pet {
  return new Pet({
    id: record.id,
    childId: record.childId,
    name: record.name,
    type: record.type,
    stage: record.stage as PetStage,
    exp: record.exp,
    mood: record.mood,
    moodUpdatedAt: record.moodUpdatedAt,
    createdAt: record.createdAt,
    isDisplayed: record.isDisplayed === 1,
    outfitSetId: record.outfitSetId,
  })
}

export function petToRecord(pet: Pet): PetRecord {
  return {
    id: pet.id,
    childId: pet.childId,
    name: pet.name,
    type: pet.type,
    stage: pet.stage,
    exp: pet.exp,
    mood: pet.mood,
    moodUpdatedAt: pet.moodUpdatedAt,
    createdAt: pet.createdAt,
    isDisplayed: pet.isDisplayed ? 1 : 0,
    outfitSetId: pet.outfitSetId,
  }
}
