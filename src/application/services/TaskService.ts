import type { ITaskRepository } from '@/domain/repositories/ITaskRepository'
import { Task } from '@/domain/models/Task'
import { TaskLog } from '@/domain/models/TaskLog'
import { TaskType } from '@/domain/valueObjects/TaskType'
import { DailyTaskSnapshot } from '@/domain/models/DailyTaskSnapshot'
import { isTaskCompleted, isOneTimeTaskVisible, isOneTimeTaskVisibleOnDate, getTodayCompletedCount, getTodayEarnedPoints } from '@/domain/rules/TaskResetRule'
import { getTodayStart, getWeekStart, getTodayDateStr, getMonthRange, parseDateStrToLocal, getDayRange, eachDateInclusive, formatDateStr } from '@/domain/rules/DateUtils'
import type { ISnapshotRepository } from '@/domain/repositories/ISnapshotRepository'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

export class TaskService {
  private ensureInFlight: Promise<void> | null = null

  constructor(
    private taskRepo: ITaskRepository,
    private pointService: PointService,
    private snapshotRepo?: ISnapshotRepository
  ) {}

  /** 打开 App / 从后台回到前台时调用：补齐上线日至今天的缺失快照，并同步今日快照 */
  async ensureSnapshotsUpToToday(): Promise<void> {
    if (!this.snapshotRepo) return
    if (this.ensureInFlight) return this.ensureInFlight
    this.ensureInFlight = this.runEnsureSnapshotsUpToToday().finally(() => {
      this.ensureInFlight = null
    })
    return this.ensureInFlight
  }

  async ensureTodaySnapshot(): Promise<DailyTaskSnapshot | null> {
    await this.ensureSnapshotsUpToToday()
    if (!this.snapshotRepo) return null
    return this.snapshotRepo.findByDate(DEFAULT_CHILD_ID, getTodayDateStr())
  }

  private async runEnsureSnapshotsUpToToday(): Promise<void> {
    if (!this.snapshotRepo) return

    const allTasks = await this.taskRepo.findByChildId(DEFAULT_CHILD_ID)
    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)
    const today = getTodayDateStr()

    await this.syncTodaySnapshot(
      allTasks.filter((t) => t.isActive),
      logs,
    )

    if (allTasks.length === 0) return

    const goLive = formatDateStr(
      new Date(Math.min(...allTasks.map((t) => t.createdAt))),
    )
    if (goLive > today) return

    const existing = await this.snapshotRepo.findByDateRange(DEFAULT_CHILD_ID, goLive, today)
    const existingDates = new Set(existing.map((s) => s.date))

