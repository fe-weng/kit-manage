import { describe, expect, it } from 'vitest'
import { Pet } from '@/domain/models/Pet'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { PetRecord } from '../DexieDatabase'
import { petFromRecord, petToRecord } from './petRecord'

function createRecord(outfitSetId?: string): PetRecord {
  return {
    id: 'pet-1',
    childId: 'default',
    name: '小鸡',
    type: 'chicken',
    stage: PetStage.HATCHED,
    exp: 0,
    mood: 80,
    moodUpdatedAt: 1,
    createdAt: 1,
    isDisplayed: 1,
    outfitSetId,
  }
}

describe('petFromRecord', () => {
  it('记录缺少 outfitSetId 时得到 default', () => {
    const record = createRecord()
    delete record.outfitSetId
    expect(petFromRecord(record).outfitSetId).toBe('default')
  })

  it('记录里的空串变为 default', () => {
    expect(petFromRecord(createRecord('')).outfitSetId).toBe('default')
  })
})

describe('petToRecord', () => {
  it('写出 outfitSetId', () => {
    const pet = petFromRecord(createRecord('star-gown'))
    expect(pet).toBeInstanceOf(Pet)
    expect(petToRecord(pet).outfitSetId).toBe('star-gown')
  })
})
