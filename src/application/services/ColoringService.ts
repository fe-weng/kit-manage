import type { IColoringRepository } from '@/domain/repositories/IColoringRepository'
import {
  LABEL_CACHE_REGION_LIMIT,
  REGION_LABEL_VERSION,
} from '@/domain/coloring/labelRegions'
import { scaleImageToMaxEdge } from '@/domain/coloring/scaleImage'
import {
  BUILTIN_HEIGHT,
  BUILTIN_SVG_FILE,
  BUILTIN_TEMPLATE_ID,
  BUILTIN_WIDTH,
  type ColoringDraft,
  type ColoringFinished,
  type ColoringTemplate,
} from '@/domain/coloring/types'

export class ColoringService {
  constructor(private repo: IColoringRepository) {}

  async ensureBuiltinTemplate(): Promise<ColoringTemplate> {
    const existing = await this.repo.getTemplate(BUILTIN_TEMPLATE_ID)
    if (existing) {
      if (existing.publicPath !== BUILTIN_SVG_FILE) {
        const updated: ColoringTemplate = { ...existing, publicPath: BUILTIN_SVG_FILE }
        await this.repo.putTemplate(updated)
        return updated
      }
      return existing
    }
    const template: ColoringTemplate = {
      id: BUILTIN_TEMPLATE_ID,
      kind: 'builtin',
      publicPath: BUILTIN_SVG_FILE,
      width: BUILTIN_WIDTH,
      height: BUILTIN_HEIGHT,
      createdAt: Date.now(),
    }
    await this.repo.putTemplate(template)
    return template
  }

