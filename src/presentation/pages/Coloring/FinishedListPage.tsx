import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import type { ColoringFinished } from '@/domain/coloring/types'
import ConfirmDialog from '@/presentation/pages/Settings/ConfirmDialog'
import { coloringService } from '@/shared/container'
import { coloringFinishedPath, ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import { useBlobUrl } from './coloringAssets'

export default function FinishedListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ColoringFinished[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const reload = async () => {
    setItems(await coloringService.listFinished())
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    void reload().catch((err) => {
      console.error('[Coloring] 成品加载失败:', err)
      if (!cancelled) {
        setLoading(false)
        toast.error('成品没有打开')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async () => {
    if (!pendingId) return
    try {
      await coloringService.deleteFinished(pendingId)
      setPendingId(null)
      toast.success('已删除')
      await reload()
    } catch (err) {
      console.error('[Coloring] 删除成品失败:', err)
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
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>成品</h1>
      </div>
      {loading && <p style={{ margin: 0, color: 'var(--color-text-sub)' }}>正在打开…</p>}
      {!loading && items.length === 0 && (
        <p style={{ margin: '32px 0', textAlign: 'center', color: 'var(--color-text-sub)' }}>还没有成品</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '12px' }}>
        {items.map((item) => (
          <FinishedCard
            key={item.id}
            item={item}
            onOpen={() => navigate(coloringFinishedPath(item.id))}
            onDelete={() => setPendingId(item.id)}
          />
        ))}
      </div>
      <ConfirmDialog
        visible={pendingId !== null}
        title="删除成品"
        message="删除后这张图片就没有了。"
        confirmLabel="删除"
        danger
        onConfirm={() => { void handleDelete() }}
        onCancel={() => setPendingId(null)}
      />
    </div>
  )
}

function FinishedCard({
  item,
  onOpen,
  onDelete,
}: {
  item: ColoringFinished
  onOpen: () => void
  onDelete: () => void
}) {
  const url = useBlobUrl(item.imageBlob)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full overflow-hidden"
        style={{ border: 'none', borderRadius: '18px', background: '#fff', padding: 0, boxShadow: '4px 4px 10px rgba(0,0,0,0.08)' }}
      >
        {url && (
          <img src={url} alt="成品" draggable={false} className="no-native-img-gestures" style={{ display: 'block', width: '100%', height: 'auto' }} />
        )}
      </button>
      <button
        type="button"
        aria-label="删除成品"
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
