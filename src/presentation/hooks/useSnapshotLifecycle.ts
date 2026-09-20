import { useEffect, useRef } from 'react'
import { taskService } from '@/shared/container'
import { getTodayDateStr } from '@/domain/rules/DateUtils'
import { useTaskHistoryStore } from './useTaskHistoryStore'

/**
 * App 级快照生命周期：
 * - 冷启动生成今日快照，并补齐上线日以来缺失的历史快照
 * - 从后台回到前台时，若已跨天则生成新一天快照并补中间缺天
 */
export function useSnapshotLifecycle() {
  const lastDateRef = useRef<string | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    const run = async () => {
      if (runningRef.current) return
      const today = getTodayDateStr()
      if (lastDateRef.current === today) return

      runningRef.current = true
      try {
        await taskService.ensureSnapshotsUpToToday()
        lastDateRef.current = today
        await useTaskHistoryStore.getState().refreshIfLoaded()
      } finally {
        runningRef.current = false
      }
    }

    void run()

    const onResume = () => {
      if (document.visibilityState === 'hidden') return
      void run()
    }

    document.addEventListener('visibilitychange', onResume)
    window.addEventListener('pageshow', onResume)
    window.addEventListener('focus', onResume)
    return () => {
      document.removeEventListener('visibilitychange', onResume)
      window.removeEventListener('pageshow', onResume)
      window.removeEventListener('focus', onResume)
    }
  }, [])
}
