import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Plus, Ticket } from '@phosphor-icons/react'
import { useRewardStore } from '@/presentation/hooks/useRewardStore'
import { usePointStore } from '@/presentation/hooks/usePointStore'
import type { Reward } from '@/domain/models/Reward'
import RewardCard from './RewardCard'
import RewardEditModal from './RewardEditModal'
import RedeemConfirm from './RedeemConfirm'
import RedeemSuccess from './RedeemSuccess'

import { ROUTES } from '@/shared/constants'

export default function ShopPage() {
  const navigate = useNavigate()
  const { rewards, categories, pendingCoupons, loading, initPresets, createReward, updateReward, deleteReward, addCustomCategory, redeem, fetchPendingCoupons, fetchCategories } = useRewardStore()
  const { balance, fetchBalance } = usePointStore()

  const [editVisible, setEditVisible] = useState(false)
  const [editTarget, setEditTarget] = useState<Reward | null>(null)
  const [isNew, setIsNew] = useState(false)

  const [confirmVisible, setConfirmVisible] = useState(false)
  const [redeemTarget, setRedeemTarget] = useState<Reward | null>(null)
  const [redeeming, setRedeeming] = useState(false)

  const [successVisible, setSuccessVisible] = useState(false)
  const [successTitle, setSuccessTitle] = useState('')

  useEffect(() => {
    const init = async () => {
      await initPresets()
      await fetchBalance()
      await fetchPendingCoupons()
      await fetchCategories()
    }
    init()
  }, [initPresets, fetchBalance, fetchPendingCoupons, fetchCategories])

  const currentBalance = balance?.currentBalance ?? 0

  const groupedRewards = useMemo(() => {
    const groups: Record<string, Reward[]> = {}
    for (const r of rewards) {
      const catId = r.categoryId
      if (!groups[catId]) groups[catId] = []
      groups[catId].push(r)
    }
    const sorted: { categoryId: string; categoryName: string; items: Reward[] }[] = []
    for (const cat of categories) {
      const items = groups[cat.id]
      if (items) sorted.push({ categoryId: cat.id, categoryName: cat.name, items })
    }
    return sorted
  }, [rewards, categories])

  const handleAdd = () => {
    setEditTarget(null)
    setIsNew(true)
    setEditVisible(true)
  }

  const handleEdit = useCallback((reward: Reward) => {
    setEditTarget(reward)
    setIsNew(false)
    setEditVisible(true)
  }, [])

  const handleSave = async (data: { title: string; points: number; categoryId: string; icon: string }) => {
    if (isNew) {
      await createReward({ title: data.title, points: data.points, categoryId: data.categoryId, icon: data.icon })
    } else if (editTarget) {
      await updateReward(editTarget.id, { title: data.title, points: data.points, categoryId: data.categoryId })
    }
    setEditVisible(false)
  }

  const handleDelete = async () => {
    if (editTarget) {
      await deleteReward(editTarget.id)
      setEditVisible(false)
    }
  }

  const handleRedeemClick = useCallback((reward: Reward) => {
    setRedeemTarget(reward)
    setConfirmVisible(true)
  }, [])

  const handleRedeemConfirm = useCallback(async () => {
    if (!redeemTarget || redeeming) return
    setRedeeming(true)
    try {
      const ok = await redeem(redeemTarget.id)
      setConfirmVisible(false)
      if (ok) {
        setSuccessTitle(redeemTarget.title)
        setSuccessVisible(true)
      }
    } finally {
      setRedeeming(false)
    }
  }, [redeemTarget, redeeming, redeem])

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 24px)',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <h1 className="text-[22px] font-bold text-text-main">🎁 奖励商城</h1>
        <div className="bg-card rounded-full shadow-clay-button flex items-center" style={{ padding: '6px 14px', gap: '6px' }}>
          <Star size={14} weight="fill" className="text-pet-gold" />
          <span className="text-[15px] font-bold text-accent">{currentBalance}</span>
          <span className="text-[12px] text-text-sub">分</span>
        </div>
      </div>

      {/* My Coupons Entry */}
      <button
        onClick={() => navigate(ROUTES.MY_COUPONS)}
        className="w-full bg-card rounded-[14px] shadow-clay flex items-center justify-between active:scale-[0.98] transition-transform"
        style={{ padding: '14px 18px', marginBottom: '16px', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center" style={{ gap: '10px' }}>
          <Ticket size={20} weight="duotone" className="text-accent" />
          <span className="text-[15px] font-bold text-text-main">我的券</span>
        </div>
        <div className="flex items-center" style={{ gap: '6px' }}>
          {pendingCoupons.length > 0 && (
            <span className="bg-accent text-white text-[12px] font-bold rounded-full flex items-center justify-center"
              style={{ width: '22px', height: '22px' }}
            >
              {pendingCoupons.length}
            </span>
          )}
          <span className="text-[14px] text-text-sub">→</span>
        </div>
      </button>

      {/* Loading */}
      {loading && rewards.length === 0 && (
        <div className="flex justify-center" style={{ padding: '40px 0' }}>
          <span className="inline-block w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && rewards.length === 0 && (
        <div className="flex flex-col items-center" style={{ padding: '60px 0', gap: '12px' }}>
          <span className="text-[48px]">🏪</span>
          <p className="text-[15px] text-text-sub">还没有奖励，快添加一个吧</p>
        </div>
      )}

      {/* Reward Groups */}
      <div className="flex flex-col" style={{ gap: '24px' }}>
        {groupedRewards.map(({ categoryId, categoryName, items }) => (
          <div key={categoryId}>
            <h2 className="text-[16px] font-bold text-text-main" style={{ marginBottom: '10px' }}>
              {categoryName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '10px' }}>
              {items.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  canAfford={currentBalance >= reward.points}
                  onRedeem={handleRedeemClick}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB: Add Reward */}
      <button
        onClick={handleAdd}
        className="fixed z-50 bg-accent text-white rounded-full shadow-float flex items-center justify-center active:scale-90 transition-transform"
        style={{ width: '56px', height: '56px', right: '20px', bottom: 'calc(80px + var(--safe-bottom, 0px) + 16px)' }}
        aria-label="添加奖励"
      >
        <Plus size={24} weight="bold" />
      </button>

      {/* Edit Modal */}
      <RewardEditModal
        visible={editVisible}
        reward={editTarget}
        isNew={isNew}
        categories={categories}
        onAddCategory={addCustomCategory}
        onClose={() => setEditVisible(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Redeem Confirm */}
      <RedeemConfirm
        visible={confirmVisible}
        reward={redeemTarget}
        balance={currentBalance}
        redeeming={redeeming}
        onConfirm={handleRedeemConfirm}
        onCancel={() => setConfirmVisible(false)}
      />

      {/* Redeem Success */}
      <RedeemSuccess
        visible={successVisible}
        rewardTitle={successTitle}
        onDone={() => setSuccessVisible(false)}
        onViewCoupons={() => {
          setSuccessVisible(false)
          navigate(ROUTES.MY_COUPONS)
        }}
      />
    </div>
  )
}
