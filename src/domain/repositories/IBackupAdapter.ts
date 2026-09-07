export interface BackupData {
  version: number
  exportedAt: number
  tasks: unknown[]
  taskLogs: unknown[]
  pets: unknown[]
  rewards: unknown[]
  rewardLogs: unknown[]
  pointBalances: unknown[]
  categories: unknown[]
}

export interface IBackupAdapter {
  exportAll(): Promise<BackupData>
  importAll(data: BackupData): Promise<void>
  downloadAsFile(data: BackupData): void
  readFromFile(file: File): Promise<BackupData>
  resetAll(): Promise<void>
}
