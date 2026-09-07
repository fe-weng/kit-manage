import { create } from 'zustand'

type ToastType = 'error' | 'success'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
  _show: (msg: string, type: ToastType) => void
  _hide: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'error',
  visible: false,

  _show: (msg, type) => {
    clearTimeout(timer)
    set({ message: msg, type, visible: true })
    timer = setTimeout(() => set({ visible: false }), 2500)
  },

  _hide: () => {
    clearTimeout(timer)
    set({ visible: false })
  },
}))

export const toast = {
  success: (msg: string) => useToastStore.getState()._show(msg, 'success'),
  error: (msg: string) => useToastStore.getState()._show(msg, 'error'),
  hide: () => useToastStore.getState()._hide(),
}
