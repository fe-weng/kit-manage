export const BUILTIN_TEMPLATE_ID = 'builtin-bird'

/** public/ 下的文件名，含中文和间隔号，不要改名。 */
export const BUILTIN_SVG_FILE = '宠物填色线稿 · iPad 竖屏 1024×1366 · 可换装.svg'

export const BUILTIN_WIDTH = 1024
export const BUILTIN_HEIGHT = 1366

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
