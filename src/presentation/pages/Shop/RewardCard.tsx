import { memo } from 'react'
import { Star, PencilSimple } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Reward } from '@/domain/models/Reward'

interface RewardCardProps {
  reward: Reward
  canAfford: boolean
  onRedeem: (reward: Reward) => void
  onEdit: (reward: Reward) => void
}

export default memo(function RewardCard({ reward, canAfford, onRedeem, onEdit }: RewardCardProps) {
  return (
    <div
      className="bg-card rounded-[14px] shadow-clay flex items-center justify-between"
      style={{ padding: '14px 16px' }}
    >
      {/* Left: icon + info */}
      <div className="flex items-center" style={{ gap: '12px' }}>
        <span className="text-[28px]">{reward.icon || '🎁'}</span>
        <div>
          <p className="text-[15px] font-semibold text-text-main">{reward.title}</p>
          <div className="flex items-center" style={{ gap: '4px' }}>
            <Star size={14} weight="fill" className="text-pet-gold" />
            <span className="text-[13px] text-text-sub font-medium">{reward.points} 分</span>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        <button
          onClick={() => onEdit(reward)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-input-bg text-text-sub active:scale-90 transition-transform"
          aria-label="编辑奖励"
        >
          <PencilSimple size={16} weight="bold" />
        </button>
        <motion.button
          onClick={() => onRedeem(reward)}
          disabled={!canAfford}
          whileTap={{ scale: 0.92 }}
          className={`rounded-[10px] text-[13px] font-bold transition-all ${
            canAfford
              ? 'bg-accent text-white shadow-clay-button active:shadow-clay-pressed'
              : 'bg-[#E0E0E0] text-placeholder cursor-not-allowed'
          }`}
          style={{ padding: '8px 14px' }}
        >
          兑换
        </motion.button>
      </div>
    </div>
  )
})
