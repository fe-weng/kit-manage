import { useMemo } from 'react'
import { useTaskHistoryStore } from '@/presentation/hooks/useTaskHistoryStore'

export default function MonthStats() {
  const { dateStatusMap, logs } = useTaskHistoryStore()

  const stats = useMemo(() => {
    const entries = Object.values(dateStatusMap)
    const totalDays = entries.filter((s) => s.level !== 'empty').length
    const fullDays = entries.filter((s) => s.level === 'full').length
    const totalTasks = entries.reduce((sum, s) => sum + s.totalTasks, 0)
    const completedTasks = entries.reduce((sum, s) => sum + s.completedTasks, 0)
    const totalPoints = logs.reduce((sum, l) => sum + l.pointsEarned, 0)
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return { totalDays, fullDays, completedTasks, totalTasks, totalPoints, completionRate }
  }, [dateStatusMap, logs])

  if (stats.totalDays === 0) return null

  return (
    <div className="bg-white rounded-clay shadow-clay p-4 mb-4">
      <h3 className="text-caption font-semibold text-text-sub mb-3">本月统计</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatItem value={`${stats.completionRate}%`} label="任务完成率" color="text-accent" />
        <StatItem value={`${stats.fullDays}/${stats.totalDays}`} label="全勤天数" color="text-primary" />
        <StatItem
          value={`${stats.totalPoints >= 0 ? '+' : ''}${stats.totalPoints}`}
          label="总积分"
          color="text-pet-gold"
        />
      </div>
    </div>
  )
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className={`text-heading font-bold ${color}`}>{value}</div>
      <div className="text-label text-text-sub">{label}</div>
    </div>
  )
}
