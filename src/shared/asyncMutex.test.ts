import { describe, expect, it } from 'vitest'
import { AsyncMutex } from './asyncMutex'

describe('AsyncMutex', () => {
  it('锁占用时第二次立即失败，不排队执行', async () => {
    const mutex = new AsyncMutex()
    let releaseHold!: () => void
    const hold = new Promise<void>((resolve) => {
      releaseHold = resolve
    })

    const firstRelease = mutex.tryAcquire()
    if (firstRelease === null) {
      throw new Error('首次加锁应成功')
    }

    const first = (async () => {
      await hold
      firstRelease()
    })()

    let secondStarted = false
    const secondRelease = mutex.tryAcquire()
    if (secondRelease !== null) {
      secondStarted = true
      secondRelease()
    }

    expect(secondRelease).toBeNull()
    expect(secondStarted).toBe(false)

    releaseHold()
    await first

    const thirdRelease = mutex.tryAcquire()
    if (thirdRelease === null) {
      throw new Error('释放后应能再次加锁')
    }
    thirdRelease()
  })
})
