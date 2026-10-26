import type { IColoringRepository } from '@/domain/repositories/IColoringRepository'
import type {
  ColoringDraft,
  ColoringFinished,
  ColoringLabelCache,
  ColoringResume,
  ColoringTemplate,
} from '@/domain/coloring/types'
import type { KidManageDB } from '../DexieDatabase'

export class DexieColoringRepository implements IColoringRepository {
  constructor(private db: KidManageDB) {}

  async getTemplate(id: string): Promise<ColoringTemplate | null> {
    return (await this.db.coloringTemplates.get(id)) ?? null
  }

  async listTemplates(): Promise<ColoringTemplate[]> {
    return this.db.coloringTemplates.toArray()
  }

  async putTemplate(template: ColoringTemplate): Promise<void> {
    await this.db.coloringTemplates.put(template)
  }

  async deleteImportedCascade(id: string): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.coloringTemplates,
        this.db.coloringResumes,
        this.db.coloringDrafts,
        this.db.coloringLabelCaches,
      ],
      async () => {
        const template = await this.db.coloringTemplates.get(id)
        if (!template || template.kind !== 'imported') {
          throw new Error('内置线稿不能删除')
        }
        await this.db.coloringDrafts.where('templateId').equals(id).delete()
        await this.db.coloringResumes.delete(id)
        await this.db.coloringLabelCaches.delete(id)
        await this.db.coloringTemplates.delete(id)
      },
    )
  }

  async getResume(templateId: string): Promise<ColoringResume | null> {
    return (await this.db.coloringResumes.get(templateId)) ?? null
  }

  async listResumes(): Promise<ColoringResume[]> {
    return this.db.coloringResumes.toArray()
  }

  async putResume(resume: ColoringResume): Promise<void> {
    await this.db.coloringResumes.put(resume)
  }

  async deleteResume(templateId: string): Promise<void> {
    await this.db.coloringResumes.delete(templateId)
  }

  async getDraft(id: string): Promise<ColoringDraft | null> {
    return (await this.db.coloringDrafts.get(id)) ?? null
  }

  async listDrafts(): Promise<ColoringDraft[]> {
    return this.db.coloringDrafts.toArray()
  }

  async addDraft(draft: ColoringDraft): Promise<void> {
    await this.db.coloringDrafts.add(draft)
  }

  async putDraft(draft: ColoringDraft): Promise<void> {
    await this.db.coloringDrafts.put(draft)
  }

  async deleteDraft(id: string): Promise<void> {
    await this.db.coloringDrafts.delete(id)
  }

  async addDraftAndDeleteResume(draft: ColoringDraft, templateId: string): Promise<void> {
    await this.db.transaction('rw', [this.db.coloringDrafts, this.db.coloringResumes], async () => {
      await this.db.coloringDrafts.add(draft)
      await this.db.coloringResumes.delete(templateId)
    })
  }

  async getFinished(id: string): Promise<ColoringFinished | null> {
    return (await this.db.coloringFinished.get(id)) ?? null
  }

  async listFinished(): Promise<ColoringFinished[]> {
    return this.db.coloringFinished.toArray()
  }

  async addFinished(finished: ColoringFinished): Promise<void> {
    await this.db.coloringFinished.add(finished)
  }

  async addFinishedAndDeleteResume(finished: ColoringFinished, templateId: string): Promise<void> {
    await this.db.transaction('rw', [this.db.coloringFinished, this.db.coloringResumes], async () => {
      await this.db.coloringFinished.add(finished)
      await this.db.coloringResumes.delete(templateId)
    })
  }

  async deleteFinished(id: string): Promise<void> {
    await this.db.coloringFinished.delete(id)
  }

  async getLabelCache(templateId: string): Promise<ColoringLabelCache | null> {
    return (await this.db.coloringLabelCaches.get(templateId)) ?? null
  }

  async putLabelCache(cache: ColoringLabelCache): Promise<void> {
    await this.db.coloringLabelCaches.put(cache)
  }

  async deleteLabelCache(templateId: string): Promise<void> {
    await this.db.coloringLabelCaches.delete(templateId)
  }
}
