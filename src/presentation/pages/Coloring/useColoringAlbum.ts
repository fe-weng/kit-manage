import { useCallback, useEffect, useState } from 'react'
import type { ColoringTemplate } from '@/domain/coloring/types'
import { coloringService } from '@/shared/container'
import { toast } from '@/shared/toast'

export function useColoringAlbum() {
  const [templates, setTemplates] = useState<ColoringTemplate[]>([])
  const [resumeIds, setResumeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    await coloringService.ensureBuiltinTemplate()
    const [list, ids] = await Promise.all([
      coloringService.listTemplates(),
      coloringService.listResumeTemplateIds(),
    ])
    setTemplates(list)
    setResumeIds(ids)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void reload().catch((err) => {
      console.error('[Coloring] 画册加载失败:', err)
      if (!cancelled) {
        setLoading(false)
        toast.error('画册没有打开')
      }
    })
    return () => {
      cancelled = true
    }
  }, [reload])

  const importFile = useCallback(async (file: File) => {
    try {
      await coloringService.importImage(file)
      toast.success('图片已加入画册')
      await reload()
    } catch (err) {
      console.error('[Coloring] 导入失败:', err)
      toast.error(err instanceof Error ? err.message : '这张图打不开')
    }
  }, [reload])

  const removeImported = useCallback(async (id: string) => {
    try {
      await coloringService.deleteImportedTemplate(id)
      toast.success('已删除')
      await reload()
    } catch (err) {
      console.error('[Coloring] 删除线稿失败:', err)
      toast.error('删除失败')
    }
  }, [reload])

  return { templates, resumeIds, loading, importFile, removeImported }
}
