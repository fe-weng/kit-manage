import type { PointBalance } from '../models/PointBalance'

export interface IPointRepository {
  findByChildId(childId: string): Promise<PointBalance | null>
  save(balance: PointBalance): Promise<void>
}
