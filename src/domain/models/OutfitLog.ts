interface OutfitLogProps {
  id: string
  childId: string
  outfitSetId: string
  outfitName: string
  pointsCost: number
  redeemedAt: number
}

export class OutfitLog {
  readonly id: string
  readonly childId: string
  readonly outfitSetId: string
  readonly outfitName: string
  readonly pointsCost: number
  readonly redeemedAt: number

  constructor(props: OutfitLogProps) {
    if (!Number.isInteger(props.pointsCost) || props.pointsCost <= 0) {
      throw new Error('兑换积分必须为正整数')
    }
    this.id = props.id
    this.childId = props.childId
    this.outfitSetId = props.outfitSetId
    this.outfitName = props.outfitName
    this.pointsCost = props.pointsCost
    this.redeemedAt = props.redeemedAt
  }

  static create(params: {
    id: string
    childId: string
    outfitSetId: string
    outfitName: string
    pointsCost: number
  }): OutfitLog {
    return new OutfitLog({
      ...params,
      redeemedAt: Date.now(),
    })
  }

  toJSON(): OutfitLogProps {
    return {
      id: this.id,
      childId: this.childId,
      outfitSetId: this.outfitSetId,
      outfitName: this.outfitName,
      pointsCost: this.pointsCost,
      redeemedAt: this.redeemedAt,
    }
  }
}
