import { MAX_IMPORT_EDGE } from '@/domain/coloring/types'

export async function scaleImageToMaxEdge(
  bitmap: ImageBitmap,
  maxEdge: number = MAX_IMPORT_EDGE,
): Promise<{ blob: Blob; width: number; height: number }> {
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > maxEdge ? maxEdge / longest : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('这张图打不开')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })
  if (!blob) throw new Error('这张图打不开')
  return { blob, width, height }
}
