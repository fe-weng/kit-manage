import type {
  ColoringDraft,
  ColoringFinished,
  ColoringLabelCache,
  ColoringResume,
  ColoringTemplate,
} from '@/domain/coloring/types'

export interface IColoringRepository {
  getTemplate(id: string): Promise<ColoringTemplate | null>
  listTemplates(): Promise<ColoringTemplate[]>
  putTemplate(template: ColoringTemplate): Promise<void>
  deleteImportedCascade(id: string): Promise<void>

  getResume(templateId: string): Promise<ColoringResume | null>
  listResumes(): Promise<ColoringResume[]>
  putResume(resume: ColoringResume): Promise<void>
  deleteResume(templateId: string): Promise<void>

  getDraft(id: string): Promise<ColoringDraft | null>
  listDrafts(): Promise<ColoringDraft[]>
  addDraft(draft: ColoringDraft): Promise<void>
  putDraft(draft: ColoringDraft): Promise<void>
  deleteDraft(id: string): Promise<void>
  addDraftAndDeleteResume(draft: ColoringDraft, templateId: string): Promise<void>

  getFinished(id: string): Promise<ColoringFinished | null>
  listFinished(): Promise<ColoringFinished[]>
  addFinished(finished: ColoringFinished): Promise<void>
  addFinishedAndDeleteResume(finished: ColoringFinished, templateId: string): Promise<void>
  deleteFinished(id: string): Promise<void>

  getLabelCache(templateId: string): Promise<ColoringLabelCache | null>
  putLabelCache(cache: ColoringLabelCache): Promise<void>
  deleteLabelCache(templateId: string): Promise<void>
}