  async listTemplates(): Promise<ColoringTemplate[]> {
    const templates = await this.repo.listTemplates()
    return templates.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'builtin' ? -1 : 1
      return a.createdAt - b.createdAt
    })
  }

  async getTemplate(id: string): Promise<ColoringTemplate | null> {
    return this.repo.getTemplate(id)
  }

  async importImage(file: Blob): Promise<ColoringTemplate> {
    let bitmap: ImageBitmap
    try {
      bitmap = await createImageBitmap(file)
    } catch {
      throw new Error('这张图打不开')
    }

    try {
      if (bitmap.width <= 0 || bitmap.height <= 0) {
        throw new Error('这张图打不开')
      }
      const scaled = await scaleImageToMaxEdge(bitmap)
      const template: ColoringTemplate = {
        id: crypto.randomUUID(),
        kind: 'imported',
        publicPath: '',
        width: scaled.width,
        height: scaled.height,
        imageBlob: scaled.blob,
        createdAt: Date.now(),
      }
      try {
        await this.repo.putTemplate(template)
      } catch (err) {
        console.error('[Coloring] 导入写入失败:', err)
        throw new Error('未保存成功')
      }
      return template
    } finally {
      bitmap.close()
    }
  }

  async deleteImportedTemplate(id: string): Promise<void> {
    const template = await this.repo.getTemplate(id)
    if (!template) return
    if (template.kind !== 'imported') throw new Error('内置线稿不能删除')
    await this.repo.deleteImportedCascade(id)
  }

  async listResumeTemplateIds(): Promise<string[]> {
    const resumes = await this.repo.listResumes()
    return resumes.map((resume) => resume.templateId)
  }

  async getResumeBlob(templateId: string): Promise<Blob | null> {
    const resume = await this.repo.getResume(templateId)
    return resume?.imageBlob ?? null
  }

  async saveResume(templateId: string, imageBlob: Blob): Promise<void> {
    await this.repo.putResume({
      templateId,
      imageBlob,
      updatedAt: Date.now(),
    })
  }

  async deleteResume(templateId: string): Promise<void> {
    await this.repo.deleteResume(templateId)
  }

  async listDrafts(): Promise<ColoringDraft[]> {
    const drafts = await this.repo.listDrafts()
    return drafts.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getDraft(id: string): Promise<ColoringDraft | null> {
    return this.repo.getDraft(id)
  }

  async createDraft(templateId: string, imageBlob: Blob): Promise<ColoringDraft> {
    const draft: ColoringDraft = {
      id: crypto.randomUUID(),
      templateId,
      imageBlob,
      updatedAt: Date.now(),
    }
    await this.repo.addDraft(draft)
    return draft
  }

  async copyDraft(draftId: string): Promise<ColoringDraft> {
    const draft = await this.repo.getDraft(draftId)
    if (!draft) throw new Error('找不到这份半成品')
    return this.createDraft(draft.templateId, draft.imageBlob)
  }

  async updateDraft(id: string, imageBlob: Blob): Promise<void> {
    const draft = await this.repo.getDraft(id)
    if (!draft) throw new Error('找不到这份半成品')
    await this.repo.putDraft({
      ...draft,
      imageBlob,
      updatedAt: Date.now(),
    })
  }

  async deleteDraft(id: string): Promise<void> {
    await this.repo.deleteDraft(id)
  }

  /** 编辑线稿时存入草稿：新半成品与删除接着涂同一事务。 */
  async archiveResumeAsDraft(templateId: string, imageBlob: Blob): Promise<ColoringDraft> {
    const draft: ColoringDraft = {
      id: crypto.randomUUID(),
      templateId,
      imageBlob,
      updatedAt: Date.now(),
    }
    await this.repo.addDraftAndDeleteResume(draft, templateId)
    return draft
  }

  async listFinished(): Promise<ColoringFinished[]> {
    const items = await this.repo.listFinished()
    return items.sort((a, b) => b.createdAt - a.createdAt)
  }

  async getFinished(id: string): Promise<ColoringFinished | null> {
    return this.repo.getFinished(id)
  }

  async saveFinished(imageBlob: Blob, templateId: string | null): Promise<ColoringFinished> {
    const finished: ColoringFinished = {
      id: crypto.randomUUID(),
      templateId,
      imageBlob,
      createdAt: Date.now(),
    }
    await this.repo.addFinished(finished)
    return finished
  }

  /** 从线稿保存成品：入库成功后才删除接着涂。 */
  async saveFinishedFromTemplate(templateId: string, imageBlob: Blob): Promise<ColoringFinished> {
    const finished: ColoringFinished = {
      id: crypto.randomUUID(),
      templateId,
      imageBlob,
      createdAt: Date.now(),
    }
    await this.repo.addFinishedAndDeleteResume(finished, templateId)
    return finished
  }

  async deleteFinished(id: string): Promise<void> {
    await this.repo.deleteFinished(id)
  }

  async readLabelCache(
    templateId: string,
    width: number,
    height: number,
  ): Promise<Uint16Array | null> {
    const cache = await this.repo.getLabelCache(templateId)
    if (!cache) return null
    if (
      cache.width !== width
      || cache.height !== height
      || cache.version !== REGION_LABEL_VERSION
    ) {
      return null
    }
    const buffer = await cache.labelsBlob.arrayBuffer()
    if (buffer.byteLength !== width * height * 2) return null
    return new Uint16Array(buffer)
  }

  async writeLabelCache(
    templateId: string,
    width: number,
    height: number,
    labels: Uint32Array,
    regionCount: number,
  ): Promise<void> {
    if (regionCount >= LABEL_CACHE_REGION_LIMIT) return
    if (labels.length !== width * height) return
    const packed = new Uint16Array(labels.length)
    for (let index = 0; index < labels.length; index += 1) {
      const value = labels[index] ?? 0
      if (value > 65535) return
      packed[index] = value
    }
    await this.repo.putLabelCache({
      templateId,
      width,
      height,
      version: REGION_LABEL_VERSION,
      labelsBlob: new Blob([packed.buffer]),
    })
  }

  async deleteLabelCache(templateId: string): Promise<void> {
    await this.repo.deleteLabelCache(templateId)
  }
}
