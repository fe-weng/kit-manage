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
  hunger: number
  mood: number
  lastFedAt: number
  moodUpdatedAt: number
  createdAt: number
}

export interface RewardRecord {
  id: string
  title: string
  description?: string
  points: number
  icon?: string
  category: string
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
}

export interface PointBalanceRecord {
  childId: string
  totalEarned: number
  totalSpentOnPet: number
  totalSpentOnReward: number
}

export interface CategoryRecord {
  name: string
  isPreset: number
  createdAt: number
}

export class KidManageDB extends Dexie {
  tasks!: Table<TaskRecord>
  taskLogs!: Table<TaskLogRecord>
  pets!: Table<PetRecord>
  rewards!: Table<RewardRecord>
  rewardLogs!: Table<RewardLogRecord>
  pointBalances!: Table<PointBalanceRecord>
  categories!: Table<CategoryRecord>

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
    })
    this.version(4).stores({
      categories: 'name, isPreset, createdAt',
    })
  }
}
