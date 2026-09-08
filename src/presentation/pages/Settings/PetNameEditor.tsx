import { useState, useRef } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { toast } from '@/shared/toast'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'

interface PetNameEditorProps {
  currentName: string | undefined
  onRename: (name: string) => Promise<void>
}

export default function PetNameEditor({ currentName, onRename }: PetNameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')

  const handleEdit = () => {
    if (currentName) {
      setNewName(currentName)
      setEditing(true)
    }
  }

  const savingRef = useRef(false)
  const handleSave = async () => {
    if (!newName.trim() || savingRef.current) return
    savingRef.current = true
    try {
      await onRename(newName.trim())
      setEditing(false)
      toast.success('宠物名字已更新')
    } catch (err) {
      console.error('[PetNameEditor] 改名失败:', err)
      toast.error('改名失败，请重试')
    } finally {
      savingRef.current = false
    }
  }

  return (
    <>
      <SettingsSection title="宠物信息">
        <SettingsRow
          icon={<PencilSimple size={18} weight="bold" />}
          label="宠物名字"
          value={currentName ?? '—'}
          onTap={handleEdit}
        />
      </SettingsSection>

      {editing && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '8px 8px 16px rgba(0,0,0,0.08), -4px -4px 12px rgba(255,255,255,0.9)',
          }}
        >
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '8px' }}>
            修改宠物名字
          </label>
          <div className="flex" style={{ gap: '8px' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={10}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'var(--color-input-bg)',
                border: '1px solid var(--color-input-border)',
                borderRadius: '10px',
                fontSize: '14px',
                color: 'var(--color-text-main)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSave}
              disabled={!newName.trim()}
              style={{
                padding: '10px 18px',
                backgroundColor: 'var(--color-accent)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                opacity: newName.trim() ? 1 : 0.4,
              }}
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-input-bg)',
                color: 'var(--color-text-sub)',
                fontWeight: 500,
                fontSize: '14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  )
}
