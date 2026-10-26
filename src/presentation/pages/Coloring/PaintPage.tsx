import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUUpLeft, Eraser, PaintBrush, PaintBucket } from '@phosphor-icons/react'
import type { ColoringTemplate } from '@/domain/coloring/types'
import { labelRegionsAsync } from '@/domain/coloring/labelRegions'
import { coloringService } from '@/shared/container'
import { ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import ColorBar from './ColorBar'
import CustomColorSheet from './CustomColorSheet'
import PaintStage from './PaintStage'
import StrokeSizeControls, {
  BRUSH_SIZE_DEFAULT,
  BRUSH_SIZE_MAX,
  BRUSH_SIZE_MIN,
  ERASER_SIZE_DEFAULT,
  ERASER_SIZE_MAX,
  ERASER_SIZE_MIN,
} from './StrokeSizeControls'
import { useTemplateLineUrl } from './coloringAssets'
import { readStoredCustomColor } from './customColor'
import { PaintSession, rasterizeLineArt, type RegionLabels, type StrokeTool } from './paintSession'
import {
  clearRecoveryBlob,
  draftRecoveryKey,
  readRecoveryBlob,
  templateRecoveryKey,
  writeRecoveryBlob,
} from './paintRecovery'

type PaintTool = StrokeTool | 'fill'
type FillState = 'checking' | 'computing' | 'ready' | 'failed'

const BRUSH_SIZE_STORAGE_KEY = 'coloring.brushSize'
const ERASER_SIZE_STORAGE_KEY = 'coloring.eraserSize'

interface PaintModel {
  template: ColoringTemplate
  draftId: string | null
  initialBlob: Blob | null
  initialDirty: boolean
  recoveryKey: string
}

function normalizeStrokeSize(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function readStoredStrokeSize(key: string, min: number, max: number, fallback: number): number {
  try {
    const stored = window.localStorage.getItem(key)
    if (stored === null || stored.trim() === '') return fallback
    return normalizeStrokeSize(Number(stored), min, max, fallback)
  } catch {
    return fallback
  }
}

function writeStoredStrokeSize(key: string, value: number): void {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // The current page still uses the selected size when storage is unavailable.
  }
}

export default function PaintPage() {
  const navigate = useNavigate()
  const { templateId, draftId } = useParams()
  const [model, setModel] = useState<PaintModel | null>(null)
  const [loadError, setLoadError] = useState('')
  const [tool, setTool] = useState<PaintTool>('brush')
  const [brushSize, setBrushSize] = useState(() => (
    readStoredStrokeSize(BRUSH_SIZE_STORAGE_KEY, BRUSH_SIZE_MIN, BRUSH_SIZE_MAX, BRUSH_SIZE_DEFAULT)
  ))
  const [eraserSize, setEraserSize] = useState(() => (
    readStoredStrokeSize(ERASER_SIZE_STORAGE_KEY, ERASER_SIZE_MIN, ERASER_SIZE_MAX, ERASER_SIZE_DEFAULT)
  ))
  const [penColor, setPenColor] = useState('#ff8a8a')
  const [customColor, setCustomColor] = useState(() => readStoredCustomColor() ?? '#e84393')
  const [usingCustom, setUsingCustom] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [fillState, setFillState] = useState<FillState>('checking')
  const [labels, setLabels] = useState<RegionLabels | null>(null)
  const [lineReady, setLineReady] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [saving, setSaving] = useState(false)

  const sessionRef = useRef<PaintSession | null>(null)
  const modelRef = useRef<PaintModel | null>(null)
  const lineArtRef = useRef<HTMLImageElement | null>(null)
  const skipAutosave = useRef(false)
  const persistLock = useRef<Promise<boolean> | null>(null)
  const processingRef = useRef(false)
  const tokenRef = useRef(0)
  modelRef.current = model

  const lineUrl = useTemplateLineUrl(model?.template ?? null)

  const persist = useCallback(async (): Promise<boolean> => {
    if (skipAutosave.current) return true
    if (persistLock.current) return persistLock.current
    const session = sessionRef.current
    const current = modelRef.current
    if (!session || !current || !session.isDirty) return true
    const job = (async () => {
      while (session.isDirty) {
        let blob: Blob | null = null
        const revision = session.currentRevision
        try {
          blob = await session.toColorBlob()
          if (skipAutosave.current) return true
          if (current.draftId) await coloringService.updateDraft(current.draftId, blob)
          else await coloringService.saveResume(current.template.id, blob)
          clearRecoveryBlob(current.recoveryKey)
          session.markClean(revision)
        } catch (err) {
          console.error('[Coloring] 自动保存失败:', err)
          if (blob) writeRecoveryBlob(current.recoveryKey, blob)
          return false
        }
      }
      return true
    })()
    persistLock.current = job
    try {
      return await job
    } finally {
      if (persistLock.current === job) persistLock.current = null
    }
  }, [])

  useEffect(() => {
    const saveInBackground = () => {
      void persist().then((ok) => {
        if (!ok) toast.error('未保存成功')
      })
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveInBackground()
    }
    window.addEventListener('pagehide', saveInBackground)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', saveInBackground)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      saveInBackground()
    }
  }, [persist])

  useEffect(() => {
    let cancelled = false
    void persist()
    setModel(null)
    setLoadError('')
    setLabels(null)
    setFillState('checking')
    setLineReady(false)
    setSessionReady(false)
    setCanUndo(false)
    setTool('brush')
    lineArtRef.current = null
    sessionRef.current = null
    skipAutosave.current = false

    void (async () => {
      try {
        await coloringService.ensureBuiltinTemplate()
        if (draftId) {
          const draft = await coloringService.getDraft(draftId)
          if (cancelled) return
          if (!draft) {
            toast.error('找不到这份半成品')
            navigate(ROUTES.COLORING_DRAFTS, { replace: true })
            return
          }
          const template = await coloringService.getTemplate(draft.templateId)
          if (cancelled) return
          if (!template) {
            toast.error('找不到这张线稿')
            navigate(ROUTES.COLORING_DRAFTS, { replace: true })
            return
          }
          const recoveryKey = draftRecoveryKey(draftId)
          const recovered = readRecoveryBlob(recoveryKey)
          setModel({
            template,
            draftId,
            initialBlob: recovered ?? draft.imageBlob,
            initialDirty: recovered !== null,
            recoveryKey,
          })
          return
        }
        if (!templateId) {
          navigate(ROUTES.COLORING, { replace: true })
          return
        }
        const template = await coloringService.getTemplate(templateId)
        if (cancelled) return
        if (!template) {
          toast.error('找不到这张线稿')
          navigate(ROUTES.COLORING, { replace: true })
          return
        }
        const resume = await coloringService.getResumeBlob(template.id)
        if (cancelled) return
        const recoveryKey = templateRecoveryKey(template.id)
        const recovered = readRecoveryBlob(recoveryKey)
        setModel({
          template,
          draftId: null,
          initialBlob: recovered ?? resume,
          initialDirty: recovered !== null,
          recoveryKey,
        })
      } catch (err) {
        console.error('[Coloring] 打开涂色失败:', err)
        if (!cancelled) setLoadError('涂色没有打开')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [templateId, draftId, navigate, persist])

  useEffect(() => {
    if (!model) return
    const token = ++tokenRef.current
    const template = model.template
    void (async () => {
      try {
        const cached = await coloringService.readLabelCache(template.id, template.width, template.height)
        if (tokenRef.current !== token) return
        if (cached) {
          setLabels(cached)
          setFillState('ready')
          return
        }
        setFillState('computing')
      } catch (err) {
        console.error('[Coloring] 读取分区缓存失败:', err)
        if (tokenRef.current !== token) return
        setFillState('computing')
      }
    })()
    return () => {
      tokenRef.current += 1
    }
  }, [model])

  useEffect(() => {
    if (!model || fillState !== 'computing' || !lineReady) return
    const image = lineArtRef.current
    if (!image) return
    const token = tokenRef.current
    const template = model.template
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const pixels = rasterizeLineArt(image, template.width, template.height)
          const result = await labelRegionsAsync(
            pixels,
            template.width,
            template.height,
            () => cancelled || tokenRef.current !== token,
          )
          if (cancelled || tokenRef.current !== token) return
          if (!result.ok) {
            setFillState('failed')
            toast.error('这张图暂时不能点块填充')
            return
          }
          setLabels(result.labels)
          setFillState('ready')
          try {
            await coloringService.writeLabelCache(
              template.id,
              template.width,
              template.height,
              result.labels,
              result.regionCount,
            )
          } catch (err) {
            console.error('[Coloring] 分区缓存写入失败:', err)
          }
        } catch (err) {
          console.error('[Coloring] 分区失败:', err)
          if (cancelled || tokenRef.current !== token) return
          setFillState('failed')
          toast.error('这张图暂时不能点块填充')
        }
      })()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [model, fillState, lineReady])

  const handleBack = async () => {
    if (processingRef.current) return
    const session = sessionRef.current
    processingRef.current = true
    setSaving(true)
    session?.setLocked(true)
    const ok = await persist()
    processingRef.current = false
    setSaving(false)
    if (!ok) {
      session?.setLocked(false)
      toast.error('未保存成功')
      return
    }
    skipAutosave.current = true
    navigate(model?.draftId ? ROUTES.COLORING_DRAFTS : ROUTES.COLORING)
  }

  const handleSaveDraft = async () => {
    const session = sessionRef.current
    const current = modelRef.current
    if (!session || !current || processingRef.current) return
    processingRef.current = true
    setSaving(true)
    session.setLocked(true)
    const revision = session.currentRevision
    const editingDraft = current.draftId
    if (!editingDraft) skipAutosave.current = true
    let blob: Blob | null = null
    try {
      blob = await session.toColorBlob()
      if (editingDraft) {
        await coloringService.createDraft(current.template.id, blob)
        toast.success('已另存一份半成品')
      } else {
        await coloringService.archiveResumeAsDraft(current.template.id, blob)
        clearRecoveryBlob(current.recoveryKey)
        session.markClean(revision)
        toast.success('已存入草稿')
        navigate(ROUTES.COLORING)
      }
    } catch (err) {
      console.error('[Coloring] 存草稿失败:', err)
      if (!editingDraft) skipAutosave.current = false
      if (blob) writeRecoveryBlob(current.recoveryKey, blob)
      toast.error('未保存成功')
    } finally {
      session.setLocked(false)
      processingRef.current = false
      setSaving(false)
    }
  }

  const handleSaveFinished = async () => {
    const session = sessionRef.current
    const current = modelRef.current
    const image = lineArtRef.current
    if (!session || !current || processingRef.current) return
    if (!image || !image.complete || image.naturalWidth === 0) {
      toast.error('线稿还没准备好')
      return
    }
    processingRef.current = true
    setSaving(true)
    session.setLocked(true)
    const revision = session.currentRevision
    const editingDraft = current.draftId
    if (!editingDraft) skipAutosave.current = true
    try {
      const blob = await session.toFinishedBlob(image)
      if (editingDraft) {
        await coloringService.saveFinished(blob, current.template.id)
        toast.success('已保存成品')
      } else {
        await coloringService.saveFinishedFromTemplate(current.template.id, blob)
        clearRecoveryBlob(current.recoveryKey)
        session.markClean(revision)
        toast.success('已保存成品')
        navigate(ROUTES.COLORING)
      }
    } catch (err) {
      console.error('[Coloring] 保存成品失败:', err)
      if (!editingDraft) skipAutosave.current = false
      try {
        writeRecoveryBlob(current.recoveryKey, await session.toColorBlob())
      } catch (recoveryErr) {
        console.error('[Coloring] 成品失败后的颜色层保留失败:', recoveryErr)
      }
      toast.error('成品没有保存成功')
    } finally {
      session.setLocked(false)
      processingRef.current = false
      setSaving(false)
    }
  }

  const backLabel = model?.draftId ? '半成品' : '画册'

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
      <div className="flex items-center" style={{ gap: '8px', padding: '8px 12px' }}>
        <button
          type="button"
          onClick={() => { void handleBack() }}
          className="flex items-center"
          style={{ gap: '4px', minHeight: '44px', border: 'none', background: 'none', fontWeight: 700 }}
        >
          <ArrowLeft size={20} weight="bold" />
          {backLabel}
        </button>
        <h1 className="flex-1 text-center" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>涂色</h1>
        <button
          type="button"
          aria-label="撤销"
          disabled={!canUndo || saving || !sessionReady}
          onClick={() => { sessionRef.current?.undo() }}
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            borderRadius: '12px',
            background: '#fff',
            opacity: canUndo && !saving && sessionReady ? 1 : 0.4,
          }}
        >
          <ArrowUUpLeft size={20} weight="bold" />
        </button>
      </div>

      {loadError && (
        <p style={{ margin: '24px', color: 'var(--color-text-sub)' }}>{loadError}</p>
      )}
      {!loadError && !model && (
        <p style={{ margin: '24px', color: 'var(--color-text-sub)' }}>正在打开…</p>
      )}
      {model && lineUrl && (
        <PaintStage
          key={model.draftId ?? model.template.id}
          width={model.template.width}
          height={model.template.height}
          lineArtUrl={lineUrl}
          initialBlob={model.initialBlob}
          initialDirty={model.initialDirty}
          tool={tool}
          color={penColor}
          brushSize={brushSize}
          eraserSize={eraserSize}
          labels={labels}
          fillEnabled={fillState === 'ready'}
          onSession={(session) => {
            sessionRef.current = session
            setSessionReady(session !== null)
          }}
          onHistory={setCanUndo}
          onLineArt={(image) => {
            lineArtRef.current = image
            setLineReady(true)
          }}
          onLineArtError={() => {
            lineArtRef.current = null
            setLineReady(false)
            setFillState('failed')
            toast.error('线稿没有载入')
          }}
          onError={(message) => toast.error(message)}
        />
      )}

      <div className="shrink-0" style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="flex" style={{ gap: '8px' }}>
          <ToolButton
            label="手涂"
            active={tool === 'brush'}
            disabled={!sessionReady || saving}
            onClick={() => setTool('brush')}
            icon={<PaintBrush size={18} weight="bold" />}
          />
          <ToolButton
            label="填色"
            active={tool === 'fill'}
            disabled={!sessionReady || saving || fillState !== 'ready'}
            onClick={() => setTool('fill')}
            icon={<PaintBucket size={18} weight="bold" />}
          />
          <ToolButton
            label="橡皮"
            active={tool === 'eraser'}
            disabled={!sessionReady || saving}
            onClick={() => setTool('eraser')}
            icon={<Eraser size={18} weight="bold" />}
          />
        </div>
        <StrokeSizeControls
          brushSize={brushSize}
          eraserSize={eraserSize}
          onBrushSizeChange={(size) => {
            const next = normalizeStrokeSize(size, BRUSH_SIZE_MIN, BRUSH_SIZE_MAX, BRUSH_SIZE_DEFAULT)
            setBrushSize(next)
            writeStoredStrokeSize(BRUSH_SIZE_STORAGE_KEY, next)
          }}
          onEraserSizeChange={(size) => {
            const next = normalizeStrokeSize(size, ERASER_SIZE_MIN, ERASER_SIZE_MAX, ERASER_SIZE_DEFAULT)
            setEraserSize(next)
            writeStoredStrokeSize(ERASER_SIZE_STORAGE_KEY, next)
          }}
        />
        {fillState === 'computing' && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-sub)' }}>正在准备填色，可以先用手涂</p>
        )}
        {fillState === 'failed' && (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-sub)' }}>这张图暂时不能点块填充</p>
        )}
        <ColorBar
          color={penColor}
          usingCustom={usingCustom}
          customColor={customColor}
          onSelect={(next) => {
            setUsingCustom(false)
            setPenColor(next)
          }}
          onOpenCustom={() => setCustomOpen(true)}
        />
        <div className="flex" style={{ gap: '8px' }}>
          <ActionButton label="存入草稿" disabled={saving || !model || !sessionReady} onClick={() => { void handleSaveDraft() }} />
          <ActionButton label="保存成品" disabled={saving || !model || !sessionReady || !lineReady} onClick={() => { void handleSaveFinished() }} primary />
        </div>
      </div>

      <CustomColorSheet
        visible={customOpen}
        onClose={() => setCustomOpen(false)}
        onChange={(hex) => {
          setCustomColor(hex)
          setPenColor(hex)
          setUsingCustom(true)
        }}
      />
    </div>
  )
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  icon,
}: {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className="flex flex-1 items-center justify-center"
      style={{
        minHeight: '44px',
        gap: '4px',
        border: 'none',
        borderRadius: '14px',
        background: active ? '#7ECFC0' : '#fff',
        color: active ? '#fff' : '#4A4A4A',
        fontWeight: 700,
        fontSize: '14px',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function ActionButton({
  label,
  onClick,
  disabled,
  primary = false,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex-1"
      style={{
        minHeight: '44px',
        border: 'none',
        borderRadius: '14px',
        background: primary ? '#FF9BB0' : '#fff',
        color: primary ? '#fff' : '#4A4A4A',
        fontWeight: 700,
        fontSize: '15px',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  )
}
