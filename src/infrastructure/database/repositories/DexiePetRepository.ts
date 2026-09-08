import type { IPetRepository } from '@/domain/repositories/IPetRepository'
import { Pet } from '@/domain/models/Pet'
import type { PetStage } from '@/domain/valueObjects/PetStage'
import type { KidManageDB, PetRecord } from '../DexieDatabase'

export class DexiePetRepository implements IPetRepository {
  constructor(private db: KidManageDB) {}

  async findByChildId(childId: string): Promise<Pet | null> {
    const record = await this.db.pets.where('childId').equals(childId).first()
    return record ? this.toDomain(record) : null
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
    }
  }
}
