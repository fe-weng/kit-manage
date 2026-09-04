import type { Pet } from '../models/Pet'

export interface IPetRepository {
  findByChildId(childId: string): Promise<Pet | null>
  save(pet: Pet): Promise<void>
  delete(id: string): Promise<void>
}
