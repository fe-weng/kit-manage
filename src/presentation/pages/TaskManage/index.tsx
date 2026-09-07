import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CaretRight } from '@phosphor-icons/react'
import { useTaskStore } from '@/presentation/hooks/useTaskStore'
import { TaskType, getTaskTypeLabel } from '@/domain/valueObjects/TaskType'
import { formatPoints } from '@/domain/rules/PointRule'
import type { Task } from '@/domain/models/Task'
import { ROUTES } from '@/shared/constants'
import { toast } from '@/shared/toast'
import TaskEditModal from './TaskEditModal'

export default function TaskManagePage() {
  const navigate = useNavigate()
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewMode, setIsNewMode] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const tasksByType = [
    { type: TaskType.DAILY, items: tasks.filter((t) => t.task.type === TaskType.DAILY) },
    { type: TaskType.WEEKLY, items: tasks.filter((t) => t.task.type === TaskType.WEEKLY) },
    { type: TaskType.ONE_TIME, items: tasks.filter((t) => t.task.type === TaskType.ONE_TIME) },
    { type: TaskType.NEGATIVE, items: tasks.filter((t) => t.task.type === TaskType.NEGATIVE) },
  ].filter((group) => group.items.length > 0)

  const handleAddNew = () => {
    setEditingTask(null)
    setIsNewMode(true)
    setShowModal(true)
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsNewMode(false)
    setShowModal(true)
  }

  const handleSave = async (data: { title: string; points: number; type: TaskType }) => {
    try {
      if (isNewMode) {
        await createTask(data)
      } else if (editingTask) {
        await updateTask(editingTask.id, data)
      }
      setShowModal(false)
    } catch (err) {
      console.error('[TaskManage] 保存失败:', err)
      toast.error('保存失败，请重试')
    }
  }

  const handleDelete = async () => {
    if (!editingTask) return
    try {
      await deleteTask(editingTask.id)
      setShowModal(false)
    } catch (err) {
      console.error('[TaskManage] 删除失败:', err)
      toast.error('删除失败，请重试')
    }
  }

  return (
    <div className="px-4 pb-4" style={{ paddingTop: 'calc(var(--safe-top, 0px) + 48px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.TASKS)}
            className="flex items-center gap-1 text-primary active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} weight="bold" />
            <span className="text-body">返回</span>
          </button>
          <h1 className="text-[22px] font-bold text-text-main ml-2">任务管理</h1>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1 bg-primary text-white px-4 py-2.5 min-h-[44px] rounded-xl text-caption font-semibold active:scale-95 transition-transform"
        >
          <Plus size={16} weight="bold" />
          新增
        </button>
      </div>

      {/* Task Groups */}
      {tasksByType.map(({ type, items }) => (
        <div key={type} className="mb-4">
          <h3 className="text-caption font-semibold text-text-sub mb-2">
            {getTaskTypeLabel(type)}
          </h3>
          <div className="space-y-2">
            {items.map(({ task }) => (
              <button
                key={task.id}
                onClick={() => handleEdit(task)}
                className="w-full flex items-center gap-3 bg-white rounded-xl shadow-clay-button px-4 py-3 text-left active:scale-[0.98] active:shadow-clay-pressed transition-all"
              >
                <span className="flex-1 text-body text-text-main">{task.title}</span>
                <span
                  className={`text-caption font-semibold ${
                    task.isNegative() ? 'text-danger' : 'text-accent'
                  }`}
                >
                  {formatPoints(task.points)}
                </span>
                <CaretRight size={16} className="text-text-sub" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-16 text-text-sub">
          <p className="text-heading mb-2">还没有任务</p>
          <p className="text-caption">点击右上角「新增」添加第一个任务</p>
        </div>
      )}

      {/* Edit / New Task Modal */}
      <TaskEditModal
        visible={showModal}
        task={editingTask}
        isNew={isNewMode}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
