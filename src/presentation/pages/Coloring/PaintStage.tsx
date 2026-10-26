import { useEffect, useRef, useState } from 'react'
import {
  PaintSession,
  clientToCanvas,
  type RegionLabels,
  type StrokeTool,
} from './paintSession'

interface PaintStageProps {
  width: number
  height: number
  lineArtUrl: string
  initialBlob: Blob | null
  initialDirty: boolean
  tool: StrokeTool | 'fill'
  color: string
  labels: RegionLabels | null
  fillEnabled: boolean
  onSession: (session: PaintSession | null) => void
  onHistory: (canUndo: boolean) => void
  onLineArt: (image: HTMLImageElement) => void
  onLineArtError: () => void
  onError: (message: string) => void
}

interface PointerPoint {
  x: number
  y: number
}

interface PinchStart {
  distance: number
  scale: number
  contentX: number
  contentY: number
}

export default function PaintStage({
  width,
  height,
  lineArtUrl,
  initialBlob,
  initialDirty,
  tool,
  color,
  labels,
  fillEnabled,
  onSession,
  onHistory,
  onLineArt,
  onLineArtError,
  onError,
}: PaintStageProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<PaintSession | null>(null)
  const initialBlobRef = useRef(initialBlob)
  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const labelsRef = useRef(labels)
  const fillEnabledRef = useRef(fillEnabled)
  const onSessionRef = useRef(onSession)
  const onHistoryRef = useRef(onHistory)
  const onErrorRef = useRef(onError)
  const onLineArtRef = useRef(onLineArt)
  const onLineArtErrorRef = useRef(onLineArtError)
  const pointers = useRef(new Map<number, PointerPoint>())
  const pinchRef = useRef<PinchStart | null>(null)
  const readyRef = useRef(false)
  const tentativeTouchPointerRef = useRef<number | null>(null)
  const tentativeTouchWasDirtyRef = useRef(false)
  const pendingTouchFillRef = useRef<number | null>(null)
  const viewSizeRef = useRef({ w: 0, h: 0 })
  const transformRef = useRef({ scale: 1, x: 0, y: 0 })
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 })
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [fitted, setFitted] = useState(false)

  toolRef.current = tool
  colorRef.current = color
  labelsRef.current = labels
  fillEnabledRef.current = fillEnabled
  onSessionRef.current = onSession
  onHistoryRef.current = onHistory
  onErrorRef.current = onError
  onLineArtRef.current = onLineArt
  onLineArtErrorRef.current = onLineArtError
  viewSizeRef.current = viewSize
  transformRef.current = transform

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    let session: PaintSession
    try {
      session = new PaintSession(canvas)
    } catch (err) {
      console.error('[Coloring] 画布创建失败:', err)
      onErrorRef.current('画布不可用')
      return
    }
    session.setHistoryListener((canUndo) => onHistoryRef.current(canUndo))
    sessionRef.current = session
    readyRef.current = false
    let cancelled = false
    void session.loadBlob(initialBlobRef.current, initialDirty).then(() => {
      if (cancelled) return
      readyRef.current = true
      onSessionRef.current(session)
    }).catch((err) => {
      console.error('[Coloring] 颜色层载入失败:', err)
      if (!cancelled) onErrorRef.current('颜色没有载入')
    })
    return () => {
      cancelled = true
      readyRef.current = false
      session.setHistoryListener(null)
    }
  }, [width, height, initialDirty])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () => {
      setViewSize({ w: viewport.clientWidth, h: viewport.clientHeight })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    const block = (event: Event) => event.preventDefault()
    viewport.addEventListener('touchstart', block, { passive: false })
    viewport.addEventListener('gesturestart', block)
    return () => {
      observer.disconnect()
      viewport.removeEventListener('touchstart', block)
      viewport.removeEventListener('gesturestart', block)
    }
  }, [])

  useEffect(() => {
    if (viewSize.w <= 0 || viewSize.h <= 0) return
    const min = Math.min(viewSize.w / width, viewSize.h / height)
    setTransform((current) => {
      const scale = fitted
        ? Math.min(min * 4, Math.max(min, current.scale))
        : min
      const contentW = width * scale
      const contentH = height * scale
      const x = contentW <= viewSize.w
        ? (viewSize.w - contentW) / 2
        : Math.min(0, Math.max(viewSize.w - contentW, fitted ? current.x : (viewSize.w - contentW) / 2))
      const y = contentH <= viewSize.h
        ? (viewSize.h - contentH) / 2
        : Math.min(0, Math.max(viewSize.h - contentH, fitted ? current.y : (viewSize.h - contentH) / 2))
      return { scale, x, y }
    })
    setFitted(true)
  }, [viewSize.w, viewSize.h, width, height, fitted])

  const fitScale = () => {
    const view = viewSizeRef.current
    if (view.w <= 0 || view.h <= 0) return 1
    return Math.min(view.w / width, view.h / height)
  }

  const clampScale = (scale: number) => {
    const min = fitScale()
    return Math.min(min * 4, Math.max(min, scale))
  }

  const clampPan = (x: number, y: number, scale: number) => {
    const view = viewSizeRef.current
    const contentW = width * scale
    const contentH = height * scale
    const nextX = contentW <= view.w
      ? (view.w - contentW) / 2
      : Math.min(0, Math.max(view.w - contentW, x))
    const nextY = contentH <= view.h
      ? (view.h - contentH) / 2
      : Math.min(0, Math.max(view.h - contentH, y))
    return { x: nextX, y: nextY }
  }

  const localPoint = (clientX: number, clientY: number): PointerPoint => {
    const viewport = viewportRef.current
    if (!viewport) return { x: clientX, y: clientY }
    const rect = viewport.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const beginPinch = () => {
    const points = [...pointers.current.values()]
    const first = points[0]
    const second = points[1]
    if (!first || !second) return
    const distance = Math.hypot(first.x - second.x, first.y - second.y)
    if (distance <= 0) return
    const current = transformRef.current
    const midX = (first.x + second.x) / 2
    const midY = (first.y + second.y) / 2
    pinchRef.current = {
      distance,
      scale: current.scale,
      contentX: (midX - current.x) / current.scale,
      contentY: (midY - current.y) / current.scale,
    }
  }

  const updatePinch = () => {
    const pinch = pinchRef.current
    if (!pinch) return
    const points = [...pointers.current.values()]
    const first = points[0]
    const second = points[1]
    if (!first || !second) return
    const distance = Math.hypot(first.x - second.x, first.y - second.y)
    if (distance <= 0) return
    const scale = clampScale(pinch.scale * (distance / pinch.distance))
    const midX = (first.x + second.x) / 2
    const midY = (first.y + second.y) / 2
    const pan = clampPan(midX - pinch.contentX * scale, midY - pinch.contentY * scale, scale)
    setTransform({ scale, x: pan.x, y: pan.y })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    viewportRef.current?.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, localPoint(event.clientX, event.clientY))
    if (pointers.current.size >= 2) {
      const session = sessionRef.current
      session?.endStroke()
      if (tentativeTouchPointerRef.current !== null) {
        session?.undo()
        if (!tentativeTouchWasDirtyRef.current) session?.markClean()
        tentativeTouchPointerRef.current = null
      }
      pendingTouchFillRef.current = null
      beginPinch()
      return
    }
    const canvas = canvasRef.current
    const session = sessionRef.current
    if (!canvas || !session || !readyRef.current) return
    const point = clientToCanvas(canvas, event.clientX, event.clientY)
    if (!point) return
    const currentTool = toolRef.current
    if (currentTool === 'fill') {
      if (!fillEnabledRef.current) return
      if (event.pointerType === 'touch') {
        pendingTouchFillRef.current = event.pointerId
      } else {
        session.fillAt(point.x, point.y, colorRef.current, labelsRef.current)
      }
      return
    }
    const wasDirty = session.isDirty
    session.beginStroke(point.x, point.y, currentTool, colorRef.current)
    if (event.pointerType === 'touch') {
      tentativeTouchPointerRef.current = event.pointerId
      tentativeTouchWasDirtyRef.current = wasDirty
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, localPoint(event.clientX, event.clientY))
    if (pointers.current.size >= 2) {
      updatePinch()
      return
    }
    if (pinchRef.current) return
    const canvas = canvasRef.current
    const session = sessionRef.current
    if (!canvas || !session || toolRef.current === 'fill') return
    const point = clientToCanvas(canvas, event.clientX, event.clientY)
    if (!point) return
    session.extendStroke(point.x, point.y)
  }

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!cancelled && pendingTouchFillRef.current === event.pointerId && pointers.current.size === 1) {
      const canvas = canvasRef.current
      const session = sessionRef.current
      const point = canvas ? clientToCanvas(canvas, event.clientX, event.clientY) : null
      if (session && point && readyRef.current && fillEnabledRef.current) {
        session.fillAt(point.x, point.y, colorRef.current, labelsRef.current)
      }
    }
    if (pendingTouchFillRef.current === event.pointerId) pendingTouchFillRef.current = null
    pointers.current.delete(event.pointerId)
    if (tentativeTouchPointerRef.current === event.pointerId) {
      tentativeTouchPointerRef.current = null
    }
    if (pointers.current.size < 2) pinchRef.current = null
    if (pointers.current.size === 0) sessionRef.current?.endStroke()
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishPointer(event, false)
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    finishPointer(event, true)
  }

  return (
    <div
      ref={viewportRef}
      className="relative min-h-0 flex-1 overflow-hidden"
      style={{ touchAction: 'none', background: '#fff' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          opacity: fitted ? 1 : 0,
          isolation: 'isolate',
          background: '#fff',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: '#fff' }} />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <img
          src={lineArtUrl}
          alt=""
          draggable={false}
          className="no-native-img-gestures"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            mixBlendMode: 'multiply',
          }}
          onLoad={(event) => onLineArtRef.current(event.currentTarget)}
          onError={() => onLineArtErrorRef.current()}
        />
      </div>
    </div>
  )
}
