import type { ISnapshotRepository } from '@/domain/repositories/ISnapshotRepository'
import { DailyTaskSnapshot } from '@/domain/models/DailyTaskSnapshot'
import type { KidManageDB, DailyTaskSnapshotRecord } from '../DexieDatabase'

export class DexieSnapshotRepository implements ISnapshotRepository {
  constructor(private db: KidManageDB) {}

  async findByDate(childId: string, date: string): Promise<DailyTaskSnapshot | null> {
    const record = await this.db.dailySnapshots.get(`${childId}_${date}`)
    return record ? this.toDomain(record) : null
  }

  async findByDateRange(childId: string, startDate: string, endDate: string): Promise<DailyTaskSnapshot[]> {
    const records = await this.db.dailySnapshots
      .where('[childId+date]')
      .between([childId, startDate], [childId, endDate], true, true)
      .toArray()
    return records.map((r) => this.toDomain(r))
  }

  async save(snapshot: DailyTaskSnapshot): Promise<void> {
    await this.db.dailySnapshots.put(this.toPersistence(snapshot))
  }

  private toDomain(record: DailyTaskSnapshotRecord): DailyTaskSnapshot {
    return new DailyTaskSnapshot({
      id: record.id,
      childId: record.childId,
      date: record.date,
      taskIds: JSON.parse(record.taskIds),
      negativeTaskIds: JSON.parse(record.negativeTaskIds),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  private toPersistence(snapshot: DailyTaskSnapshot): DailyTaskSnapshotRecord {
    return {
      id: snapshot.id,
      childId: snapshot.childId,
      date: snapshot.date,
      taskIds: JSON.stringify(snapshot.taskIds),
      negativeTaskIds: JSON.stringify(snapshot.negativeTaskIds),
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    }
  }
}
