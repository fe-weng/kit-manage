import { create } from 'zustand'
import { taskService } from '@/shared/container'
import { getDayRange } from '@/domain/rules/DateUtils'
import type { DailyTaskSnapshot } from '@/domain/models/DailyTaskSnapshot'
import type { TaskLog } from '@/domain/models/TaskLog'
import type { Task } from '@/domain/models/Task'

interface DateStatus {
  date: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  level: 'full' | 'high' | 'low' | 'none' | 'empty'
}

interface TaskHistoryStore {
  snapshots: DailyTaskSnapshot[]
  logs: TaskLog[]
  allTasks: Task[]
  loading: boolean
  dateStatusMap: Record<string, DateStatus>
  lastYear: number | null
  lastMonth: number | null

  fetchMonth: (year: number, month: number) => Promise<void>
  refreshIfLoaded: () => Promise<void>
}

function computeDateStatusMap(
  snapshots: DailyTaskSnapshot[],
  logs: TaskLog[],
): Record<string, DateStatus> {
  const map: Record<string, DateStatus> = {}

  for (const snap of snapshots) {
    const totalTasks = snap.taskIds.length
    if (totalTasks === 0) {
      map[snap.date] = {
        date: snap.date,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        level: 'empty',
      }
      continue
    }

    const { start: dayStart, end: dayEnd } = getDayRange(snap.date)

    const dayLogs = logs.filter(
      (l) => l.completedAt >= dayStart && l.completedAt < dayEnd,
    )

    const completedTaskIds = new Set(dayLogs.map((l) => l.taskId))
    const completedTasks = snap.taskIds.filter((id) => completedTaskIds.has(id)).length
    const rate = completedTasks / totalTasks

    let level: DateStatus['level']
    if (rate >= 1) level = 'full'
    else if (rate >= 0.5) level = 'high'
    else if (rate > 0) level = 'low'
    else level = 'none'

    map[snap.date] = {
      date: snap.date,
      totalTasks,
      completedTasks,
      completionRate: rate,
      level,
    }
  }

  return map
}

export const useTaskHistoryStore = create<TaskHistoryStore>((set, get) => ({
  snapshots: [],
  logs: [],
  allTasks: [],
  loading: false,
  dateStatusMap: {},
  lastYear: null,
  lastMonth: null,

  fetchMonth: async (year: number, month: number) => {
    set({ loading: true })
    try {
      await taskService.ensureSnapshotsUpToToday()
      const [snapshots, logs, allTasks] = await Promise.all([
        taskService.getMonthSnapshots(year, month),
        taskService.getMonthLogs(year, month),
        taskService.getAllTasks(),
      ])
      const dateStatusMap = computeDateStatusMap(snapshots, logs)
      set({ snapshots, logs, allTasks, dateStatusMap, lastYear: year, lastMonth: month })
    } finally {
      set({ loading: false })
    }
  },

  refreshIfLoaded: async () => {
    const { lastYear, lastMonth } = get()
    if (lastYear === null || lastMonth === null) return
    await get().fetchMonth(lastYear, lastMonth)
  },
}))
