import { useEffect, useState } from 'react'
import type { ColoringTemplate } from '@/domain/coloring/types'

export function coloringAssetUrl(publicPath: string): string {
  if (publicPath.length === 0) return ''
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  const encoded = publicPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `${prefix}${encoded}`
}

export function useBlobUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const next = URL.createObjectURL(blob)
    setUrl(next)
    return () => URL.revokeObjectURL(next)
  }, [blob])

  return url
}

export function useTemplateLineUrl(template: ColoringTemplate | null): string | null {
  const importedBlob = template?.kind === 'imported' ? template.imageBlob ?? null : null
  const blobUrl = useBlobUrl(importedBlob)
  if (!template) return null
  if (template.kind === 'builtin') return coloringAssetUrl(template.publicPath)
  return blobUrl
}
