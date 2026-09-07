/** 获取今天 00:00:00 的时间戳 */
export function getTodayStart(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.getTime()
}

/** 获取今天的日期字符串 YYYY-MM-DD */
export function getTodayDateStr(): string {
  return formatDateStr(new Date())
}

/** 将 Date 格式化为 YYYY-MM-DD */
export function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 获取某月的起止日期（YYYY-MM-DD） */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

/** 将 YYYY-MM-DD 解析为本地午夜时间戳（避免 UTC 时区问题） */
export function parseDateStrToLocal(dateStr: string): number {
  const parts = dateStr.split('-').map(Number)
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!).getTime()
}

/** 获取 YYYY-MM-DD 的本地日始和日末时间戳 */
export function getDayRange(dateStr: string): { start: number; end: number } {
  const start = parseDateStrToLocal(dateStr)
  return { start, end: start + 86400000 }
}

/** 获取本周一 00:00:00 的时间戳 */
export function getWeekStart(): number {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}
