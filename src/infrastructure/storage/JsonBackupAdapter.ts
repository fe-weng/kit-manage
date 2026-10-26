import type { KidManageDB, TaskRecord, TaskLogRecord, PetRecord, RewardRecord, RewardLogRecord, PointBalanceRecord, CategoryRecord, DailyTaskSnapshotRecord } from '../database/DexieDatabase'
import type { IBackupAdapter, BackupData } from '@/domain/repositories/IBackupAdapter'
import type {
  ColoringDraft,
  ColoringFinished,
  ColoringResume,
  ColoringTemplate,
} from '@/domain/coloring/types'

export class JsonBackupAdapter implements IBackupAdapter {
  constructor(private db: KidManageDB) {}

  async exportAll(): Promise<BackupData> {
    const [
      tasks, taskLogs, pets, rewards, rewardLogs, pointBalances, categories, dailySnapshots,
      templateRows, resumeRows, draftRows, finishedRows,
    ] = await Promise.all([
      this.db.tasks.toArray(),
      this.db.taskLogs.toArray(),
      this.db.pets.toArray(),
      this.db.rewards.toArray(),
      this.db.rewardLogs.toArray(),
      this.db.pointBalances.toArray(),
      this.db.categories.toArray(),
      this.db.dailySnapshots.toArray(),
      this.db.coloringTemplates.toArray(),
      this.db.coloringResumes.toArray(),
      this.db.coloringDrafts.toArray(),
      this.db.coloringFinished.toArray(),
    ])

    const [coloringTemplates, coloringResumes, coloringDrafts, coloringFinished] = await Promise.all([
      Promise.all(templateRows.map((row) => exportTemplate(row))),
      Promise.all(resumeRows.map((row) => exportResume(row))),
      Promise.all(draftRows.map((row) => exportDraft(row))),
      Promise.all(finishedRows.map((row) => exportFinished(row))),
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
      coloringTemplates,
      coloringResumes,
      coloringDrafts,
      coloringFinished,
    }
  }

  async importAll(data: BackupData): Promise<void> {
    this.validate(data)
    const coloringTemplates = parseColoringTemplates(data.coloringTemplates)
    const coloringResumes = parseColoringResumes(data.coloringResumes)
    const coloringDrafts = parseColoringDrafts(data.coloringDrafts)
    const coloringFinished = parseColoringFinished(data.coloringFinished)

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
        this.db.coloringTemplates,
        this.db.coloringResumes,
        this.db.coloringDrafts,
        this.db.coloringFinished,
        this.db.coloringLabelCaches,
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
          this.db.coloringTemplates.clear(),
          this.db.coloringResumes.clear(),
          this.db.coloringDrafts.clear(),
          this.db.coloringFinished.clear(),
          this.db.coloringLabelCaches.clear(),
        ])

        const bulkOps = [
          this.db.tasks.bulkAdd(data.tasks as TaskRecord[]),
          this.db.taskLogs.bulkAdd(data.taskLogs as TaskLogRecord[]),
          this.db.pets.bulkAdd(this.normalizePets(data.pets)),
          this.db.rewards.bulkAdd(data.rewards as RewardRecord[]),
          this.db.rewardLogs.bulkAdd(data.rewardLogs as RewardLogRecord[]),
          this.db.pointBalances.bulkAdd(data.pointBalances as PointBalanceRecord[]),
          this.db.categories.bulkAdd(data.categories as CategoryRecord[]),
        ]
        if (data.dailySnapshots?.length) {
          bulkOps.push(this.db.dailySnapshots.bulkAdd(data.dailySnapshots as DailyTaskSnapshotRecord[]))
        }
        if (coloringTemplates.length > 0) {
          bulkOps.push(this.db.coloringTemplates.bulkAdd(coloringTemplates))
        }
        if (coloringResumes.length > 0) {
          bulkOps.push(this.db.coloringResumes.bulkAdd(coloringResumes))
        }
        if (coloringDrafts.length > 0) {
          bulkOps.push(this.db.coloringDrafts.bulkAdd(coloringDrafts))
        }
        if (coloringFinished.length > 0) {
          bulkOps.push(this.db.coloringFinished.bulkAdd(coloringFinished))
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
      this.db.coloringTemplates.clear(),
      this.db.coloringResumes.clear(),
      this.db.coloringDrafts.clear(),
      this.db.coloringFinished.clear(),
      this.db.coloringLabelCaches.clear(),
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
    const coloringKeys = ['coloringTemplates', 'coloringResumes', 'coloringDrafts', 'coloringFinished'] as const
    for (const key of coloringKeys) {
      const value = data[key]
      if (value !== undefined && !Array.isArray(value)) {
        throw new Error(`备份数据 ${key} 格式错误`)
      }
    }
  }

