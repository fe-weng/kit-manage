export type RewardLogStatus = 'pending' | 'used' | 'returned'

interface RewardLogProps {
  id: string
  rewardId: string
  childId: string
  rewardTitle: string
  pointsCost: number
  redeemedAt: number
  status: RewardLogStatus
  usedAt?: number
  returnedAt?: number
}

export class RewardLog {
  readonly id: string
  readonly rewardId: string
  readonly childId: string
  readonly rewardTitle: string
  readonly pointsCost: number
  readonly redeemedAt: number
  status: RewardLogStatus
  usedAt?: number
  returnedAt?: number

  constructor(props: RewardLogProps) {
    this.id = props.id
    this.rewardId = props.rewardId
    this.childId = props.childId
    this.rewardTitle = props.rewardTitle
    this.pointsCost = props.pointsCost
    this.redeemedAt = props.redeemedAt
    this.status = props.status
    this.usedAt = props.usedAt
    this.returnedAt = props.returnedAt
  }

  static create(params: {
    id: string
    rewardId: string
    childId: string
    rewardTitle: string
    pointsCost: number
  }): RewardLog {
    return new RewardLog({
      ...params,
      redeemedAt: Date.now(),
      status: 'pending',
    })
  }

  markUsed(): void {
    if (!this.isPending) throw new Error('只有待使用的券可以核销')
    this.status = 'used'
    this.usedAt = Date.now()
  }

  markReturned(): void {
    if (!this.isPending) throw new Error('只有待使用的券可以退还')
    this.status = 'returned'
    this.returnedAt = Date.now()
  }

  get isPending(): boolean {
    return this.status === 'pending'
  }

  get isReturned(): boolean {
    return this.status === 'returned'
  }

  toJSON(): RewardLogProps {
    return {
      id: this.id,
      rewardId: this.rewardId,
      childId: this.childId,
      rewardTitle: this.rewardTitle,
      pointsCost: this.pointsCost,
      redeemedAt: this.redeemedAt,
      status: this.status,
      usedAt: this.usedAt,
      returnedAt: this.returnedAt,
    }
  }
}
