interface PointBalanceProps {
  childId: string
  totalEarned: number
  totalSpentOnPet: number
  totalSpentOnReward: number
}

export class PointBalance {
  readonly childId: string
  totalEarned: number
  totalSpentOnPet: number
  totalSpentOnReward: number

  constructor(props: PointBalanceProps) {
    this.childId = props.childId
    this.totalEarned = props.totalEarned
    this.totalSpentOnPet = props.totalSpentOnPet
    this.totalSpentOnReward = props.totalSpentOnReward
  }

  static create(childId: string): PointBalance {
    return new PointBalance({
      childId,
      totalEarned: 0,
      totalSpentOnPet: 0,
      totalSpentOnReward: 0,
    })
  }

  get currentBalance(): number {
    return this.totalEarned - this.totalSpentOnPet - this.totalSpentOnReward
  }

  earn(amount: number): void {
    if (amount <= 0) throw new Error('获取积分必须为正数')
    this.totalEarned += amount
  }

  deduct(amount: number): void {
    if (amount <= 0) throw new Error('扣除积分必须为正数')
    this.totalEarned = Math.max(0, this.totalEarned - amount)
  }

  spendOnPet(amount: number): boolean {
    if (!this.canAfford(amount)) return false
    this.totalSpentOnPet += amount
    return true
  }

  spendOnReward(amount: number): boolean {
    if (!this.canAfford(amount)) return false
    this.totalSpentOnReward += amount
    return true
  }

  canAfford(amount: number): boolean {
    return this.currentBalance >= amount
  }

  toJSON(): PointBalanceProps & { currentBalance: number } {
    return {
      childId: this.childId,
      totalEarned: this.totalEarned,
      totalSpentOnPet: this.totalSpentOnPet,
      totalSpentOnReward: this.totalSpentOnReward,
      currentBalance: this.currentBalance,
    }
  }
}