    for (const dateStr of eachDateInclusive(goLive, today)) {
      if (dateStr === today || existingDates.has(dateStr)) continue
      const { taskIds, negativeTaskIds } = this.collectSnapshotTaskIds(
        dateStr,
        allTasks,
        logs,
        false,
      )
      const snapshot = DailyTaskSnapshot.create({
        childId: DEFAULT_CHILD_ID,
        date: dateStr,
        taskIds,
        negativeTaskIds,
      })
      await this.snapshotRepo.save(snapshot)
    }
  }

  /** 任务增删改后重建今日快照（历史快照冻结，不改） */
  private async syncTodaySnapshotFromDb(): Promise<void> {
    if (!this.snapshotRepo) return
    const tasks = await this.taskRepo.findActive(DEFAULT_CHILD_ID)
    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)
    await this.syncTodaySnapshot(tasks, logs)
  }

  private async syncTodaySnapshot(activeTasks: Task[], logs: TaskLog[]): Promise<void> {
    if (!this.snapshotRepo) return
    const today = getTodayDateStr()
    const { taskIds, negativeTaskIds } = this.collectSnapshotTaskIds(
      today,
      activeTasks,
      logs,
      true,
    )
    const existing = await this.snapshotRepo.findByDate(DEFAULT_CHILD_ID, today)
    if (existing) {
      existing.taskIds = taskIds
      existing.negativeTaskIds = negativeTaskIds
      existing.updatedAt = Date.now()
      await this.snapshotRepo.save(existing)
      return
    }
    const snapshot = DailyTaskSnapshot.create({
      childId: DEFAULT_CHILD_ID,
      date: today,
      taskIds,
      negativeTaskIds,
    })
    await this.snapshotRepo.save(snapshot)
  }

  private collectSnapshotTaskIds(
    dateStr: string,
    tasks: Task[],
    logs: TaskLog[],
    isToday: boolean,
  ): { taskIds: string[]; negativeTaskIds: string[] } {
    const { start: dayStart, end: dayEnd } = getDayRange(dateStr)
    const taskIds: string[] = []
    const negativeTaskIds: string[] = []

    for (const task of tasks) {
      if (task.createdAt >= dayEnd) continue
      if (!isToday && !task.isActive) {
        const hasLog = logs.some(
          (l) => l.taskId === task.id && l.completedAt >= dayStart && l.completedAt < dayEnd,
        )
        if (!hasLog) continue
      }
      if (isToday && !task.isActive) continue

      if (task.type === TaskType.NEGATIVE) {
        negativeTaskIds.push(task.id)
      } else if (task.type === TaskType.ONE_TIME) {
        if (isOneTimeTaskVisibleOnDate(task.id, logs, dateStr)) taskIds.push(task.id)
      } else {
        taskIds.push(task.id)
      }
    }

    return { taskIds, negativeTaskIds }
  }

  async getMonthSnapshots(year: number, month: number): Promise<DailyTaskSnapshot[]> {
    if (!this.snapshotRepo) return []
    const { start, end } = getMonthRange(year, month)
    return this.snapshotRepo.findByDateRange(DEFAULT_CHILD_ID, start, end)
  }

  async getMonthLogs(year: number, month: number): Promise<TaskLog[]> {
    const { start, end } = getMonthRange(year, month)
    const startTs = parseDateStrToLocal(start)
    const endTs = parseDateStrToLocal(end) + 86400000 - 1
    return this.taskRepo.findLogsByDateRange(DEFAULT_CHILD_ID, startTs, endTs)
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepo.findActive(DEFAULT_CHILD_ID)
  }

  async createTask(params: {
    title: string
    type: TaskType
    points: number
    icon?: string
  }): Promise<Task> {
    const task = Task.create({
      id: crypto.randomUUID(),
      childId: DEFAULT_CHILD_ID,
      ...params,
    })
    await this.taskRepo.save(task)
    await this.syncTodaySnapshotFromDb()
    return task
  }

  async updateTask(
    taskId: string,
    params: { title?: string; points?: number; type?: TaskType; icon?: string }
  ): Promise<Task | null> {
    const task = await this.taskRepo.findById(taskId)
    if (!task) return null
    task.update(params)
    await this.taskRepo.save(task)
    await this.syncTodaySnapshotFromDb()
    return task
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId)
    if (!task) return
    task.deactivate()
    await this.taskRepo.save(task)
    await this.syncTodaySnapshotFromDb()
  }

  async completeTask(taskId: string): Promise<TaskLog | null> {
    const task = await this.taskRepo.findById(taskId)
    if (!task) return null

    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)
    if (isTaskCompleted(task.id, task.type, logs)) return null

    const log = TaskLog.create({
      id: crypto.randomUUID(),
      taskId: task.id,
      childId: DEFAULT_CHILD_ID,
      pointsEarned: task.points,
    })

    await this.taskRepo.saveLog(log)

    if (task.points > 0) {
      await this.pointService.earn(task.points)
    } else if (task.points < 0) {
      await this.pointService.deduct(Math.abs(task.points))
    }

    return log
  }

  async uncompleteTask(taskId: string): Promise<boolean> {
    const task = await this.taskRepo.findById(taskId)
    if (!task) return false

    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)
    const relevantLogs = this.findAllRelevantLogs(taskId, task.type, logs)
    if (relevantLogs.length === 0) return false

    for (const log of relevantLogs) {
      await this.taskRepo.deleteLog(log.id)
      if (log.pointsEarned > 0) {
        await this.pointService.deduct(log.pointsEarned)
      } else if (log.pointsEarned < 0) {
        await this.pointService.earn(Math.abs(log.pointsEarned))
      }
    }

    return true
  }

  private findAllRelevantLogs(
    taskId: string,
    taskType: TaskType,
    logs: TaskLog[]
  ): TaskLog[] {
    const taskLogs = logs.filter((l) => l.taskId === taskId)
    if (taskLogs.length === 0) return []

    switch (taskType) {
      case TaskType.DAILY: {
        const found = taskLogs.find((l) => l.completedAt >= getTodayStart())
        return found ? [found] : []
      }
      case TaskType.WEEKLY: {
        const found = taskLogs.find((l) => l.completedAt >= getWeekStart())
        return found ? [found] : []
      }
      case TaskType.ONE_TIME: {
        const last = taskLogs[taskLogs.length - 1]
        return last ? [last] : []
      }
      case TaskType.NEGATIVE: {
        return taskLogs.filter((l) => l.completedAt >= getTodayStart())
      }
    }
  }

  async getTasksWithStatus(): Promise<
    Array<{ task: Task; completed: boolean }>
  > {
    const tasks = await this.getAllTasks()
    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)

    return tasks
      .filter((task) =>
        task.type !== TaskType.ONE_TIME || isOneTimeTaskVisible(task.id, logs)
      )
      .map((task) => ({
        task,
        completed: isTaskCompleted(task.id, task.type, logs),
      }))
  }

  async getTodayStats(): Promise<{
    completedCount: number
    earnedPoints: number
    totalTasks: number
  }> {
    const logs = await this.taskRepo.findLogsByChildId(DEFAULT_CHILD_ID)
    const tasks = await this.getAllTasks()
    const visibleEarnableTasks = tasks.filter((t) =>
      !t.isNegative() &&
      (t.type !== TaskType.ONE_TIME || isOneTimeTaskVisible(t.id, logs))
    )

    return {
      completedCount: getTodayCompletedCount(logs),
      earnedPoints: getTodayEarnedPoints(logs),
      totalTasks: visibleEarnableTasks.length,
    }
  }
}
