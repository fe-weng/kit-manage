import { useState } from 'react'
import { Egg, PawPrint } from '@phosphor-icons/react'

interface CreatePetFormProps {
  onSubmit: (name: string, type: string) => void | Promise<void>
}

const PET_TYPES = [
  { id: 'chicken', label: '小鸡', emoji: '🐣' },
  { id: 'rabbit', label: '小兔', emoji: '🐰' },
]

export default function CreatePetForm({ onSubmit }: CreatePetFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('chicken')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(name.trim(), type)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ gap: '32px' }}>
      <div className="flex flex-col items-center" style={{ gap: '12px' }}>
        <div className="w-24 h-24 bg-[#FFF0E8] rounded-full flex items-center justify-center">
          <Egg size={48} weight="duotone" className="text-warning" />
        </div>
        <h2 className="text-[22px] font-bold text-text-main">领养一只宠物</h2>
        <p className="text-[14px] text-text-sub text-center">
          完成任务赚积分，喂养它长大吧！
        </p>
      </div>

      <div className="w-full max-w-[300px] md:max-w-[400px] flex flex-col" style={{ gap: '20px' }}>
        {/* Pet Name */}
        <div>
          <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>
            给它起个名字
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：小花花"
            maxLength={10}
            className="w-full bg-input-bg border border-input-border rounded-[12px] text-body text-text-main placeholder:text-placeholder focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
            style={{ padding: '14px 16px' }}
          />
        </div>

        {/* Pet Type */}
        <div>
          <label className="text-[14px] font-semibold text-text-main block" style={{ marginBottom: '8px' }}>
            选择宠物类型
          </label>
          <div className="flex" style={{ gap: '12px' }}>
            {PET_TYPES.map((pt) => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setType(pt.id)}
                className={`flex-1 rounded-[14px] flex flex-col items-center transition-all active:scale-95 ${
                  type === pt.id
                    ? 'bg-accent/10 border-2 border-accent shadow-clay-button'
                    : 'bg-input-bg border-2 border-transparent'
                }`}
                style={{ padding: '16px 12px', gap: '8px' }}
              >
                <span className="text-[36px]">{pt.emoji}</span>
                <span className={`text-[14px] font-medium ${type === pt.id ? 'text-accent' : 'text-text-sub'}`}>
                  {pt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className="w-full bg-accent text-white font-bold text-[16px] rounded-[14px] shadow-clay-button active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center"
          style={{ height: '48px', gap: '8px' }}
        >
          <PawPrint size={20} weight="bold" />
          <span>{submitting ? '创建中...' : '开始养宠物'}</span>
        </button>
      </div>
    </div>
  )
}
