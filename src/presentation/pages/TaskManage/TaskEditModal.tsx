import React, { useState, useEffect, useCallback } from 'react'
import { X, FloppyDisk, Trash, WarningCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskType, getTaskTypeLabel } from '@/domain/valueObjects/TaskType'
import type { Task } from '@/domain/models/Task'

interface TaskEditModalProps {
  visible: boolean
  task: Task | null
  isNew: boolean
  onClose: () => void
  onSave: (data: { title: string; points: number; type: TaskType }) => void | Promise<void>
  onDelete: () => void
}

const TASK_TYPES: TaskType[] = [
  TaskType.DAILY,
  TaskType.WEEKLY,
  TaskType.ONE_TIME,
  TaskType.NEGATIVE,
]

const inputBaseClass =
  'w-full text-body text-text-main placeholder:text-placeholder focus:outline-none transition-all'
const inputStyle: React.CSSProperties = {
  padding: '14px 16px',
  backgroundColor: 'var(--color-input-bg)',
  border: '1px solid var(--color-input-border)',
  borderRadius: '12px',
  fontSize: '15px',
  color: 'var(--color-text-main)',
}
const inputFocusStyle = {
  borderColor: 'var(--color-accent)',
  boxShadow: '0 0 0 2px rgba(126,207,192,0.2)',
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
      className={inputBaseClass}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
    />
  )
}

export default function TaskEditModal({
  visible,
  task,
  isNew,
  onClose,
  onSave,
  onDelete,
}: TaskEditModalProps) {
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState('')
  const [type, setType] = useState<TaskType>(TaskType.DAILY)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (visible) {
      if (task && !isNew) {
        setTitle(task.title)
        setPoints(String(Math.abs(task.points)))
        setType(task.type)
      } else {
        setTitle('')
        setPoints('')
        setType(TaskType.DAILY)
      }
      setShowDeleteConfirm(false)
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [visible, task, isNew, handleEsc])

  const handleSave = async () => {
    if (!title.trim() || !points.trim() || saving) return
    const parsedPoints = parseInt(points, 10)
    if (isNaN(parsedPoints) || parsedPoints <= 0) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        points: type === TaskType.NEGATIVE ? -parsedPoints : parsedPoints,
        type,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDelete()
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none px-6"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-edit-title"
              className="w-full max-w-[340px] md:max-w-[420px] pointer-events-auto"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '24px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h2 id="task-edit-title" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
                  {isNew ? '新增任务' : '编辑任务'}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="关闭"
                  className="flex items-center justify-center transition-colors"
                  style={{ width: '44px', height: '44px', marginRight: '-8px', color: 'var(--color-text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={22} weight="bold" />
                </button>
              </div>

              <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-input-border)', marginBottom: '20px' }} />

              {/* Form */}
              <div className="flex flex-col" style={{ gap: '20px' }}>
                {/* Task Name */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>
                    任务名称
                  </label>
                  <StyledInput
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入任务名称"
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>
                    积分
                  </label>
                  <StyledInput
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="输入积分数值"
                    min="1"
                  />
                </div>

                {/* Task Type - Chip Group */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>
                    任务类型
                  </label>
                  <div className="flex flex-wrap" style={{ gap: '8px' }}>
                    {TASK_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 500,
                          border: type === t ? 'none' : '1px solid var(--color-input-border)',
                          backgroundColor: type === t ? 'var(--color-accent)' : 'var(--color-input-bg)',
                          color: type === t ? '#FFFFFF' : 'var(--color-text-sub)',
                          boxShadow: type === t ? '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.8)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {getTaskTypeLabel(t)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!title.trim() || !points.trim() || saving}
                className="flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-40"
                style={{
                  width: '100%',
                  marginTop: '28px',
                  height: '48px',
                  backgroundColor: 'var(--color-accent)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                {saving ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FloppyDisk size={20} weight="bold" />
                    <span>保存</span>
                  </>
                )}
              </button>

              {/* Delete Button (edit mode only) */}
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    minHeight: '44px',
                    padding: '10px 0',
                    color: 'var(--color-danger)',
                    fontWeight: 600,
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    gap: '4px',
                  }}
                >
                  {showDeleteConfirm ? (
                    <>
                      <WarningCircle size={16} weight="fill" />
                      <span>确认删除？再点一次删除</span>
                    </>
                  ) : (
                    <>
                      <Trash size={16} weight="bold" />
                      <span>删除任务</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
