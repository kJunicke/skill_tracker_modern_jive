import type { ToastVariant } from '@/components/base/BaseToast.vue'

export interface Toast {
  id: string
  title: string
  message?: string
  variant: ToastVariant
  duration: number
  visible: boolean
  createdAt: Date
}

export interface CreateToastOptions {
  title: string
  message?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastOptions extends CreateToastOptions {
  id: string
  visible: boolean
  createdAt: Date
}