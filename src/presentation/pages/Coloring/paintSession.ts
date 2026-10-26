const MAX_UNDO = 20

export type StrokeTool = 'brush' | 'eraser'
export type RegionLabels = Uint16Array | Uint32Array

export function clientToCanvas(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  }
}

export function rasterizeLineArt(
  image: CanvasImageSource,
  width: number,
  height: number,
): Uint8ClampedArray {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('无法读取线稿')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height).data
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex)
  const raw = match?.[1]
  if (raw === undefined) return null
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  }
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('导出图片失败'))
    }, 'image/png')
  })
}

export class PaintSession {
  private readonly ctx: CanvasRenderingContext2D
  private undoStack: ImageData[] = []
  private drawing = false
  private locked = true
  private lastX = 0
  private lastY = 0
  private strokeRadius = 0.5
  private strokeMode: StrokeTool = 'brush'
  private strokeColor = '#000000'
  private dirty = false
  private revision = 0
  private historyListener: ((canUndo: boolean) => void) | null = null

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('画布不可用')
    this.ctx = ctx
  }

  setHistoryListener(listener: ((canUndo: boolean) => void) | null): void {
    this.historyListener = listener
  }

  get isDirty(): boolean {
    return this.dirty
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0
  }

  get currentRevision(): number {
    return this.revision
  }

  setLocked(locked: boolean): void {
    this.locked = locked
    if (locked) this.endStroke()
  }

  markClean(expectedRevision: number = this.revision): boolean {
    if (this.revision !== expectedRevision) return false
    this.dirty = false
    return true
  }

  async loadBlob(blob: Blob | null, dirty = false): Promise<void> {
    const { width, height } = this.canvas
    this.ctx.clearRect(0, 0, width, height)
    if (blob) {
      const bitmap = await createImageBitmap(blob)
      try {
        this.ctx.drawImage(bitmap, 0, 0)
      } finally {
        bitmap.close()
      }
    }
    this.drawing = false
    this.dirty = dirty
    this.revision += 1
    this.undoStack = []
    this.locked = false
    this.emitHistory()
  }

  beginStroke(x: number, y: number, tool: StrokeTool, color: string, diameter: number): void {
    if (this.locked || this.drawing || !Number.isFinite(diameter) || diameter <= 0) return
    this.pushUndo()
    this.drawing = true
    this.strokeMode = tool
    this.strokeColor = color
    this.strokeRadius = diameter / 2
    this.lastX = x
    this.lastY = y
    this.paintDot(x, y)
    this.dirty = true
    this.revision += 1
  }

  extendStroke(x: number, y: number): void {
    if (this.locked || !this.drawing) return
    this.paintSegment(this.lastX, this.lastY, x, y)
    this.lastX = x
    this.lastY = y
    this.revision += 1
  }

  endStroke(): void {
    this.drawing = false
  }

  fillAt(x: number, y: number, color: string, labels: RegionLabels | null): boolean {
    if (this.locked || !labels) return false
    const width = this.canvas.width
    const height = this.canvas.height
    const px = Math.floor(x)
    const py = Math.floor(y)
    if (px < 0 || py < 0 || px >= width || py >= height) return false
    if (labels.length !== width * height) return false
    const region = labels[py * width + px]
    if (region === undefined || region === 0) return false
    const rgb = hexToRgb(color)
    if (!rgb) return false

    this.pushUndo()
    const image = this.ctx.getImageData(0, 0, width, height)
    const data = image.data
    for (let index = 0; index < labels.length; index += 1) {
      if (labels[index] !== region) continue
      const offset = index * 4
      data[offset] = rgb.r
      data[offset + 1] = rgb.g
      data[offset + 2] = rgb.b
      data[offset + 3] = 255
    }
    this.ctx.putImageData(image, 0, 0)
    this.dirty = true
    this.revision += 1
    return true
  }

  undo(): boolean {
    if (this.locked) return false
    this.drawing = false
    const frame = this.undoStack.pop()
    this.emitHistory()
    if (!frame) return false
    this.ctx.putImageData(frame, 0, 0)
    this.dirty = true
    this.revision += 1
    return true
  }

  toColorBlob(): Promise<Blob> {
    return canvasToPngBlob(this.canvas)
  }

  async toFinishedBlob(lineArt: CanvasImageSource): Promise<Blob> {
    const width = this.canvas.width
    const height = this.canvas.height
    const out = document.createElement('canvas')
    out.width = width
    out.height = height
    const ctx = out.getContext('2d')
    if (!ctx) throw new Error('成品没有保存成功')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(this.canvas, 0, 0)
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(lineArt, 0, 0, width, height)
    return canvasToPngBlob(out)
  }

  private pushUndo(): void {
    const frame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    this.undoStack.push(frame)
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
    this.emitHistory()
  }

  private emitHistory(): void {
    this.historyListener?.(this.undoStack.length > 0)
  }

  private paintDot(x: number, y: number): void {
    this.withStrokeStyle(() => {
      this.ctx.beginPath()
      this.ctx.arc(x, y, this.strokeRadius, 0, Math.PI * 2)
      this.ctx.fill()
    })
  }

  private paintSegment(x0: number, y0: number, x1: number, y1: number): void {
    const dx = x1 - x0
    const dy = y1 - y0
    const distance = Math.hypot(dx, dy)
    const step = Math.max(1, this.strokeRadius / 3)
    const steps = Math.max(1, Math.ceil(distance / step))
    this.withStrokeStyle(() => {
      for (let index = 0; index <= steps; index += 1) {
        const t = index / steps
        this.ctx.beginPath()
        this.ctx.arc(x0 + dx * t, y0 + dy * t, this.strokeRadius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    })
  }

  private withStrokeStyle(draw: () => void): void {
    this.ctx.save()
    if (this.strokeMode === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out'
      this.ctx.fillStyle = 'rgba(0,0,0,1)'
    } else {
      this.ctx.globalCompositeOperation = 'source-over'
      this.ctx.fillStyle = this.strokeColor
    }
    draw()
    this.ctx.restore()
  }
}
