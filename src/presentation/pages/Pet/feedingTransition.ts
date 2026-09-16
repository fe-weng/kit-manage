export interface FeedPoint {
  x: number
  y: number
}

/** 喂食吃播时间轴（毫秒），总时长 1.8s。动作交叉重叠，中间不回正、不静停。 */
export const FEEDING_TIMELINE_MS = {
  cookieGone: 820,
  particleStart: 1150,
  duration: 1800,
} as const

export const FEEDING_DURATION_MS = FEEDING_TIMELINE_MS.duration

/** 嘴部锚点，相对宠物点击区域 */
export const FEEDING_MOUTH_ANCHOR = {
  xRatio: 0.5,
  yRatio: 0.42,
} as const

/**
 * 整段 1.8s 的点头曲线：先迎向食物，再连续三点，谷底之间只抬到约 -6°，最后才回正。
 * 不要在中间回到 0，否则会像卡帧。
 */
export const FEEDING_NOD_ROTATE_X = [0, -8, -22, -7, -20, -6, -15, -3, 0] as const
export const FEEDING_NOD_TIMES = [0, 0.3, 0.4, 0.52, 0.62, 0.74, 0.84, 0.93, 1] as const
export const FEEDING_NOD_ORIGIN = '50% 88%'
export const FEEDING_NOD_PERSPECTIVE = 520
export const FEEDING_NOD_DURATION_S = FEEDING_DURATION_MS / 1000

export function getRelativeCenter(target: DOMRect, origin: DOMRect): FeedPoint {
  return {
    x: target.left + target.width / 2 - origin.left,
    y: target.top + target.height / 2 - origin.top,
  }
}

export function getMouthPoint(petRect: DOMRect, origin: DOMRect): FeedPoint {
  return {
    x: petRect.left + petRect.width * FEEDING_MOUTH_ANCHOR.xRatio - origin.left,
    y: petRect.top + petRect.height * FEEDING_MOUTH_ANCHOR.yRatio - origin.top,
  }
}

export function captureFeedFlight(
  stage: HTMLElement | null,
  feedButton: HTMLElement | null,
  petHit: HTMLElement | null,
): { start: FeedPoint; mouth: FeedPoint } | null {
  if (!stage || !feedButton || !petHit) return null
  const origin = stage.getBoundingClientRect()
  return {
    start: getRelativeCenter(feedButton.getBoundingClientRect(), origin),
    mouth: getMouthPoint(petHit.getBoundingClientRect(), origin),
  }
}

/** 抛向嘴边的三次贝塞尔控制点：先侧向扬起，再落入嘴边。 */
export function getCookieTossControls(start: FeedPoint, mouth: FeedPoint): { c1: FeedPoint; c2: FeedPoint } {
  const travelY = Math.max(Math.abs(start.y - mouth.y), 120)
  const bulge = Math.min(Math.max(travelY * 0.36, 100), 156)
  const peak = Math.min(Math.max(travelY * 0.24, 64), 120)
  const side = start.x - mouth.x > 20 ? -1 : 1
  return {
    c1: {
      x: start.x + side * bulge * 0.7,
      y: start.y - travelY * 0.22,
    },
    c2: {
      x: mouth.x + side * bulge,
      y: mouth.y - peak,
    },
  }
}

/** 三次贝塞尔采样，让饼干走出可见抛物线，而不是近似直线。 */
export function sampleCubicArc(
  start: FeedPoint,
  c1: FeedPoint,
  c2: FeedPoint,
  end: FeedPoint,
  steps = 16,
): FeedPoint[] {
  const points: FeedPoint[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    const u2 = u * u
    const t2 = t * t
    points.push({
      x: u2 * u * start.x + 3 * u2 * t * c1.x + 3 * u * t2 * c2.x + t2 * t * end.x,
      y: u2 * u * start.y + 3 * u2 * t * c1.y + 3 * u * t2 * c2.y + t2 * t * end.y,
    })
  }
  return points
}
