interface RewardLogProps {
  id: string
  rewardId: string
  childId: string
  rewardTitle: string
  pointsCost: number
  redeemedAt: number
}

export class RewardLog {
  readonly id: string
  readonly rewardId: string
  readonly childId: string
  readonly rewardTitle: string
  readonly pointsCost: number
  readonly redeemedAt: number

  constructor(props: RewardLogProps) {
    this.id = props.id
    this.rewardId = props.rewardId
    this.childId = props.childId
    this.rewardTitle = props.rewardTitle
    this.pointsCost = props.pointsCost
    this.redeemedAt = props.redeemedAt
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
    })
  }

  toJSON(): RewardLogProps {
    return {
      id: this.id,
      rewardId: this.rewardId,
      childId: this.childId,
      rewardTitle: this.rewardTitle,
      pointsCost: this.pointsCost,
      redeemedAt: this.redeemedAt,
    }
  }
}
