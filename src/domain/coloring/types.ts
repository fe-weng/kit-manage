export const MAX_IMPORT_EDGE = 1600

export type ColoringTemplateKind = 'builtin' | 'imported'

export interface ColoringTemplate {
  id: string
  kind: ColoringTemplateKind
  publicPath: string
  width: number
  height: number
  imageBlob?: Blob
  createdAt: number
}

export interface ColoringResume {
  templateId: string
  imageBlob: Blob
  updatedAt: number
}

export interface ColoringDraft {
  id: string
  templateId: string
  imageBlob: Blob
  updatedAt: number
}

export interface ColoringFinished {
  id: string
  templateId: string | null
  imageBlob: Blob
  createdAt: number
}

export interface ColoringLabelCache {
  templateId: string
  width: number
  height: number
  version: number
  labelsBlob: Blob
}
