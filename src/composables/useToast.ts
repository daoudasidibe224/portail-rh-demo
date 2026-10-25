import { ref } from 'vue'

interface ToastMessage {
  id: number
  title: string
  description?: string
  tone: 'success' | 'info' | 'error'
}

const toasts = ref<ToastMessage[]>([])
let nextId = 1

export function useToast() {
  function show(title: string, options: Partial<Omit<ToastMessage, 'id' | 'title'>> = {}) {
    toasts.value.push({ id: nextId++, title, tone: 'success', ...options })
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  return { toasts, show, dismiss }
}
