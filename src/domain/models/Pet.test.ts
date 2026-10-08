import { describe, expect, it } from 'vitest'
import { Pet } from './Pet'
import { PetStage } from '../valueObjects/PetStage'

function createPet(outfitSetId?: string): Pet {
  return new Pet({
    id: 'pet-1',
    childId: 'default',
    name: '小鸡',
    type: 'chicken',
    stage: PetStage.HATCHED,
    exp: 0,
    mood: 80,
    moodUpdatedAt: 1,
    createdAt: 1,
    outfitSetId,
  })
}

describe('Pet.outfitSetId', () => {
  it('缺省时为 default', () => {
    expect(createPet().outfitSetId).toBe('default')
  })

  it('空串变为 default', () => {
    expect(createPet('').outfitSetId).toBe('default')
  })

  it('toJSON 带上该字段', () => {
    expect(createPet('star-gown').toJSON().outfitSetId).toBe('star-gown')
  })
})
