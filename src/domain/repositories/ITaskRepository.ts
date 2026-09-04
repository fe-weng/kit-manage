import type { Task } from '../models/Task'
import type { TaskLog } from '../models/TaskLog'
import type { TaskType } from '../valueObjects/TaskType'

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>
  findByChildId(childId: string): Promise<Task[]>
  findByType(childId: string, type: TaskType): Promise<Task[]>
  findActive(childId: string): Promise<Task[]>
  save(task: Task): Promise<void>
  delete(id: string): Promise<void>

  findLogsByTaskId(taskId: string): Promise<TaskLog[]>
  findLogsByChildId(childId: string): Promise<TaskLog[]>
  findLogsByDateRange(childId: string, start: number, end: number): Promise<TaskLog[]>
  saveLog(log: TaskLog): Promise<void>
  deleteLog(logId: string): Promise<void>
}
