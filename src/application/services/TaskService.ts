import type { ITaskRepository } from '@/domain/repositories/ITaskRepository'
import { Task } from '@/domain/models/Task'
import { TaskLog } from '@/domain/models/TaskLog'
import { TaskType } from '@/domain/valueObjects/TaskType'
import { isTaskCompleted, isOneTimeTaskVisible, getTodayCompletedCount, getTodayEarnedPoints } from '@/domain/rules/TaskResetRule'
import { getTodayStart, getWeekStart } from '@/domain/rules/DateUtils'
import type { PointService } from './PointService'
import { DEFAULT_CHILD_ID } from '@/shared/constants'

export class TaskService {
  constructor(
    private taskRepo: ITaskRepository,
    private pointService: PointService
  ) {}

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
    return task
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskRepo.findById(taskId)
    if (!task) return
    task.deactivate()
    await this.taskRepo.save(task)
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
