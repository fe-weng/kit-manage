import type { DailyTaskSnapshot } from '../models/DailyTaskSnapshot'

export interface ISnapshotRepository {
  findByDate(childId: string, date: string): Promise<DailyTaskSnapshot | null>
  findByDateRange(childId: string, startDate: string, endDate: string): Promise<DailyTaskSnapshot[]>
  save(snapshot: DailyTaskSnapshot): Promise<void>
}
