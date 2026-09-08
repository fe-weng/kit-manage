interface CategoryProps {
  id: string
  name: string
  isPreset: boolean
  createdAt: number
}

export class Category {
  readonly id: string
  readonly name: string
  readonly isPreset: boolean
  readonly createdAt: number

  constructor(props: CategoryProps) {
    this.id = props.id
    this.name = props.name
    this.isPreset = props.isPreset
    this.createdAt = props.createdAt
  }

  static create(params: { name: string; isPreset: boolean }): Category {
    return new Category({
      id: crypto.randomUUID(),
      name: params.name,
      isPreset: params.isPreset,
      createdAt: Date.now(),
    })
  }

  toJSON(): CategoryProps {
    return {
      id: this.id,
      name: this.name,
      isPreset: this.isPreset,
      createdAt: this.createdAt,
    }
  }
}
