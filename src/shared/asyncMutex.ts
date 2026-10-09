export class AsyncMutex {
  private locked = false

  /** 占用时返回 null，调用方应立即失败，不要排队等待。 */
  tryAcquire(): (() => void) | null {
    if (this.locked) return null
    this.locked = true
    return () => {
      this.locked = false
    }
  }
}
