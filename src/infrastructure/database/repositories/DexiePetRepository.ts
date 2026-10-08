import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { Pet } from '@/domain/models/Pet'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { KidManageDB } from '../DexieDatabase'
import { petFromRecord, petToRecord } from './petRecord'

export class DexiePetRepository implements IPetRepository {
  constructor(private db: KidManageDB) {}

  async findDisplayedByChildId(childId: string): Promise<Pet | null> {
    const record = await this.db.pets
      .where('[childId+isDisplayed]')
      .equals([childId, 1])
      .first()
    return record ? petFromRecord(record) : null
  }

  async findRaisingByChildId(childId: string): Promise<Pet | null> {
    const record = await this.db.pets
      .where('childId')
      .equals(childId)
      .and((pet) => pet.stage < PetStage.MAX)
      .first()
    return record ? petFromRecord(record) : null
  }

  async findAllByChildId(childId: string): Promise<Pet[]> {
    const records = await this.db.pets.where('childId').equals(childId).toArray()
    return records.map((record) => petFromRecord(record))
  }

  async findById(id: string): Promise<Pet | null> {
    const record = await this.db.pets.get(id)
    return record ? petFromRecord(record) : null
  }

  async existsByChildIdAndType(childId: string, type: string): Promise<boolean> {
    const record = await this.db.pets
      .where('[childId+type]')
      .equals([childId, type])
      .first()
    return record !== undefined
  }

  async switchDisplayed(childId: string, petId: string): Promise<void> {
    await this.db.transaction('rw', this.db.pets, async () => {
      const target = await this.db.pets.get(petId)
      if (!target || target.childId !== childId) {
        throw new Error('Pet not found')
      }

      const pets = await this.db.pets.where('childId').equals(childId).toArray()
      await Promise.all(
        pets.map((pet) =>
          this.db.pets.update(pet.id, { isDisplayed: pet.id === petId ? 1 : 0 }),
        ),
      )
    })
  }

  async save(pet: Pet): Promise<void> {
    await this.db.pets.put(petToRecord(pet))
  }

  async delete(id: string): Promise<void> {
    await this.db.pets.delete(id)
  }
}
