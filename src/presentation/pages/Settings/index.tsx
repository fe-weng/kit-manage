import { useState, useRef, useEffect } from 'react'
import {
  DownloadSimple,
  UploadSimple,
  Trash,
  Info,
} from '@phosphor-icons/react'
import { usePetStore } from '@/presentation/hooks/usePetStore'
import { backupService } from '@/shared/container'
import ConfirmDialog from './ConfirmDialog'
import SettingsSection from './SettingsSection'
import SettingsRow from './SettingsRow'
import PetNameEditor from './PetNameEditor'
import { toast } from '@/shared/toast'

export default function SettingsPage() {
  const { status, rename, fetchPet } = usePetStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleExport = async () => {
    try {
      await backupService.exportData()
      toast.success('数据已导出')
    } catch (err) {
      console.error('[Settings] 导出失败:', err)
      toast.error('导出失败')
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
      toast.success('数据已导入，刷新页面生效')
      setConfirmImport(false)
      setImportFile(null)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      console.error('[Settings] 导入失败:', err)
      toast.error('导入失败，文件格式不正确')
      setConfirmImport(false)
    }
  }

  const handleReset = async () => {
    try {
      await backupService.resetAllData()
      toast.success('数据已清除，即将刷新')
      setConfirmReset(false)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      console.error('[Settings] 重置失败:', err)
      toast.error('重置失败')
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
    </div>
  )
}
