import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Toast, ToastOptions } from '@/types/toast'
import type { ToastVariant } from '@/components/base/BaseToast.vue'

export const useToastStore = defineStore('toast', () => {
  // State
  const toasts = ref<Toast[]>([])
  const maxToasts = ref(5)

  // Getters
  const toastCount = computed(() => toasts.value.length)
  const hasToasts = computed(() => toastCount.value > 0)
  const visibleToasts = computed(() => toasts.value.filter(toast => toast.visible))

  // Actions
  const addToast = (toastOptions: ToastOptions): string => {
    const toast: Toast = {
      id: toastOptions.id,
      title: toastOptions.title,
      message: toastOptions.message,
      variant: toastOptions.variant || 'info',
      duration: toastOptions.duration ?? 5000,
      visible: toastOptions.visible,
      createdAt: toastOptions.createdAt
    }

    // Add to beginning of array for newest-first display
    toasts.value.unshift(toast)

    // Enforce max toasts limit
    if (toasts.value.length > maxToasts.value) {
      toasts.value = toasts.value.slice(0, maxToasts.value)
    }

    return toast.id
  }

  const removeToast = (id: string): boolean => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
      return true
    }
    return false
  }

  const hideToast = (id: string): boolean => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.visible = false
      // Remove after animation completes
      setTimeout(() => removeToast(id), 300)
      return true
    }
    return false
  }

  const clearToasts = (): void => {
    toasts.value = []
  }

  const clearToastsByVariant = (variant: ToastVariant): void => {
    toasts.value = toasts.value.filter(toast => toast.variant !== variant)
  }

  const getToast = (id: string): Toast | undefined => {
    return toasts.value.find(toast => toast.id === id)
  }

  const getToastsByVariant = (variant: ToastVariant): Toast[] => {
    return toasts.value.filter(toast => toast.variant === variant)
  }

  const updateToast = (id: string, updates: Partial<Omit<Toast, 'id' | 'createdAt'>>): boolean => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      Object.assign(toast, updates)
      return true
    }
    return false
  }

  const setMaxToasts = (max: number): void => {
    maxToasts.value = Math.max(1, max)
    
    // Trim existing toasts if needed
    if (toasts.value.length > maxToasts.value) {
      toasts.value = toasts.value.slice(0, maxToasts.value)
    }
  }

  // Utility actions for common toast patterns
  const showSuccess = (title: string, message?: string, duration?: number): string => {
    return addToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      variant: 'success',
      duration: duration ?? 4000,
      visible: true,
      createdAt: new Date()
    })
  }

  const showError = (title: string, message?: string, duration?: number): string => {
    return addToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      variant: 'error',
      duration: duration ?? 8000, // Errors stay longer
      visible: true,
      createdAt: new Date()
    })
  }

  const showWarning = (title: string, message?: string, duration?: number): string => {
    return addToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      variant: 'warning',
      duration: duration ?? 6000,
      visible: true,
      createdAt: new Date()
    })
  }

  const showInfo = (title: string, message?: string, duration?: number): string => {
    return addToast({
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      variant: 'info',
      duration: duration ?? 5000,
      visible: true,
      createdAt: new Date()
    })
  }

  return {
    // State
    toasts,
    maxToasts,

    // Getters
    toastCount,
    hasToasts,
    visibleToasts,

    // Actions
    addToast,
    removeToast,
    hideToast,
    clearToasts,
    clearToastsByVariant,
    getToast,
    getToastsByVariant,
    updateToast,
    setMaxToasts,

    // Utility actions
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})