import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash } from '@phosphor-icons/react'
import type { ColoringTemplate } from '@/domain/coloring/types'
import ConfirmDialog from '@/presentation/pages/Settings/ConfirmDialog'
import { coloringPaintPath, ROUTES } from '@/shared/constants'
import { useTemplateLineUrl } from './coloringAssets'
import { useColoringAlbum } from './useColoringAlbum'

export default function AlbumPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const { templates, resumeIds, loading, importFile, removeImported } = useColoringAlbum()
  const [pendingDelete, setPendingDelete] = useState<ColoringTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    void importFile(file)
  }

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    try {
      await removeImported(pendingDelete.id)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 16px)',
        paddingBottom: '24px',
        paddingLeft: '16px',
        paddingRight: '16px',
        gap: '16px',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>🎨 涂色</h1>
      <div className="flex" style={{ gap: '8px' }}>
        <AlbumAction label="半成品" onClick={() => navigate(ROUTES.COLORING_DRAFTS)} />
        <AlbumAction label="成品" onClick={() => navigate(ROUTES.COLORING_FINISHED)} />
        <AlbumAction label="添加图片" icon onClick={() => fileRef.current?.click()} />
      </div>
      <input
        ref={fileRef}
        type="file"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      {loading ? (
        <p style={{ margin: 0, color: 'var(--color-text-sub)' }}>正在打开画册…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: '12px' }}>
          {templates.map((template) => (
              <AlbumCard
                key={template.id}
                template={template}
                hasResume={resumeIds.includes(template.id)}
                onOpen={() => navigate(coloringPaintPath(template.id))}
                onDelete={template.kind === 'imported' ? () => setPendingDelete(template) : undefined}
              />
          ))}
        </div>
      )}
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="删除这张图片"
        message="会同时删除它的接着涂和半成品。已经保存的成品还会留着。"
        confirmLabel={deleting ? '删除中' : '删除'}
        danger
        onConfirm={() => { void handleDelete() }}
        onCancel={() => { if (!deleting) setPendingDelete(null) }}
      />
    </div>
  )
}

function AlbumAction({
  label,
  onClick,
  icon = false,
}: {
  label: string
  onClick: () => void
  icon?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center"
      style={{
        minHeight: '44px',
        gap: '4px',
        border: 'none',
        borderRadius: '14px',
        background: '#fff',
        color: 'var(--color-text-main)',
        fontWeight: 700,
        fontSize: '14px',
        boxShadow: '4px 4px 8px rgba(0,0,0,0.08)',
      }}
    >
      {icon && <Plus size={16} weight="bold" />}
      {label}
    </button>
  )
}

function AlbumCard({
  template,
  hasResume,
  onOpen,
  onDelete,
}: {
  template: ColoringTemplate
  hasResume: boolean
  onOpen: () => void
  onDelete?: () => void
}) {
  const lineUrl = useTemplateLineUrl(template)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onOpen}
        className="w-full overflow-hidden text-left"
        style={{
          border: 'none',
          borderRadius: '18px',
          background: '#fff',
          padding: 0,
          boxShadow: '4px 4px 10px rgba(0,0,0,0.08)',
        }}
      >
        <span className="block" style={{ background: '#fff' }}>
          {lineUrl ? (
            <img
              src={lineUrl}
              alt=""
              draggable={false}
              className="no-native-img-gestures"
              style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: `${template.width} / ${template.height}`, objectFit: 'cover', background: '#fff' }}
            />
          ) : (
            <span className="block" style={{ aspectRatio: `${template.width} / ${template.height}`, background: '#fff' }} />
          )}
        </span>
      </button>
      {hasResume && (
        <span
          style={{
            position: 'absolute',
            left: '8px',
            top: '8px',
            background: '#FF9BB0',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '999px',
            padding: '3px 8px',
          }}
        >
          接着涂
        </span>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label="删除图片"
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Trash size={16} weight="bold" />
        </button>
      )}
    </div>
  )
}
