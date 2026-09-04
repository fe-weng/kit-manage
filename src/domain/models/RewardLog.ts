export type RewardLogStatus = 'pending' | 'used'

interface RewardLogProps {
  id: string
  rewardId: string
  childId: string
  rewardTitle: string
  pointsCost: number
  redeemedAt: number
  status: RewardLogStatus
  usedAt?: number
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

  constructor(props: RewardLogProps) {
    this.id = props.id
    this.rewardId = props.rewardId
    this.childId = props.childId
    this.rewardTitle = props.rewardTitle
    this.pointsCost = props.pointsCost
    this.redeemedAt = props.redeemedAt
    this.status = props.status
    this.usedAt = props.usedAt
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
    this.status = 'used'
    this.usedAt = Date.now()
  }

  get isPending(): boolean {
    return this.status === 'pending'
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
    }
  }
}
