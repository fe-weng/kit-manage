import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { Pet } from '@/domain/models/Pet'
import { PetStage } from '@/domain/valueObjects/PetStage'
import type { KidManageDB, PetRecord } from '../DexieDatabase'

export class DexiePetRepository implements IPetRepository {
  constructor(private db: KidManageDB) {}

  async findDisplayedByChildId(childId: string): Promise<Pet | null> {
    const record = await this.db.pets
      .where('[childId+isDisplayed]')
      .equals([childId, 1])
      .first()
    return record ? this.toDomain(record) : null
  }

  async findRaisingByChildId(childId: string): Promise<Pet | null> {
    const record = await this.db.pets
      .where('childId')
      .equals(childId)
      .and((pet) => pet.stage < PetStage.MAX)
      .first()
    return record ? this.toDomain(record) : null
  }

  async findAllByChildId(childId: string): Promise<Pet[]> {
    const records = await this.db.pets.where('childId').equals(childId).toArray()
    return records.map((record) => this.toDomain(record))
  }

  async findById(id: string): Promise<Pet | null> {
    const record = await this.db.pets.get(id)
    return record ? this.toDomain(record) : null
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
    await this.db.pets.put(this.toPersistence(pet))
  }

  async delete(id: string): Promise<void> {
    await this.db.pets.delete(id)
  }

  private toDomain(record: PetRecord): Pet {
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
    })
  }

  private toPersistence(pet: Pet): PetRecord {
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
    }
  }
}
