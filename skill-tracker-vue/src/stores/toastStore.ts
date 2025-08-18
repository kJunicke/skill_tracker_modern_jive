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

  // Helper function to generate unique toast ID - DRY principle
  const generateToastId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Helper function for common toast creation pattern
  const createToast = (
    title: string, 
    variant: ToastVariant, 
    defaultDuration: number,
    message?: string, 
    duration?: number
  ): string => {
    return addToast({
      id: generateToastId(),
      title,
      message,
      variant,
      duration: duration ?? defaultDuration,
      visible: true,
      createdAt: new Date()
    })
  }

  // Utility actions for common toast patterns
  const showSuccess = (title: string, message?: string, duration?: number): string => {
    return createToast(title, 'success', 4000, message, duration)
  }

  const showError = (title: string, message?: string, duration?: number): string => {
    return createToast(title, 'error', 8000, message, duration) // Errors stay longer
  }

  const showWarning = (title: string, message?: string, duration?: number): string => {
    return createToast(title, 'warning', 6000, message, duration)
  }

  const showInfo = (title: string, message?: string, duration?: number): string => {
    return createToast(title, 'info', 5000, message, duration)
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