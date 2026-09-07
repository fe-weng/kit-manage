interface RewardProps {
  id: string
  title: string
  description?: string
  points: number
  icon?: string
  categoryId: string
  isPreset: boolean
  isActive: boolean
  createdAt: number
}

export class Reward {
  readonly id: string
  title: string
  description?: string
  points: number
  icon?: string
  categoryId: string
  readonly isPreset: boolean
  isActive: boolean
  readonly createdAt: number

  constructor(props: RewardProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.points = props.points
    this.icon = props.icon
    this.categoryId = props.categoryId
    this.isPreset = props.isPreset
    this.isActive = props.isActive
    this.createdAt = props.createdAt
  }

  static create(params: {
    id: string
    title: string
    points: number
    categoryId: string
    icon?: string
    description?: string
    isPreset?: boolean
  }): Reward {
    if (params.points <= 0) throw new Error('奖励积分必须为正数')
    return new Reward({
      ...params,
      isPreset: params.isPreset ?? false,
      isActive: true,
      createdAt: Date.now(),
    })
  }

  update(params: {
    title?: string
    points?: number
    categoryId?: string
    icon?: string
    description?: string
  }): void {
    if (params.points !== undefined && params.points <= 0) throw new Error('奖励积分必须为正数')
    if (params.title !== undefined) this.title = params.title
    if (params.points !== undefined) this.points = params.points
    if (params.categoryId !== undefined) this.categoryId = params.categoryId
    if (params.icon !== undefined) this.icon = params.icon
    if (params.description !== undefined) this.description = params.description
  }

  deactivate(): void {
    this.isActive = false
  }

  toJSON(): RewardProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      points: this.points,
      icon: this.icon,
      categoryId: this.categoryId,
      isPreset: this.isPreset,
      isActive: this.isActive,
      createdAt: this.createdAt,
    }
  }
}
