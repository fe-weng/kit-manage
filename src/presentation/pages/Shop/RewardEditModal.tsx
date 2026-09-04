import { useState, useEffect, useCallback } from 'react'
import { X, FloppyDisk, Trash, WarningCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Reward } from '@/domain/models/Reward'
import { REWARD_CATEGORIES } from '@/shared/constants'

interface RewardEditModalProps {
  visible: boolean
  reward: Reward | null
  isNew: boolean
  onClose: () => void
  onSave: (data: { title: string; points: number; category: string; icon: string }) => void | Promise<void>
  onDelete: () => void
}

const CATEGORIES = REWARD_CATEGORIES
const ICONS = ['📺', '🎮', '🍦', '🍬', '🎁', '⏰', '🎈', '🎨', '📚', '🏖️']

const inputBaseClass =
  'w-full bg-input-bg border border-input-border rounded-[12px] text-body text-text-main placeholder:text-placeholder focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all'
const inputStyle = { padding: '14px 16px' }

export default function RewardEditModal({
  visible,
  reward,
  isNew,
  onClose,
  onSave,
  onDelete,
}: RewardEditModalProps) {
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState('')
  const [category, setCategory] = useState('娱乐')
  const [icon, setIcon] = useState('🎁')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (visible) {
      if (reward && !isNew) {
        setTitle(reward.title)
        setPoints(String(reward.points))
        setCategory(reward.category)
        setIcon(reward.icon || '🎁')
      } else {
        setTitle('')
        setPoints('')
        setCategory('娱乐')
        setIcon('🎁')
      }
      setShowDeleteConfirm(false)
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [visible, reward, isNew, handleEsc])

  const handleSave = async () => {
    if (!title.trim() || !points.trim() || saving) return
    const parsed = parseInt(points, 10)
    if (isNaN(parsed) || parsed <= 0) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), points: parsed, category, icon })
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none"
            style={{ padding: '0 24px' }}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="bg-white rounded-[20px] shadow-float w-full max-w-[340px] md:max-w-[420px] pointer-events-auto"
              style={{ padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h2 className="text-[20px] font-bold text-text-main">
                  {isNew ? '添加奖励' : '编辑奖励'}
                </h2>
                <button onClick={onClose} aria-label="关闭" className="w-11 h-11 flex items-center justify-center -mr-2 text-text-sub hover:text-text-main">
                  <X size={22} weight="bold" />
                </button>
              </div>
              <div className="w-full h-px bg-input-border" style={{ marginBottom: '20px' }} />

              <div className="flex flex-col" style={{ gap: '16px' }}>
                {/* Icon Selection */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>图标</label>
                  <div className="flex flex-wrap" style={{ gap: '8px' }}>
                    {ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] transition-all ${
                          icon === ic ? 'bg-accent/15 ring-2 ring-accent' : 'bg-input-bg'
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>奖励名称</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：看1小时动画片" className={inputBaseClass} style={inputStyle} />
                </div>

                {/* Points */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>所需积分</label>
                  <input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="如：50" min="1" className={inputBaseClass} style={inputStyle} />
                </div>

                {/* Category Chips */}
                <div>
                  <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>分类</label>
                  <div className="flex flex-wrap" style={{ gap: '8px' }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`rounded-[10px] text-[13px] font-medium transition-all active:scale-95 ${
                          category === cat
                            ? 'bg-accent text-white shadow-clay-button'
                            : 'bg-input-bg text-text-sub border border-input-border'
                        }`}
                        style={{ padding: '6px 14px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!title.trim() || !points.trim() || saving}
                className="w-full bg-accent text-white font-bold text-[16px] rounded-[14px] shadow-clay-button active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center"
                style={{ height: '48px', marginTop: '24px', gap: '8px' }}
              >
                {saving ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><FloppyDisk size={20} weight="bold" /><span>保存</span></>
                )}
              </button>

              {/* Delete */}
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="w-full text-danger font-semibold text-[14px] min-h-[44px] active:scale-95 transition-transform flex items-center justify-center"
                  style={{ marginTop: '8px', gap: '4px' }}
                >
                  {showDeleteConfirm ? (
                    <><WarningCircle size={16} weight="fill" /><span>确认删除？再点一次</span></>
                  ) : (
                    <><Trash size={16} weight="bold" /><span>删除奖励</span></>
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
