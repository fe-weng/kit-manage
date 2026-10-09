import type { OutfitLog } from '../models/OutfitLog'

export interface IOutfitLogRepository {
  /** redeemedAt 倒序 */
  findByChildId(childId: string): Promise<OutfitLog[]>
  findByChildIdAndOutfitSetId(childId: string, outfitSetId: string): Promise<OutfitLog | null>
  insert(log: OutfitLog): Promise<void>
}
