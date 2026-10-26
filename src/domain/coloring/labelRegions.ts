/** 改阈值或扩墙规则时加一，旧编号缓存即失效。 */
export const REGION_LABEL_VERSION = 1

/** 区域数达到这个值时不能放进 Uint16 缓存。 */
export const LABEL_CACHE_REGION_LIMIT = 65536

const WALL_LUMINANCE = 110

export interface LabelRegionsSuccess {
  ok: true
  labels: Uint32Array
  width: number
  height: number
  regionCount: number
}

export interface LabelRegionsFailure {
  ok: false
}

export type LabelRegionsResult = LabelRegionsSuccess | LabelRegionsFailure

type Channels = 1 | 3 | 4

function yieldNow(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

function detectChannels(length: number, count: number): Channels | null {
  if (length === count) return 1
  if (length === count * 3) return 3
  if (length === count * 4) return 4
  return null
}

function luminanceAt(pixels: ArrayLike<number>, index: number, channels: Channels): number {
  if (channels === 1) return pixels[index] ?? 0
  const offset = index * channels
  const r0 = pixels[offset] ?? 0
  const g0 = pixels[offset + 1] ?? 0
  const b0 = pixels[offset + 2] ?? 0
  if (channels === 3) {
    return 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0
  }
  const alpha = (pixels[offset + 3] ?? 255) / 255
  const r = r0 * alpha + 255 * (1 - alpha)
  const g = g0 * alpha + 255 * (1 - alpha)
  const b = b0 * alpha + 255 * (1 - alpha)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function buildWallMask(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
): Uint8Array | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return null
  }
  const count = width * height
  const channels = detectChannels(pixels.length, count)
  if (channels === null) return null

  const dark = new Uint8Array(count)
  for (let index = 0; index < count; index += 1) {
    if (luminanceAt(pixels, index, channels) < WALL_LUMINANCE) dark[index] = 1
  }

  const wall = new Uint8Array(count)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (dark[y * width + x] !== 1) continue
      const y0 = Math.max(0, y - 1)
      const y1 = Math.min(height - 1, y + 1)
      const x0 = Math.max(0, x - 1)
      const x1 = Math.min(width - 1, x + 1)
      for (let ny = y0; ny <= y1; ny += 1) {
        for (let nx = x0; nx <= x1; nx += 1) {
          wall[ny * width + nx] = 1
        }
      }
    }
  }
  return wall
}

async function buildWallMaskAsync(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  shouldCancel: () => boolean,
): Promise<Uint8Array | null> {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    return null
  }
  const count = width * height
  const channels = detectChannels(pixels.length, count)
  if (channels === null) return null

  const rowsPerChunk = 64
  const dark = new Uint8Array(count)
  for (let rowStart = 0; rowStart < height; rowStart += rowsPerChunk) {
    const rowEnd = Math.min(height, rowStart + rowsPerChunk)
    for (let y = rowStart; y < rowEnd; y += 1) {
      const offset = y * width
      for (let x = 0; x < width; x += 1) {
        const index = offset + x
        if (luminanceAt(pixels, index, channels) < WALL_LUMINANCE) dark[index] = 1
      }
    }
    await yieldNow()
    if (shouldCancel()) return null
  }

  const wall = new Uint8Array(count)
  for (let rowStart = 0; rowStart < height; rowStart += rowsPerChunk) {
    const rowEnd = Math.min(height, rowStart + rowsPerChunk)
    for (let y = rowStart; y < rowEnd; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (dark[y * width + x] !== 1) continue
        const y0 = Math.max(0, y - 1)
        const y1 = Math.min(height - 1, y + 1)
        const x0 = Math.max(0, x - 1)
        const x1 = Math.min(width - 1, x + 1)
        for (let ny = y0; ny <= y1; ny += 1) {
          for (let nx = x0; nx <= x1; nx += 1) {
            wall[ny * width + nx] = 1
          }
        }
      }
    }
    await yieldNow()
    if (shouldCancel()) return null
  }
  return wall
}

class RegionLabeler {
  private readonly wall: Uint8Array
  private readonly width: number
  private readonly height: number
  private readonly labels: Uint32Array
  private readonly parent: Uint32Array
  private nextLabel = 1
  private row = 0
  private index = 0
  private phase: 'pass1' | 'compact' | 'done' = 'pass1'
  private compactMap = new Uint32Array(0)
  private regionCount = 0

