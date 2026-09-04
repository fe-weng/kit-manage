import { useState, useRef, useCallback, useEffect } from 'react'
import {
  DownloadSimple,
  UploadSimple,
  Trash,
  Info,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { backupService } from '@/shared/container'
import ConfirmDialog from './ConfirmDialog'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'
import PetNameEditor from './PetNameEditor'

export default function SettingsPage() {
  const { status, rename } = usePetStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    return () => { clearTimeout(toastTimerRef.current) }
  }, [])

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const handleExport = async () => {
    try {
      await backupService.exportData()
      showToast('数据已导出')
    } catch (err) {
      console.error('[Settings] 导出失败:', err)
      showToast('导出失败', 'error')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setConfirmImport(true)
    }
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    if (!importFile) return
    try {
      await backupService.importData(importFile)
      showToast('数据已导入，刷新页面生效')
      setConfirmImport(false)
      setImportFile(null)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      console.error('[Settings] 导入失败:', err)
      showToast('导入失败，文件格式不正确', 'error')
      setConfirmImport(false)
    }
  }

  const handleReset = async () => {
    try {
      await backupService.resetAllData()
      showToast('数据已清除，即将刷新')
      setConfirmReset(false)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      console.error('[Settings] 重置失败:', err)
      showToast('重置失败', 'error')
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        paddingTop: 'calc(var(--safe-top, 0px) + 24px)',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
        gap: '20px',
      }}
    >
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>
        ⚙️ 设置
      </h1>

      <PetNameEditor
        currentName={status?.pet.name}
        onRename={rename}
        onToast={showToast}
      />

      {/* Section: Data Management */}
      <SettingsSection title="数据管理">
        <SettingsRow
          icon={<DownloadSimple size={18} weight="bold" />}
          label="导出数据"
          hint="保存到本地 JSON 文件"
          onTap={handleExport}
        />
        <SettingsRow
          icon={<UploadSimple size={18} weight="bold" />}
          label="导入数据"
          hint="从 JSON 文件恢复"
          onTap={() => fileInputRef.current?.click()}
        />
      </SettingsSection>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Section: About */}
      <SettingsSection title="关于">
        <SettingsRow
          icon={<Info size={18} weight="bold" />}
          label="版本"
          value="v1.0.0 MVP"
        />
        <SettingsRow
          icon={<Info size={18} weight="bold" />}
          label="宝贝行为管理"
          hint="让好习惯变成游戏 🎮"
        />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="危险操作" danger>
        <SettingsRow
          icon={<Trash size={18} weight="bold" />}
          label="重置所有数据"
          hint="清除全部任务、积分、宠物数据"
          danger
          onTap={() => setConfirmReset(true)}
        />
      </SettingsSection>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        visible={confirmReset}
        title="⚠️ 确认重置"
        message="这将清除所有数据（任务、积分、宠物），且无法恢复！建议先导出备份。"
        confirmLabel="确认重置"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />

      <ConfirmDialog
        visible={confirmImport}
        title="📦 导入数据"
        message={`确认从 "${importFile?.name}" 导入数据？当前数据将被覆盖。`}
        confirmLabel="确认导入"
        onConfirm={handleImportConfirm}
        onCancel={() => { setConfirmImport(false); setImportFile(null) }}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 flex items-center z-[200]"
          style={{
            bottom: 'calc(80px + var(--safe-bottom, 0px) + 16px)',
            backgroundColor: toast.type === 'success' ? 'var(--color-text-main)' : 'var(--color-danger)',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '10px 20px',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
