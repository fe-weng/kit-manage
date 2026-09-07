import { memo, useRef } from 'react'
import { CheckCircle, Circle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Task } from '@/domain/models/Task'

interface TodayTaskListProps {
  tasks: Array<{ task: Task; completed: boolean }>
  onComplete: (taskId: string) => Promise<boolean>
  onUncomplete: (taskId: string) => Promise<boolean>
  onManage: () => void
}

export default function TodayTaskList({ tasks, onComplete, onUncomplete, onManage }: TodayTaskListProps) {
  const pending = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)
  const total = tasks.length
  const completedCount = done.length

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
          今日任务
        </h2>
        <button
          onClick={onManage}
          className="active:scale-95 transition-transform"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-accent)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {completedCount}/{total} 已完成
        </button>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div
          className="flex flex-col items-center"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px 16px',
            boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
          }}
        >
          <span style={{ fontSize: '32px' }}>🎉</span>
          <p style={{ fontSize: '14px', color: 'var(--color-text-sub)', marginTop: '8px' }}>
            还没有任务，去添加一些吧
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
            overflow: 'hidden',
          }}
        >
          {/* Completed tasks first */}
          {done.map((item, idx) => (
            <TaskRow
              key={item.task.id}
              task={item.task}
              completed={true}
              onToggle={onUncomplete}
              showBorder={idx < done.length - 1 || pending.length > 0}
            />
          ))}

          {/* Pending tasks */}
          {pending.map((item, idx) => (
            <TaskRow
              key={item.task.id}
              task={item.task}
              completed={false}
              onToggle={onComplete}
              showBorder={idx < pending.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const TaskRow = memo(function TaskRow({
  task,
  completed,
  onToggle,
  showBorder,
}: {
  task: Task
  completed: boolean
  onToggle: (id: string) => Promise<boolean>
  showBorder: boolean
}) {
  const processingRef = useRef(false)
  const handleClick = async () => {
    if (processingRef.current) return
    processingRef.current = true
    try {
      await onToggle(task.id)
    } finally {
      processingRef.current = false
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-between text-left"
      style={{
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: showBorder ? '1px solid #F0E8E0' : 'none',
        cursor: 'pointer',
        minHeight: '48px',
      }}
    >
      <div className="flex items-center" style={{ gap: '10px' }}>
        {completed ? (
          <CheckCircle size={22} weight="fill" style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        ) : (
          <Circle size={22} weight="regular" style={{ color: 'var(--color-placeholder)', flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: '15px',
            color: 'var(--color-text-main)',
          }}
        >
          {task.title}
        </span>
      </div>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-accent)',
        }}
      >
        +{task.points}
      </span>
    </motion.button>
  )
})
