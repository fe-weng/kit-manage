import Dexie, { type Table } from 'dexie'

export interface TaskRecord {
  id: string
  childId: string
  title: string
  type: string
  points: number
  icon?: string
  createdAt: number
  isActive: number // Dexie 不支持 boolean 索引，用 0/1
}

export interface TaskLogRecord {
  id: string
  taskId: string
  childId: string
  completedAt: number
  pointsEarned: number
  type: string
}

export interface PetRecord {
  id: string
  childId: string
  name: string
  type: string
  stage: number
  exp: number
  mood: number
  moodUpdatedAt: number
  createdAt: number
}

export interface RewardRecord {
  id: string
  title: string
  description?: string
  points: number
  icon?: string
  categoryId: string
  isPreset: number
  isActive: number
  createdAt: number
}

export interface RewardLogRecord {
  id: string
  rewardId: string
  childId: string
  rewardTitle: string
  pointsCost: number
  redeemedAt: number
  status: string
  usedAt?: number
  returnedAt?: number
}

export interface PointBalanceRecord {
  childId: string
  totalEarned: number
  totalSpentOnPet: number
  totalSpentOnReward: number
}

export interface CategoryRecord {
  id: string
  name: string
  isPreset: number
  createdAt: number
}

export interface DailyTaskSnapshotRecord {
  id: string
  childId: string
  date: string
  taskIds: string
  negativeTaskIds: string
  createdAt: number
  updatedAt: number
}

export class KidManageDB extends Dexie {
  tasks!: Table<TaskRecord>
  taskLogs!: Table<TaskLogRecord>
  pets!: Table<PetRecord>
  rewards!: Table<RewardRecord>
  rewardLogs!: Table<RewardLogRecord>
  pointBalances!: Table<PointBalanceRecord>
  categories!: Table<CategoryRecord>
  dailySnapshots!: Table<DailyTaskSnapshotRecord>

  constructor() {
    super('kid-manage')
    this.version(1).stores({
      tasks: 'id, childId, type, isActive',
      taskLogs: 'id, taskId, childId, completedAt',
      pets: 'id, childId',
      rewards: 'id, isPreset, isActive',
      rewardLogs: 'id, rewardId, childId, redeemedAt',
      pointBalances: 'childId',
    })
    this.version(2).stores({
      tasks: 'id, childId, type, isActive, [childId+isActive], [childId+type]',
    })
    this.version(3).stores({
      rewardLogs: 'id, rewardId, childId, redeemedAt, status, [childId+status], [rewardId+childId+status]',
    }).upgrade(tx => {
      return tx.table('rewardLogs').toCollection().modify(log => {
        if (log.status === undefined) log.status = 'pending'
      })
    })
    this.version(4).stores({
      categories: 'id, &name, isPreset, createdAt',
    })
    this.version(5).stores({
      rewards: 'id, categoryId, isPreset, isActive',
    }).upgrade(tx => {
      return tx.table('rewards').toCollection().modify(reward => {
        if (reward.categoryId === undefined) reward.categoryId = ''
      })
    })
    this.version(6).stores({
      dailySnapshots: 'id, childId, date, [childId+date]',
    })
  }
}
