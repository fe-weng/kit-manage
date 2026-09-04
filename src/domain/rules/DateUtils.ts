/** 获取今天 00:00:00 的时间戳 */
export function getTodayStart(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.getTime()
}

/** 获取本周一 00:00:00 的时间戳 */
export function getWeekStart(): number {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}
