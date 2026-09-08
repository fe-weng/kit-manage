interface DailyTaskSnapshotProps {
  id: string
  childId: string
  date: string
  taskIds: string[]
  negativeTaskIds: string[]
  createdAt: number
  updatedAt: number
}

export class DailyTaskSnapshot {
  readonly id: string
  readonly childId: string
  readonly date: string
  taskIds: string[]
  negativeTaskIds: string[]
  readonly createdAt: number
  updatedAt: number

  constructor(props: DailyTaskSnapshotProps) {
    this.id = props.id
    this.childId = props.childId
    this.date = props.date
    this.taskIds = [...props.taskIds]
    this.negativeTaskIds = [...props.negativeTaskIds]
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    childId: string
    date: string
    taskIds: string[]
    negativeTaskIds: string[]
  }): DailyTaskSnapshot {
    const now = Date.now()
    return new DailyTaskSnapshot({
      id: `${params.childId}_${params.date}`,
      childId: params.childId,
      date: params.date,
      taskIds: params.taskIds,
      negativeTaskIds: params.negativeTaskIds,
      createdAt: now,
      updatedAt: now,
    })
  }

  addTask(taskId: string): void {
    if (!this.taskIds.includes(taskId)) {
      this.taskIds.push(taskId)
      this.updatedAt = Date.now()
    }
  }

  removeTask(taskId: string): void {
    const idx = this.taskIds.indexOf(taskId)
    if (idx !== -1) {
      this.taskIds.splice(idx, 1)
      this.updatedAt = Date.now()
    }
  }

  addNegativeTask(taskId: string): void {
    if (!this.negativeTaskIds.includes(taskId)) {
      this.negativeTaskIds.push(taskId)
      this.updatedAt = Date.now()
    }
  }

  removeNegativeTask(taskId: string): void {
    const idx = this.negativeTaskIds.indexOf(taskId)
    if (idx !== -1) {
      this.negativeTaskIds.splice(idx, 1)
      this.updatedAt = Date.now()
    }
  }

  get totalTaskCount(): number {
    return this.taskIds.length
  }

  toJSON(): DailyTaskSnapshotProps {
    return {
      id: this.id,
      childId: this.childId,
      date: this.date,
      taskIds: [...this.taskIds],
      negativeTaskIds: [...this.negativeTaskIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
