import type { IBackupAdapter } from '@/domain/repositories/IBackupAdapter'

export class BackupService {
  constructor(private adapter: IBackupAdapter) {}

  async exportData(): Promise<void> {
    const data = await this.adapter.exportAll()
    this.adapter.downloadAsFile(data)
  }

  async importData(file: File): Promise<void> {
    const data = await this.adapter.readFromFile(file)
    await this.adapter.importAll(data)
  }

  async resetAllData(): Promise<void> {
    await this.adapter.resetAll()
  }
}
