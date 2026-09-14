import type { Pet } from '../models/Pet'

export interface IPetRepository {
  findDisplayedByChildId(childId: string): Promise<Pet | null>
  findRaisingByChildId(childId: string): Promise<Pet | null>
  findAllByChildId(childId: string): Promise<Pet[]>
  findById(id: string): Promise<Pet | null>
  existsByChildIdAndType(childId: string, type: string): Promise<boolean>
  switchDisplayed(childId: string, petId: string): Promise<void>
  save(pet: Pet): Promise<void>
  delete(id: string): Promise<void>
}
