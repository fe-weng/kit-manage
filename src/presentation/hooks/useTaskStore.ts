import { create } from 'zustand'
import { taskService } from '@/shared/container'
import type { Task } from '@/domain/models/Task'
import type { TaskType } from '@/domain/valueObjects/TaskType'
import { usePointStore } from './usePointStore'

interface TaskStore {
  tasks: Array<{ task: Task; completed: boolean }>
  stats: { completedCount: number; earnedPoints: number; totalTasks: number }
  loading: boolean
  fetchTasks: () => Promise<void>
  fetchStats: () => Promise<void>
  completeTask: (taskId: string) => Promise<boolean>
  uncompleteTask: (taskId: string) => Promise<boolean>
  createTask: (params: { title: string; type: TaskType; points: number; icon?: string }) => Promise<Task>
  updateTask: (taskId: string, params: { title?: string; points?: number; type?: TaskType }) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  stats: { completedCount: 0, earnedPoints: 0, totalTasks: 0 },
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    const tasks = await taskService.getTasksWithStatus()
    set({ tasks, loading: false })
  },

  fetchStats: async () => {
    const stats = await taskService.getTodayStats()
    set({ stats })
  },

  completeTask: async (taskId: string) => {
    const log = await taskService.completeTask(taskId)
    if (log) {
      await get().fetchTasks()
      await get().fetchStats()
      await usePointStore.getState().fetchBalance()
      return true
    }
    return false
  },

  uncompleteTask: async (taskId: string) => {
    const success = await taskService.uncompleteTask(taskId)
    if (success) {
      await get().fetchTasks()
      await get().fetchStats()
      await usePointStore.getState().fetchBalance()
    }
    return success
  },

  createTask: async (params) => {
    const task = await taskService.createTask(params)
    await get().fetchTasks()
    return task
  },

  updateTask: async (taskId, params) => {
    await taskService.updateTask(taskId, params)
    await get().fetchTasks()
  },

  deleteTask: async (taskId) => {
    await taskService.deleteTask(taskId)
    await get().fetchTasks()
    await get().fetchStats()
  },
}))
