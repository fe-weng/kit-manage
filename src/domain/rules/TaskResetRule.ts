import { TaskType } from '../valueObjects/TaskType'
import type { TaskLog } from '../models/TaskLog'
import { getTodayStart, getWeekStart, getTodayDateStr, getDayRange } from './DateUtils'

function isTaskCompletedToday(taskId: string, logs: TaskLog[]): boolean {
  const todayStart = getTodayStart()
  return logs.some(
    (log) => log.taskId === taskId && log.completedAt >= todayStart
  )
}

function isTaskCompletedThisWeek(taskId: string, logs: TaskLog[]): boolean {
  const weekStart = getWeekStart()
  return logs.some(
    (log) => log.taskId === taskId && log.completedAt >= weekStart
  )
}

export function isTaskCompleted(
  taskId: string,
  taskType: TaskType,
  logs: TaskLog[]
): boolean {
  switch (taskType) {
    case TaskType.DAILY:
      return isTaskCompletedToday(taskId, logs)
    case TaskType.WEEKLY:
      return isTaskCompletedThisWeek(taskId, logs)
    case TaskType.ONE_TIME:
      return logs.some((log) => log.taskId === taskId)
    case TaskType.NEGATIVE:
      return isTaskCompletedToday(taskId, logs)
  }
}

/** 一次性任务在指定日期是否应显示：该日开始前已完成 → 隐藏；未完成或当天完成 → 显示 */
export function isOneTimeTaskVisibleOnDate(
  taskId: string,
  logs: TaskLog[],
  dateStr: string,
): boolean {
  const taskLogs = logs.filter((log) => log.taskId === taskId)
  if (taskLogs.length === 0) return true

  const lastLog = taskLogs.reduce((latest, log) =>
    log.completedAt > latest.completedAt ? log : latest
  )
  const { start } = getDayRange(dateStr)
  return lastLog.completedAt >= start
}

/** 一次性任务是否应在今日列表中显示：未完成 → 显示；完成当天 → 显示（带✅）；次日起 → 隐藏 */
export function isOneTimeTaskVisible(taskId: string, logs: TaskLog[]): boolean {
  return isOneTimeTaskVisibleOnDate(taskId, logs, getTodayDateStr())
}

export function getTodayCompletedCount(logs: TaskLog[]): number {
  const todayStart = getTodayStart()
  return logs.filter(
    (log) => log.completedAt >= todayStart && log.type === 'earn'
  ).length
}

export function getTodayEarnedPoints(logs: TaskLog[]): number {
  const todayStart = getTodayStart()
  return logs
    .filter((log) => log.completedAt >= todayStart)
    .reduce((sum, log) => sum + log.pointsEarned, 0)
}