  constructor(wall: Uint8Array, width: number, height: number) {
    this.wall = wall
    this.width = width
    this.height = height
    const count = width * height
    this.labels = new Uint32Array(count)
    this.parent = new Uint32Array(count + 1)
  }

  /** 处理若干行。全部完成时返回 true。 */
  step(rows: number): boolean {
    if (this.phase === 'done') return true
    const budget = Math.max(1, rows)

    if (this.phase === 'pass1') {
      const end = Math.min(this.height, this.row + budget)
      for (; this.row < end; this.row += 1) this.scanRow(this.row)
      if (this.row >= this.height) {
        this.phase = 'compact'
        this.index = 0
        this.compactMap = new Uint32Array(this.nextLabel)
      }
      return false
    }

    const count = this.width * this.height
    const end = Math.min(count, this.index + budget * this.width)
    for (; this.index < end; this.index += 1) this.compactAt(this.index)
    if (this.index >= count) {
      this.phase = 'done'
      return true
    }
    return false
  }

  result(): LabelRegionsSuccess {
    return {
      ok: true,
      labels: this.labels,
      width: this.width,
      height: this.height,
      regionCount: this.regionCount,
    }
  }

  private scanRow(y: number): void {
    const { width, labels, wall } = this
    const rowStart = y * width
    for (let x = 0; x < width; x += 1) {
      const index = rowStart + x
      if (wall[index] === 1) continue
      const left = x > 0 ? (labels[index - 1] ?? 0) : 0
      const up = y > 0 ? (labels[index - width] ?? 0) : 0
      if (left !== 0 && up !== 0) {
        this.union(left, up)
        labels[index] = left
      } else if (left !== 0) {
        labels[index] = left
      } else if (up !== 0) {
        labels[index] = up
      } else {
        const id = this.nextLabel
        this.parent[id] = id
        this.nextLabel += 1
        labels[index] = id
      }
    }
  }

  private compactAt(index: number): void {
    const provisional = this.labels[index] ?? 0
    if (provisional === 0) return
    const root = this.find(provisional)
    let mapped = this.compactMap[root] ?? 0
    if (mapped === 0) {
      this.regionCount += 1
      mapped = this.regionCount
      this.compactMap[root] = mapped
    }
    this.labels[index] = mapped
  }

  private find(value: number): number {
    let root = value
    while ((this.parent[root] ?? root) !== root) {
      root = this.parent[root] ?? root
    }
    let current = value
    while (current !== root) {
      const next = this.parent[current] ?? root
      this.parent[current] = root
      current = next
    }
    return root
  }

  private union(a: number, b: number): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return
    if (ra < rb) this.parent[rb] = ra
    else this.parent[ra] = rb
  }
}

function runLabeler(wall: Uint8Array, width: number, height: number): LabelRegionsSuccess {
  const job = new RegionLabeler(wall, width, height)
  let guard = 0
  while (!job.step(height)) {
    guard += 1
    if (guard > 8) throw new Error('分区没有算完')
  }
  return job.result()
}

export function labelRegions(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
): LabelRegionsResult {
  try {
    const wall = buildWallMask(pixels, width, height)
    if (!wall) return { ok: false }
    return runLabeler(wall, width, height)
  } catch {
    return { ok: false }
  }
}

/** 分批计算，避免第一次打开大图时卡住涂色。取消时返回失败，调用方不要当成分区失败去提示。 */
export async function labelRegionsAsync(
  pixels: ArrayLike<number>,
  width: number,
  height: number,
  shouldCancel: () => boolean = () => false,
): Promise<LabelRegionsResult> {
  try {
    await yieldNow()
    if (shouldCancel()) return { ok: false }
    const wall = await buildWallMaskAsync(pixels, width, height, shouldCancel)
    if (!wall) return { ok: false }
    if (shouldCancel()) return { ok: false }
    const job = new RegionLabeler(wall, width, height)
    while (!job.step(32)) {
      await yieldNow()
      if (shouldCancel()) return { ok: false }
    }
    if (shouldCancel()) return { ok: false }
    return job.result()
  } catch {
    return { ok: false }
  }
}
