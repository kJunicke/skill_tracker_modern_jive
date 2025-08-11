import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toastStore'
import type { ToastVariant } from '@/components/base/BaseToast.vue'
import type { CreateToastOptions } from '@/types/toast'

export function useToasts() {
  const toastStore = useToastStore()
  const { toasts } = storeToRefs(toastStore)

  const toastCount = computed(() => toasts.value.length)
  
  const hasToasts = computed(() => toastCount.value > 0)

  // Create toast with full options
  const createToast = (options: CreateToastOptions) => {
    return toastStore.addToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: options.title,
      message: options.message,
      variant: options.variant || 'info',
      duration: options.duration ?? 5000,
      visible: true,
      createdAt: new Date()
    })
  }

  // Convenience methods for different toast types
  const showSuccess = (title: string, message?: string, duration?: number) => {
    return createToast({
      title,
      message,
      variant: 'success',
      duration
    })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return createToast({
      title,
      message,
      variant: 'error',
      duration: duration ?? 8000 // Errors stay longer by default
    })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    return createToast({
      title,
      message,
      variant: 'warning',
      duration
    })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return createToast({
      title,
      message,
      variant: 'info',
      duration
    })
  }

  // Remove specific toast
  const removeToast = (id: string) => {
    toastStore.removeToast(id)
  }

  // Remove all toasts
  const clearToasts = () => {
    toastStore.clearToasts()
  }

  // Remove toasts by variant
  const clearToastsByVariant = (variant: ToastVariant) => {
    toastStore.clearToastsByVariant(variant)
  }

  // Get toasts by variant
  const getToastsByVariant = (variant: ToastVariant) => {
    return computed(() => toasts.value.filter(toast => toast.variant === variant))
  }

  return {
    // State
    toasts: computed(() => toasts.value),
    toastCount,
    hasToasts,

    // Actions
    createToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
    clearToastsByVariant,
    getToastsByVariant
  }
}