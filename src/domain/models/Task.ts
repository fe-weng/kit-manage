import { TaskType } from '../valueObjects/TaskType'

interface TaskProps {
  id: string
  childId: string
  title: string
  type: TaskType
  points: number
  icon?: string
  createdAt: number
  isActive: boolean
}

export class Task {
  readonly id: string
  readonly childId: string
  title: string
  type: TaskType
  points: number
  icon?: string
  readonly createdAt: number
  isActive: boolean

  constructor(props: TaskProps) {
    this.id = props.id
    this.childId = props.childId
    this.title = props.title
    this.type = props.type
    this.points = props.points
    this.icon = props.icon
    this.createdAt = props.createdAt
    this.isActive = props.isActive
  }

  static create(params: {
    id: string
    childId: string
    title: string
    type: TaskType
    points: number
    icon?: string
  }): Task {
    if (params.type === TaskType.NEGATIVE && params.points > 0) {
      params.points = -params.points
    }
    return new Task({
      ...params,
      createdAt: Date.now(),
      isActive: true,
    })
  }

  update(params: { title?: string; points?: number; type?: TaskType; icon?: string }): void {
    if (params.title !== undefined) this.title = params.title
    if (params.points !== undefined) this.points = params.points
    if (params.type !== undefined) this.type = params.type
    if (params.icon !== undefined) this.icon = params.icon
  }

  deactivate(): void {
    this.isActive = false
  }

  activate(): void {
    this.isActive = true
  }

  isNegative(): boolean {
    return this.type === TaskType.NEGATIVE
  }

  toJSON(): TaskProps {
    return {
      id: this.id,
      childId: this.childId,
      title: this.title,
      type: this.type,
      points: this.points,
      icon: this.icon,
      createdAt: this.createdAt,
      isActive: this.isActive,
    }
  }
}
