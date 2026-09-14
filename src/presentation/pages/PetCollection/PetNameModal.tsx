import { useEffect, useState, useRef } from 'react'
import BaseModal from '@/presentation/components/BaseModal'

interface PetNameModalProps {
  visible: boolean
  title: string
  confirmLabel: string
  initialName?: string
  submitting?: boolean
  onClose: () => void
  onConfirm: (name: string) => void | Promise<void>
}

export default function PetNameModal({
  visible,
  title,
  confirmLabel,
  initialName = '',
  submitting = false,
  onClose,
  onConfirm,
}: PetNameModalProps) {
  const [name, setName] = useState('')
  const submittingRef = useRef(false)

  useEffect(() => {
    if (visible) {
      setName(initialName)
      submittingRef.current = false
    }
  }, [visible, initialName])

  const handleConfirm = async () => {
    const trimmed = name.trim()
    if (!trimmed || submittingRef.current || submitting) return
    submittingRef.current = true
    try {
      await onConfirm(trimmed)
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      titleId="pet-name-modal-title"
      dialogClassName="max-w-[320px] md:max-w-[400px]"
      dialogStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex flex-col" style={{ gap: '16px' }}>
        <h3
          id="pet-name-modal-title"
          style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, textAlign: 'center' }}
        >
          {title}
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：小花花"
          maxLength={10}
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: 'var(--color-input-bg)',
            border: '1.5px solid var(--color-input-border)',
            borderRadius: '12px',
            fontSize: '15px',
            color: 'var(--color-text-main)',
            outline: 'none',
          }}
        />
        <div className="flex w-full" style={{ gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-sub)',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!name.trim() || submitting}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'var(--color-accent)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: name.trim() && !submitting ? 'pointer' : 'default',
              minHeight: '44px',
              opacity: name.trim() && !submitting ? 1 : 0.4,
            }}
          >
            {submitting ? '处理中...' : confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
