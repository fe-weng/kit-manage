export interface BackupData {
  version: number
  exportedAt: number
  tasks: unknown[]
  taskLogs: unknown[]
  /** 宠物记录；旧备份可能缺少 isDisplayed，导入时由适配器补齐 */
  pets: unknown[]
  rewards: unknown[]
  rewardLogs: unknown[]
  pointBalances: unknown[]
  categories: unknown[]
  dailySnapshots?: unknown[]
  /** 涂色线稿、接着涂、半成品、成品。旧备份可以没有。编号缓存不进入备份。 */
  coloringTemplates?: unknown[]
  coloringResumes?: unknown[]
  coloringDrafts?: unknown[]
  coloringFinished?: unknown[]
}

export interface IBackupAdapter {
  exportAll(): Promise<BackupData>
  importAll(data: BackupData): Promise<void>
  downloadAsFile(data: BackupData): void
  readFromFile(file: File): Promise<BackupData>
  resetAll(): Promise<void>
}
