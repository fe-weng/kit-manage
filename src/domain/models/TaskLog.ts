interface TaskLogProps {
  id: string
  taskId: string
  childId: string
  completedAt: number
  pointsEarned: number
  type: 'earn' | 'deduct'
}

export class TaskLog {
  readonly id: string
  readonly taskId: string
  readonly childId: string
  readonly completedAt: number
  readonly pointsEarned: number
  readonly type: 'earn' | 'deduct'

  constructor(props: TaskLogProps) {
    this.id = props.id
    this.taskId = props.taskId
    this.childId = props.childId
    this.completedAt = props.completedAt
    this.pointsEarned = props.pointsEarned
    this.type = props.type
  }

  static create(params: {
    id: string
    taskId: string
    childId: string
    pointsEarned: number
  }): TaskLog {
    return new TaskLog({
      ...params,
      completedAt: Date.now(),
      type: params.pointsEarned >= 0 ? 'earn' : 'deduct',
    })
  }

  toJSON(): TaskLogProps {
    return {
      id: this.id,
      taskId: this.taskId,
      childId: this.childId,
      completedAt: this.completedAt,
      pointsEarned: this.pointsEarned,
      type: this.type,
    }
  }
}
