import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import type { ColoringDraft, ColoringTemplate } from '@/domain/coloring/types'
import ConfirmDialog from '@/presentation/pages/Settings/ConfirmDialog'
import { coloringService } from '@/shared/container'
import { coloringDraftPath, ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import { useTemplateLineUrl } from './coloringAssets'
import StackedPreview from './StackedPreview'

export default function DraftListPage() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<ColoringDraft[]>([])
  const [templates, setTemplates] = useState<Map<string, ColoringTemplate>>(new Map())
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const reload = async () => {
    const [draftList, templateList] = await Promise.all([
      coloringService.listDrafts(),
      coloringService.listTemplates(),
    ])
    setDrafts(draftList)
    setTemplates(new Map(templateList.map((template) => [template.id, template])))
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    void reload().catch((err) => {
      console.error('[Coloring] 半成品加载失败:', err)
      if (!cancelled) {
        setLoading(false)
        toast.error('半成品没有打开')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async () => {
    if (!pendingId) return
    try {
      await coloringService.deleteDraft(pendingId)
      setPendingId(null)
      toast.success('已删除')
      await reload()
    } catch (err) {
      console.error('[Coloring] 删除半成品失败:', err)
      toast.error('删除失败')
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 12px)',
        paddingBottom: '24px',
        paddingLeft: '16px',
        paddingRight: '16px',
        gap: '16px',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        <button
          type="button"
          aria-label="返回画册"
          onClick={() => navigate(ROUTES.COLORING)}
          style={{ width: '36px', height: '36px', border: 'none', background: 'none' }}
        >
          <ArrowLeft size={22} weight="bold" />
        </button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>半成品</h1>
      </div>
      {loading && <p style={{ margin: 0, color: 'var(--color-text-sub)' }}>正在打开…</p>}
      {!loading && drafts.length === 0 && (
        <p style={{ margin: '32px 0', textAlign: 'center', color: 'var(--color-text-sub)' }}>还没有半成品</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '12px' }}>
        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            template={templates.get(draft.templateId) ?? null}
            onOpen={() => navigate(coloringDraftPath(draft.id))}
            onDelete={() => setPendingId(draft.id)}
          />
        ))}
      </div>
      <ConfirmDialog
        visible={pendingId !== null}
        title="删除半成品"
        message="删除后就不能再接着涂这一份。"
        confirmLabel="删除"
        danger
        onConfirm={() => { void handleDelete() }}
        onCancel={() => setPendingId(null)}
      />
    </div>
  )
}

function DraftCard({
  draft,
  template,
  onOpen,
  onDelete,
}: {
  draft: ColoringDraft
  template: ColoringTemplate | null
  onOpen: () => void
  onDelete: () => void
}) {
  const lineUrl = useTemplateLineUrl(template)
  const width = template?.width ?? 1024
  const height = template?.height ?? 1366

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full overflow-hidden text-left"
        style={{ border: 'none', borderRadius: '18px', background: '#fff', padding: 0, boxShadow: '4px 4px 10px rgba(0,0,0,0.08)' }}
      >
        <StackedPreview
          lineUrl={lineUrl}
          colorBlob={draft.imageBlob}
          width={width}
          height={height}
          alt="半成品"
        />
      </button>
      <button
        type="button"
        aria-label="删除半成品"
        onClick={onDelete}
        style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          width: '32px',
          height: '32px',
          border: 'none',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.92)',
          color: '#FF8A80',
        }}
      >
        <Trash size={16} weight="bold" />
      </button>
    </div>
  )
}
