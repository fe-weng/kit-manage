/** 自由调色最近一次的颜色。不写入备份，也不插入固定色板。 */
export const CUSTOM_COLOR_STORAGE_KEY = 'coloring.customColor'

/**
 * 10 组、每组 4 个，由浅到深。
 * 顺序与涂色规格的色系表一致，自由调色不会改这个数组。
 */
export const FIXED_COLORS = [
  '#ffd0d0', '#ff8a8a', '#e23b3b', '#8f1d1d',
  '#ffe0c2', '#ffb15a', '#f07a1a', '#a84b00',
  '#fff3b0', '#ffe14a', '#f5c400', '#b8860b',
  '#c8f5c4', '#5dce6a', '#1f9d4a', '#0d5c2e',
  '#c9f6f6', '#45d6d6', '#129eae', '#0b5f73',
  '#d4e4ff', '#6aa6ff', '#2f6fed', '#1a3f99',
  '#ead7ff', '#b07cff', '#7a3ff0', '#4a1d96',
  '#ffd6ea', '#ff8ec4', '#e84393', '#a61e5d',
  '#f0d2b4', '#c48a5a', '#8d5524', '#4e2a12',
  '#ffffff', '#d9d9d9', '#8a8a8a', '#1d1d1f',
] as const
