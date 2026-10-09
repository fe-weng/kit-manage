import Dexie from 'dexie'
import type { IOutfitLogRepository } from '@/domain/repositories/IOutfitLogRepository'
import { OutfitLog } from '@/domain/models/OutfitLog'
import type { KidManageDB, OutfitLogRecord } from '../DexieDatabase'

export class DexieOutfitLogRepository implements IOutfitLogRepository {
  constructor(private db: KidManageDB) {}

  async findByChildId(childId: string): Promise<OutfitLog[]> {
    const records = await this.db.outfitLogs
      .where('[childId+redeemedAt]')
      .between([childId, Dexie.minKey], [childId, Dexie.maxKey])
      .reverse()
      .toArray()
    return records.map((record) => this.toDomain(record))
  }

  async findByChildIdAndOutfitSetId(
    childId: string,
    outfitSetId: string,
  ): Promise<OutfitLog | null> {
    const record = await this.db.outfitLogs
      .where('[childId+outfitSetId]')
      .equals([childId, outfitSetId])
      .first()
    return record ? this.toDomain(record) : null
  }

  async insert(log: OutfitLog): Promise<void> {
    await this.db.outfitLogs.add(log.toJSON())
  }

  private toDomain(record: OutfitLogRecord): OutfitLog {
    return new OutfitLog(record)
  }
}
