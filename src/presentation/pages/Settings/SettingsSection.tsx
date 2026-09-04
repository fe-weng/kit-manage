interface SettingsSectionProps {
  title: string
  danger?: boolean
  children: React.ReactNode
}

export default function SettingsSection({ title, danger, children }: SettingsSectionProps) {
  return (
    <div>
      <h2
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: danger ? 'var(--color-danger)' : 'var(--color-text-sub)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '8px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