  /** 旧备份缺 isDisplayed 时补齐；同一 childId 只保留一只展示宠物。养成资格仍由 stage 判定。 */
  private normalizePets(rawPets: unknown[]): PetRecord[] {
    const pets = rawPets as Array<PetRecord & { isDisplayed?: number | boolean }>
    const grouped = new Map<string, typeof pets>()

    for (const pet of pets) {
      const list = grouped.get(pet.childId) ?? []
      list.push(pet)
      grouped.set(pet.childId, list)
    }

    const normalized: PetRecord[] = []
    for (const group of grouped.values()) {
      let displayIndex = group.findIndex((pet) => this.toDisplayedFlag(pet.isDisplayed) === 1)
      if (displayIndex < 0) displayIndex = 0

      group.forEach((pet, index) => {
        normalized.push({
          ...pet,
          isDisplayed: index === displayIndex ? 1 : 0,
        })
      })
    }

    return normalized
  }

  private toDisplayedFlag(value: unknown): 0 | 1 | undefined {
    if (value === 1 || value === true) return 1
    if (value === 0 || value === false) return 0
    return undefined
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('无法读取涂色图片'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('无法读取涂色图片'))
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: 'image/png' })
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error('备份里的涂色数据不完整')
  }
  return value as Record<string, unknown>
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('备份里的涂色数据不完整')
  }
  return value
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('备份里的涂色数据不完整')
  }
  return value
}

function readPositiveInt(record: Record<string, unknown>, key: string): number {
  const value = readNumber(record, key)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('备份里的涂色数据不完整')
  }
  return value
}

function readBlob(record: Record<string, unknown>, key: string): Blob {
  const value = record[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('备份里的涂色图片不完整')
  }
  try {
    return base64ToBlob(value)
  } catch {
    throw new Error('备份里的涂色图片不完整')
  }
}

function readNullableId(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  if (value === null) return null
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('备份里的涂色数据不完整')
  }
  return value
}

async function exportTemplate(row: ColoringTemplate): Promise<Record<string, unknown>> {
  const item: Record<string, unknown> = {
    id: row.id,
    kind: row.kind,
    publicPath: row.publicPath,
    width: row.width,
    height: row.height,
    createdAt: row.createdAt,
  }
  if (row.imageBlob) item.imageBase64 = await blobToBase64(row.imageBlob)
  return item
}

async function exportResume(row: ColoringResume): Promise<Record<string, unknown>> {
  return {
    templateId: row.templateId,
    updatedAt: row.updatedAt,
    imageBase64: await blobToBase64(row.imageBlob),
  }
}

async function exportDraft(row: ColoringDraft): Promise<Record<string, unknown>> {
  return {
    id: row.id,
    templateId: row.templateId,
    updatedAt: row.updatedAt,
    imageBase64: await blobToBase64(row.imageBlob),
  }
}

async function exportFinished(row: ColoringFinished): Promise<Record<string, unknown>> {
  return {
    id: row.id,
    templateId: row.templateId,
    createdAt: row.createdAt,
    imageBase64: await blobToBase64(row.imageBlob),
  }
}

function parseColoringTemplates(raw: unknown[] | undefined): ColoringTemplate[] {
  if (!raw) return []
  return raw.map((item) => {
    const record = asRecord(item)
    const kind = record.kind
    if (kind !== 'builtin' && kind !== 'imported') {
      throw new Error('备份里的涂色数据不完整')
    }
    const template: ColoringTemplate = {
      id: readString(record, 'id'),
      kind,
      publicPath: kind === 'builtin' ? readString(record, 'publicPath') : (
        typeof record.publicPath === 'string' ? record.publicPath : ''
      ),
      width: readPositiveInt(record, 'width'),
      height: readPositiveInt(record, 'height'),
      createdAt: readNumber(record, 'createdAt'),
    }
    if (kind === 'imported') template.imageBlob = readBlob(record, 'imageBase64')
    return template
  })
}

function parseColoringResumes(raw: unknown[] | undefined): ColoringResume[] {
  if (!raw) return []
  return raw.map((item) => {
    const record = asRecord(item)
    return {
      templateId: readString(record, 'templateId'),
      updatedAt: readNumber(record, 'updatedAt'),
      imageBlob: readBlob(record, 'imageBase64'),
    }
  })
}

function parseColoringDrafts(raw: unknown[] | undefined): ColoringDraft[] {
  if (!raw) return []
  return raw.map((item) => {
    const record = asRecord(item)
    return {
      id: readString(record, 'id'),
      templateId: readString(record, 'templateId'),
      updatedAt: readNumber(record, 'updatedAt'),
      imageBlob: readBlob(record, 'imageBase64'),
    }
  })
}

function parseColoringFinished(raw: unknown[] | undefined): ColoringFinished[] {
  if (!raw) return []
  return raw.map((item) => {
    const record = asRecord(item)
    return {
      id: readString(record, 'id'),
      templateId: readNullableId(record, 'templateId'),
      createdAt: readNumber(record, 'createdAt'),
      imageBlob: readBlob(record, 'imageBase64'),
    }
  })
}
