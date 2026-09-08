import type { KidManageDB, TaskRecord, TaskLogRecord, PetRecord, RewardRecord, RewardLogRecord, PointBalanceRecord, CategoryRecord, DailyTaskSnapshotRecord } from '../database/DexieDatabase'
import type { IBackupAdapter, BackupData } from '@/domain/repositories/IBackupAdapter'

export class JsonBackupAdapter implements IBackupAdapter {
  constructor(private db: KidManageDB) {}

  async exportAll(): Promise<BackupData> {
    const [tasks, taskLogs, pets, rewards, rewardLogs, pointBalances, categories, dailySnapshots] =
      await Promise.all([
        this.db.tasks.toArray(),
        this.db.taskLogs.toArray(),
        this.db.pets.toArray(),
        this.db.rewards.toArray(),
        this.db.rewardLogs.toArray(),
        this.db.pointBalances.toArray(),
        this.db.categories.toArray(),
        this.db.dailySnapshots.toArray(),
      ])

    return {
      version: 1,
      exportedAt: Date.now(),
      tasks,
      taskLogs,
      pets,
      rewards,
      rewardLogs,
      pointBalances,
      categories,
      dailySnapshots,
    }
  }

  async importAll(data: BackupData): Promise<void> {
    this.validate(data)

    await this.db.transaction(
      'rw',
      [
        this.db.tasks,
        this.db.taskLogs,
        this.db.pets,
        this.db.rewards,
        this.db.rewardLogs,
        this.db.pointBalances,
        this.db.categories,
        this.db.dailySnapshots,
      ],
      async () => {
        await Promise.all([
          this.db.tasks.clear(),
          this.db.taskLogs.clear(),
          this.db.pets.clear(),
          this.db.rewards.clear(),
          this.db.rewardLogs.clear(),
          this.db.pointBalances.clear(),
          this.db.categories.clear(),
          this.db.dailySnapshots.clear(),
        ])

        const bulkOps = [
          this.db.tasks.bulkAdd(data.tasks as TaskRecord[]),
          this.db.taskLogs.bulkAdd(data.taskLogs as TaskLogRecord[]),
          this.db.pets.bulkAdd(data.pets as PetRecord[]),
          this.db.rewards.bulkAdd(data.rewards as RewardRecord[]),
          this.db.rewardLogs.bulkAdd(data.rewardLogs as RewardLogRecord[]),
          this.db.pointBalances.bulkAdd(data.pointBalances as PointBalanceRecord[]),
          this.db.categories.bulkAdd(data.categories as CategoryRecord[]),
        ]
        if (data.dailySnapshots?.length) {
          bulkOps.push(this.db.dailySnapshots.bulkAdd(data.dailySnapshots as DailyTaskSnapshotRecord[]))
        }
        await Promise.all(bulkOps)
      }
    )
  }

  downloadAsFile(data: BackupData): void {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const date = new Date().toISOString().split('T')[0]
    const a = document.createElement('a')
    a.href = url
    a.download = `kid-manage-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async readFromFile(file: File): Promise<BackupData> {
    const text = await file.text()
    const data = JSON.parse(text) as BackupData
    this.validate(data)
    return data
  }

  async resetAll(): Promise<void> {
    await Promise.all([
      this.db.tasks.clear(),
      this.db.taskLogs.clear(),
      this.db.pets.clear(),
      this.db.rewards.clear(),
      this.db.rewardLogs.clear(),
      this.db.pointBalances.clear(),
      this.db.categories.clear(),
      this.db.dailySnapshots.clear(),
    ])
  }

  private validate(data: BackupData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('无效的备份文件格式')
    }
    if (data.version !== 1) {
      throw new Error(`不支持的备份版本: ${data.version}`)
    }
    const required = ['tasks', 'taskLogs', 'pets', 'rewards', 'rewardLogs', 'pointBalances']
    for (const key of required) {
      if (!Array.isArray((data as unknown as Record<string, unknown>)[key])) {
        throw new Error(`备份数据缺少字段: ${key}`)
      }
    }
    // categories 和 dailySnapshots 为可选（兼容旧版备份）
    if (data.categories && !Array.isArray(data.categories)) {
      throw new Error('备份数据 categories 格式错误')
    }
    if (!data.categories) data.categories = []
    if (data.dailySnapshots && !Array.isArray(data.dailySnapshots)) {
      throw new Error('备份数据 dailySnapshots 格式错误')
    }
  }
}
