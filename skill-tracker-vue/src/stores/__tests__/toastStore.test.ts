import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToastStore } from '../toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const toastStore = useToastStore()
    
    expect(toastStore.toasts).toHaveLength(0)
    expect(toastStore.toastCount).toBe(0)
    expect(toastStore.hasToasts).toBe(false)
    expect(toastStore.maxToasts).toBe(5)
  })

  it('adds toast correctly', () => {
    const toastStore = useToastStore()
    const testDate = new Date()
    
    const toastId = toastStore.addToast({
      id: 'test-1',
      title: 'Test Toast',
      message: 'Test message',
      variant: 'success',
      duration: 5000,
      visible: true,
      createdAt: testDate
    })

    expect(toastId).toBe('test-1')
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toastCount).toBe(1)
    expect(toastStore.hasToasts).toBe(true)
    
    const toast = toastStore.toasts[0]
    expect(toast.title).toBe('Test Toast')
    expect(toast.message).toBe('Test message')
    expect(toast.variant).toBe('success')
    expect(toast.duration).toBe(5000)
    expect(toast.visible).toBe(true)
    expect(toast.createdAt).toBe(testDate)
  })

  it('adds toast to beginning of array (newest first)', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'First Toast',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Second Toast',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    expect(toastStore.toasts[0].id).toBe('toast-2')
    expect(toastStore.toasts[1].id).toBe('toast-1')
  })

  it('respects maxToasts limit', () => {
    const toastStore = useToastStore()
    toastStore.setMaxToasts(3)
    
    // Add 5 toasts
    for (let i = 1; i <= 5; i++) {
      toastStore.addToast({
        id: `toast-${i}`,
        title: `Toast ${i}`,
        variant: 'info',
        duration: 5000,
        visible: true,
        createdAt: new Date()
      })
    }

    expect(toastStore.toasts).toHaveLength(3)
    expect(toastStore.toasts[0].id).toBe('toast-5')
    expect(toastStore.toasts[1].id).toBe('toast-4')
    expect(toastStore.toasts[2].id).toBe('toast-3')
  })

  it('removes toast by id', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Toast 1',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Toast 2',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    expect(toastStore.removeToast('toast-1')).toBe(true)
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toasts[0].id).toBe('toast-2')
    
    expect(toastStore.removeToast('non-existent')).toBe(false)
  })

  it('hides toast and removes after timeout', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Toast 1',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    const result = toastStore.hideToast('toast-1')
    expect(result).toBe(true)
    
    const toast = toastStore.getToast('toast-1')
    expect(toast?.visible).toBe(false)
    
    // Test hiding non-existent toast
    expect(toastStore.hideToast('non-existent')).toBe(false)
  })

  it('clears all toasts', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Toast 1',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Toast 2',
      variant: 'success',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.clearToasts()
    expect(toastStore.toasts).toHaveLength(0)
    expect(toastStore.hasToasts).toBe(false)
  })

  it('clears toasts by variant', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Toast 1',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Toast 2',
      variant: 'success',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-3',
      title: 'Toast 3',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.clearToastsByVariant('info')
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toasts[0].variant).toBe('success')
  })

  it('gets toasts by variant', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Toast 1',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Toast 2',
      variant: 'success',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-3',
      title: 'Toast 3',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    const infoToasts = toastStore.getToastsByVariant('info')
    expect(infoToasts).toHaveLength(2)
    expect(infoToasts.every(toast => toast.variant === 'info')).toBe(true)
  })

  it('updates toast correctly', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Original Title',
      message: 'Original message',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    const result = toastStore.updateToast('toast-1', {
      title: 'Updated Title',
      message: 'Updated message',
      variant: 'success'
    })

    expect(result).toBe(true)
    
    const toast = toastStore.getToast('toast-1')
    expect(toast?.title).toBe('Updated Title')
    expect(toast?.message).toBe('Updated message')
    expect(toast?.variant).toBe('success')
    
    // Test updating non-existent toast
    expect(toastStore.updateToast('non-existent', { title: 'New' })).toBe(false)
  })

  it('utility methods work correctly', () => {
    const toastStore = useToastStore()
    
    // Test showSuccess
    const successId = toastStore.showSuccess('Success', 'Success message', 3000)
    expect(successId).toBeTruthy()
    let toast = toastStore.getToast(successId)
    expect(toast?.variant).toBe('success')
    expect(toast?.duration).toBe(3000)
    
    // Test showError
    const errorId = toastStore.showError('Error', 'Error message')
    toast = toastStore.getToast(errorId)
    expect(toast?.variant).toBe('error')
    expect(toast?.duration).toBe(8000) // Default error duration
    
    // Test showWarning
    const warningId = toastStore.showWarning('Warning', 'Warning message')
    toast = toastStore.getToast(warningId)
    expect(toast?.variant).toBe('warning')
    expect(toast?.duration).toBe(6000) // Default warning duration
    
    // Test showInfo
    const infoId = toastStore.showInfo('Info', 'Info message')
    toast = toastStore.getToast(infoId)
    expect(toast?.variant).toBe('info')
    expect(toast?.duration).toBe(5000) // Default info duration
  })

  it('sets max toasts with minimum of 1', () => {
    const toastStore = useToastStore()
    
    toastStore.setMaxToasts(10)
    expect(toastStore.maxToasts).toBe(10)
    
    toastStore.setMaxToasts(0)
    expect(toastStore.maxToasts).toBe(1) // Should enforce minimum
    
    toastStore.setMaxToasts(-5)
    expect(toastStore.maxToasts).toBe(1) // Should enforce minimum
  })

  it('trims existing toasts when reducing max toasts', () => {
    const toastStore = useToastStore()
    
    // Add 5 toasts
    for (let i = 1; i <= 5; i++) {
      toastStore.addToast({
        id: `toast-${i}`,
        title: `Toast ${i}`,
        variant: 'info',
        duration: 5000,
        visible: true,
        createdAt: new Date()
      })
    }

    expect(toastStore.toasts).toHaveLength(5)
    
    // Reduce max toasts to 3
    toastStore.setMaxToasts(3)
    expect(toastStore.toasts).toHaveLength(3)
    
    // Should keep the newest 3 (toast-5, toast-4, toast-3)
    expect(toastStore.toasts[0].id).toBe('toast-5')
    expect(toastStore.toasts[1].id).toBe('toast-4')
    expect(toastStore.toasts[2].id).toBe('toast-3')
  })

  it('visibleToasts computed property filters correctly', () => {
    const toastStore = useToastStore()
    
    toastStore.addToast({
      id: 'toast-1',
      title: 'Visible Toast',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })

    toastStore.addToast({
      id: 'toast-2',
      title: 'Hidden Toast',
      variant: 'info',
      duration: 5000,
      visible: false,
      createdAt: new Date()
    })

    expect(toastStore.visibleToasts).toHaveLength(1)
    expect(toastStore.visibleToasts[0].id).toBe('toast-1')
  })
})