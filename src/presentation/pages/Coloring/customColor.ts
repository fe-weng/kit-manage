import { CUSTOM_COLOR_STORAGE_KEY } from '@/domain/coloring/palette'

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/

export function hslToHex(hue: number, lightnessPercent: number): string {
  const h = ((hue % 360) + 360) % 360
  const l = Math.min(1, Math.max(0, lightnessPercent / 100))
  const c = 1 - Math.abs(2 * l - 1)
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) {
    r = c
    g = x
  } else if (hp < 2) {
    r = x
    g = c
  } else if (hp < 3) {
    g = c
    b = x
  } else if (hp < 4) {
    g = x
    b = c
  } else if (hp < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const m = l - c / 2
  const toByte = (channel: number) => Math.round((channel + m) * 255)
  return `#${[toByte(r), toByte(g), toByte(b)].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

export function hexToHueLightness(hex: string): { hue: number; lightness: number } | null {
  const match = HEX_COLOR.exec(hex)
  const raw = match?.[1]
  if (raw === undefined) return null
  const r = parseInt(raw.slice(0, 2), 16) / 255
  const g = parseInt(raw.slice(2, 4), 16) / 255
  const b = parseInt(raw.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  let hue = 0
  if (max !== min) {
    const delta = max - min
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }
  return { hue: Math.round(hue), lightness: Math.round(lightness * 100) }
}

export function readStoredCustomColor(): string | null {
  try {
    const value = localStorage.getItem(CUSTOM_COLOR_STORAGE_KEY)
    if (value === null || hexToHueLightness(value) === null) return null
    return value.toLowerCase()
  } catch {
    return null
  }
}

export function writeStoredCustomColor(hex: string): void {
  if (hexToHueLightness(hex) === null) return
  try {
    localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, hex.toLowerCase())
  } catch {
    // 无痕模式或容量满时，当前颜色仍可在这次打开里使用。
  }
}
