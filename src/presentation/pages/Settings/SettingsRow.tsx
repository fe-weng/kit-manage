interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  value?: string
  hint?: string
  danger?: boolean
  onTap?: () => void
}

export default function SettingsRow({ icon, label, value, hint, danger, onTap }: SettingsRowProps) {
  const Wrapper = onTap ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onTap}
      className="w-full flex items-center justify-between text-left"
      style={{
        padding: '14px 16px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid #F0E8E0',
        cursor: onTap ? 'pointer' : 'default',
        minHeight: '44px',
      }}
    >
      <div className="flex items-center" style={{ gap: '10px' }}>
        <span style={{ color: danger ? 'var(--color-danger)' : 'var(--color-accent)' }}>{icon}</span>
        <div>
          <span style={{ fontSize: '15px', fontWeight: 500, color: danger ? 'var(--color-danger)' : 'var(--color-text-main)' }}>
            {label}
          </span>
          {hint && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-sub)', margin: '2px 0 0' }}>{hint}</p>
          )}
        </div>
      </div>
      {value && (
        <span style={{ fontSize: '14px', color: 'var(--color-text-sub)' }}>{value}</span>
      )}
    </Wrapper>
  )
}
