export const TaskType = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ONE_TIME: 'oneTime',
  NEGATIVE: 'negative',
} as const

export type TaskType = (typeof TaskType)[keyof typeof TaskType]

export function getTaskTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    [TaskType.DAILY]: '每日任务',
    [TaskType.WEEKLY]: '每周任务',
    [TaskType.ONE_TIME]: '一次性任务',
    [TaskType.NEGATIVE]: '扣分行为',
  }
  return labels[type]
}
