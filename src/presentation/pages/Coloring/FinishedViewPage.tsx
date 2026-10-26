import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import type { ColoringFinished } from '@/domain/coloring/types'
import ConfirmDialog from '@/presentation/pages/Settings/ConfirmDialog'
import { coloringService } from '@/shared/container'
import { ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import { useBlobUrl } from './coloringAssets'

export default function FinishedViewPage() {
  const navigate = useNavigate()
  const { finishedId } = useParams()
  const [item, setItem] = useState<ColoringFinished | null>(null)
  const [missing, setMissing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const url = useBlobUrl(item?.imageBlob ?? null)

  useEffect(() => {
    let cancelled = false
    if (!finishedId) {
      navigate(ROUTES.COLORING_FINISHED, { replace: true })
      return
    }
    void coloringService.getFinished(finishedId).then((found) => {
      if (cancelled) return
      if (!found) {
        setMissing(true)
        toast.error('找不到这张成品')
        return
      }
      setItem(found)
    }).catch((err) => {
      console.error('[Coloring] 打开成品失败:', err)
      if (!cancelled) toast.error('成品没有打开')
    })
    return () => {
      cancelled = true
    }
  }, [finishedId, navigate])

  const handleDelete = async () => {
    if (!item) return
    try {
      await coloringService.deleteFinished(item.id)
      toast.success('已删除')
      navigate(ROUTES.COLORING_FINISHED)
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
          aria-label="返回成品"
          onClick={() => navigate(ROUTES.COLORING_FINISHED)}
          style={{ width: '36px', height: '36px', border: 'none', background: 'none' }}
        >
          <ArrowLeft size={22} weight="bold" />
        </button>
        <h1 className="flex-1" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>成品</h1>
        {item && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            style={{
              minHeight: '44px',
              border: 'none',
              borderRadius: '12px',
              background: '#fff',
              color: '#FF8A80',
              fontWeight: 700,
              padding: '0 14px',
            }}
          >
            删除
          </button>
        )}
      </div>
      {missing && <p style={{ margin: 0, color: 'var(--color-text-sub)' }}>这张成品不在了</p>}
      {url && (
        <img
          src={url}
          alt="涂好的画"
          draggable={false}
          className="no-native-img-gestures"
          style={{ width: '100%', height: 'auto', background: '#fff', borderRadius: '16px' }}
        />
      )}
      <ConfirmDialog
        visible={confirming}
        title="删除成品"
        message="删除后这张图片就没有了。"
        confirmLabel="删除"
        danger
        onConfirm={() => { void handleDelete() }}
        onCancel={() => setConfirming(false)}
      />
    </div>
  )
}
