import type { ITaskRepository } from '@/domain/repositories/ITaskRepository'
import { Task } from '@/domain/models/Task'
import { TaskLog } from '@/domain/models/TaskLog'
import type { TaskType } from '@/domain/valueObjects/TaskType'
import type { KidManageDB, TaskRecord, TaskLogRecord } from '../DexieDatabase'

export class DexieTaskRepository implements ITaskRepository {
  constructor(private db: KidManageDB) {}

  async findById(id: string): Promise<Task | null> {
    const record = await this.db.tasks.get(id)
    return record ? this.toDomain(record) : null
  }

  async findByChildId(childId: string): Promise<Task[]> {
    const records = await this.db.tasks.where('childId').equals(childId).toArray()
    return records.map((r) => this.toDomain(r))
  }

  async findByType(childId: string, type: TaskType): Promise<Task[]> {
    const records = await this.db.tasks
      .where({ childId, type })
      .toArray()
    return records.map((r) => this.toDomain(r))
  }

  async findActive(childId: string): Promise<Task[]> {
    const records = await this.db.tasks
      .where({ childId, isActive: 1 })
      .toArray()
    return records.map((r) => this.toDomain(r))
  }

  async save(task: Task): Promise<void> {
    await this.db.tasks.put(this.toPersistence(task))
  }

  async delete(id: string): Promise<void> {
    await this.db.tasks.delete(id)
  }

  async findLogsByTaskId(taskId: string): Promise<TaskLog[]> {
    const records = await this.db.taskLogs.where('taskId').equals(taskId).toArray()
    return records.map((r) => this.toLogDomain(r))
  }

  async findLogsByChildId(childId: string): Promise<TaskLog[]> {
    const records = await this.db.taskLogs.where('childId').equals(childId).toArray()
    return records.map((r) => this.toLogDomain(r))
  }

  async findLogsByDateRange(childId: string, start: number, end: number): Promise<TaskLog[]> {
    const records = await this.db.taskLogs
      .where('completedAt')
      .between(start, end)
      .and((r) => r.childId === childId)
      .toArray()
    return records.map((r) => this.toLogDomain(r))
  }

  async saveLog(log: TaskLog): Promise<void> {
    await this.db.taskLogs.put(this.toLogPersistence(log))
  }

  async deleteLog(logId: string): Promise<void> {
    await this.db.taskLogs.delete(logId)
  }

  private toDomain(record: TaskRecord): Task {
    return new Task({
      id: record.id,
      childId: record.childId,
      title: record.title,
      type: record.type as TaskType,
      points: record.points,
      icon: record.icon,
      createdAt: record.createdAt,
      isActive: record.isActive === 1,
    })
  }

  private toPersistence(task: Task): TaskRecord {
    return {
      id: task.id,
      childId: task.childId,
      title: task.title,
      type: task.type,
      points: task.points,
      icon: task.icon,
      createdAt: task.createdAt,
      isActive: task.isActive ? 1 : 0,
    }
  }

  private toLogDomain(record: TaskLogRecord): TaskLog {
    return new TaskLog({
      id: record.id,
      taskId: record.taskId,
      childId: record.childId,
      completedAt: record.completedAt,
      pointsEarned: record.pointsEarned,
      type: record.type as 'earn' | 'deduct',
    })
  }

  private toLogPersistence(log: TaskLog): TaskLogRecord {
    return {
      id: log.id,
      taskId: log.taskId,
      childId: log.childId,
      completedAt: log.completedAt,
      pointsEarned: log.pointsEarned,
      type: log.type,
    }
  }
}
