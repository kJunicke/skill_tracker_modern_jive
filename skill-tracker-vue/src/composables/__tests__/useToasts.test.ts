import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useToasts } from '../useToasts'
import { useToastStore } from '@/stores/toastStore'

describe('useToasts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('provides reactive access to toast store', () => {
    const { toasts, toastCount, hasToasts } = useToasts()
    const toastStore = useToastStore()
    
    expect(toasts.value).toHaveLength(0)
    expect(toastCount.value).toBe(0)
    expect(hasToasts.value).toBe(false)
    
    // Add a toast through store
    toastStore.addToast({
      id: 'test-1',
      title: 'Test Toast',
      variant: 'info',
      duration: 5000,
      visible: true,
      createdAt: new Date()
    })
    
    expect(toasts.value).toHaveLength(1)
    expect(toastCount.value).toBe(1)
    expect(hasToasts.value).toBe(true)
  })

  it('createToast generates unique ids and adds toasts', () => {
    const { createToast, toasts } = useToasts()
    
    const id1 = createToast({
      title: 'Toast 1',
      message: 'Message 1',
      variant: 'success'
    })
    
    const id2 = createToast({
      title: 'Toast 2',
      message: 'Message 2',
      variant: 'error'
    })
    
    expect(id1).toBeTruthy()
    expect(id2).toBeTruthy()
    expect(id1).not.toBe(id2)
    expect(toasts.value).toHaveLength(2)
  })

  it('showSuccess creates success toast with correct defaults', () => {
    const { showSuccess, toasts } = useToasts()
    
    const id = showSuccess('Success Title', 'Success message')
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.id).toBe(id)
    expect(toast.title).toBe('Success Title')
    expect(toast.message).toBe('Success message')
    expect(toast.variant).toBe('success')
    expect(toast.duration).toBe(5000) // Default duration
  })

  it('showError creates error toast with longer default duration', () => {
    const { showError, toasts } = useToasts()
    
    showError('Error Title', 'Error message')
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.variant).toBe('error')
    expect(toast.duration).toBe(8000) // Error default duration
  })

  it('showWarning creates warning toast', () => {
    const { showWarning, toasts } = useToasts()
    
    showWarning('Warning Title', 'Warning message')
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.variant).toBe('warning')
    expect(toast.duration).toBe(5000) // Default duration
  })

  it('showInfo creates info toast', () => {
    const { showInfo, toasts } = useToasts()
    
    showInfo('Info Title', 'Info message')
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.variant).toBe('info')
    expect(toast.duration).toBe(5000) // Default duration
  })

  it('convenience methods accept custom duration', () => {
    const { showSuccess, showError, showWarning, showInfo, toasts } = useToasts()
    
    showSuccess('Success', 'Message', 3000)
    showError('Error', 'Message', 10000)
    showWarning('Warning', 'Message', 7000)
    showInfo('Info', 'Message', 2000)
    
    expect(toasts.value).toHaveLength(4)
    expect(toasts.value[3].duration).toBe(3000) // Success
    expect(toasts.value[2].duration).toBe(10000) // Error
    expect(toasts.value[1].duration).toBe(7000) // Warning
    expect(toasts.value[0].duration).toBe(2000) // Info
  })

  it('convenience methods work without message', () => {
    const { showSuccess, toasts } = useToasts()
    
    showSuccess('Title Only')
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.title).toBe('Title Only')
    expect(toast.message).toBeUndefined()
  })

  it('removeToast removes specific toast', () => {
    const { createToast, removeToast, toasts } = useToasts()
    
    const id1 = createToast({ title: 'Toast 1', variant: 'info' })
    const id2 = createToast({ title: 'Toast 2', variant: 'info' })
    
    expect(toasts.value).toHaveLength(2)
    
    removeToast(id1)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].id).toBe(id2)
  })

  it('clearToasts removes all toasts', () => {
    const { createToast, clearToasts, toasts } = useToasts()
    
    createToast({ title: 'Toast 1', variant: 'info' })
    createToast({ title: 'Toast 2', variant: 'success' })
    
    expect(toasts.value).toHaveLength(2)
    
    clearToasts()
    expect(toasts.value).toHaveLength(0)
  })

  it('clearToastsByVariant removes only specified variant', () => {
    const { createToast, clearToastsByVariant, toasts } = useToasts()
    
    createToast({ title: 'Info 1', variant: 'info' })
    createToast({ title: 'Success 1', variant: 'success' })
    createToast({ title: 'Info 2', variant: 'info' })
    createToast({ title: 'Error 1', variant: 'error' })
    
    expect(toasts.value).toHaveLength(4)
    
    clearToastsByVariant('info')
    expect(toasts.value).toHaveLength(2)
    
    const remainingVariants = toasts.value.map(toast => toast.variant)
    expect(remainingVariants).not.toContain('info')
    expect(remainingVariants).toContain('success')
    expect(remainingVariants).toContain('error')
  })

  it('getToastsByVariant returns reactive computed', () => {
    const { createToast, getToastsByVariant } = useToasts()
    
    const infoToasts = getToastsByVariant('info')
    expect(infoToasts.value).toHaveLength(0)
    
    createToast({ title: 'Info 1', variant: 'info' })
    createToast({ title: 'Success 1', variant: 'success' })
    createToast({ title: 'Info 2', variant: 'info' })
    
    expect(infoToasts.value).toHaveLength(2)
    expect(infoToasts.value.every(toast => toast.variant === 'info')).toBe(true)
    
    // Should be reactive
    createToast({ title: 'Info 3', variant: 'info' })
    expect(infoToasts.value).toHaveLength(3)
  })

  it('createToast uses default values correctly', () => {
    const { createToast, toasts } = useToasts()
    
    createToast({ title: 'Minimal Toast' })
    
    expect(toasts.value).toHaveLength(1)
    const toast = toasts.value[0]
    expect(toast.title).toBe('Minimal Toast')
    expect(toast.message).toBeUndefined()
    expect(toast.variant).toBe('info') // Default variant
    expect(toast.duration).toBe(5000) // Default duration
    expect(toast.visible).toBe(true)
    expect(toast.createdAt).toBeInstanceOf(Date)
  })

  it('createToast respects provided duration', () => {
    const { createToast, toasts } = useToasts()
    
    createToast({ 
      title: 'Custom Duration', 
      variant: 'success',
      duration: 10000 
    })
    
    expect(toasts.value[0].duration).toBe(10000)
  })

  it('createToast handles zero duration (no auto-dismiss)', () => {
    const { createToast, toasts } = useToasts()
    
    createToast({ 
      title: 'Persistent Toast', 
      variant: 'warning',
      duration: 0 
    })
    
    expect(toasts.value[0].duration).toBe(0)
  })
})