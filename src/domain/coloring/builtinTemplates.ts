export const BUILTIN_DRAW_ASSETS_DIR = 'pets/draw-assets'

export const BUILTIN_IPAD_WIDTH = 1024
export const BUILTIN_IPAD_HEIGHT = 1366

export interface BuiltinColoringTemplateDef {
  id: string
  fileName: string
  width: number
  height: number
}

/** 与 public/pets/draw-assets/ 下文件名一致；画册顺序即数组顺序。 */
export const BUILTIN_COLORING_TEMPLATES: BuiltinColoringTemplateDef[] = [
  {
    id: 'builtin-chicken-stage-3',
    fileName: 'chicken-stage-3-ipad.svg',
    width: BUILTIN_IPAD_WIDTH,
    height: BUILTIN_IPAD_HEIGHT,
  },
  {
    id: 'builtin-bird',
    fileName: 'chicken-stage-5-ipad.svg',
    width: BUILTIN_IPAD_WIDTH,
    height: BUILTIN_IPAD_HEIGHT,
  },
  {
    id: 'builtin-rabbit-stage-3',
    fileName: 'rabit-stage-3-ipad.svg',
    width: BUILTIN_IPAD_WIDTH,
    height: BUILTIN_IPAD_HEIGHT,
  },
  {
    id: 'builtin-rabbit-stage-4',
    fileName: 'rabbit-stage-4-ipad.svg',
    width: BUILTIN_IPAD_WIDTH,
    height: BUILTIN_IPAD_HEIGHT,
  },
]

export function builtinColoringPublicPath(fileName: string): string {
  return `${BUILTIN_DRAW_ASSETS_DIR}/${fileName}`
}

export function builtinColoringSortIndex(templateId: string): number {
  const index = BUILTIN_COLORING_TEMPLATES.findIndex((def) => def.id === templateId)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}
