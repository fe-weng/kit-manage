import { WarningCircle } from '@phosphor-icons/react'
import BaseModal from '@/presentation/components/BaseModal'

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onCancel}
      titleId="confirm-dialog-title"
      dialogClassName="max-w-[320px] md:max-w-[400px]"
      dialogStyle={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex flex-col items-center" style={{ gap: '14px' }}>
        {danger && (
          <WarningCircle size={40} weight="fill" className="text-danger" />
        )}
        <h3 id="confirm-dialog-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0, textAlign: 'center' }}>
          {title}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-sub)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>

        <div className="flex w-full" style={{ gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onCancel}
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
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: danger ? 'var(--color-danger)' : 'var(--color-accent)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
