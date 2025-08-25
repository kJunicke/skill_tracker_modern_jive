/**
 * Modal Keyboard Navigation Composable
 * Standardizes keyboard navigation across all Vue 3 Teleport modals
 * Supports Tab, Escape, Enter keys with proper focus management
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseModalKeyboardNavigationOptions {
  isVisible: Ref<boolean>
  onClose: () => void
  onConfirm?: () => void
  confirmButtonSelector?: string
  trapFocus?: boolean
}

export function useModalKeyboardNavigation({
  isVisible,
  onClose,
  onConfirm,
  confirmButtonSelector = '.btn-primary',
  trapFocus = true
}: UseModalKeyboardNavigationOptions) {
  
  const modalElement = ref<HTMLElement | null>(null)
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '.form-check-input:not([disabled])'
  ].join(', ')

  // Get all focusable elements within the modal
  const getFocusableElements = (): HTMLElement[] => {
    if (!modalElement.value) return []
    return Array.from(modalElement.value.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }

  // Focus the first focusable element
  const focusFirstElement = () => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  // Focus the last focusable element
  const focusLastElement = () => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
    }
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isVisible.value || !modalElement.value) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        onClose()
        break

      case 'Enter':
        // Only trigger confirm on Enter if not in a textarea or form field
        const target = event.target as HTMLElement
        if (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT') {
          if (onConfirm) {
            event.preventDefault()
            onConfirm()
          } else {
            // Try to click the primary button if no custom confirm handler
            const confirmButton = modalElement.value.querySelector(confirmButtonSelector) as HTMLButtonElement
            if (confirmButton && !confirmButton.disabled) {
              event.preventDefault()
              confirmButton.click()
            }
          }
        }
        break

      case 'Tab':
        if (trapFocus) {
          const focusableElements = getFocusableElements()
          if (focusableElements.length === 0) {
            event.preventDefault()
            return
          }

          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]
          const activeElement = document.activeElement as HTMLElement

          if (event.shiftKey) {
            // Shift + Tab (backwards)
            if (activeElement === firstElement) {
              event.preventDefault()
              lastElement.focus()
            }
          } else {
            // Tab (forwards)
            if (activeElement === lastElement) {
              event.preventDefault()
              firstElement.focus()
            }
          }
        }
        break
    }
  }

  // Set modal element reference for focus management
  const setModalElement = (element: HTMLElement | null) => {
    modalElement.value = element
  }

  // Initialize keyboard navigation when modal becomes visible
  const initializeKeyboardNavigation = () => {
    if (isVisible.value) {
      // Focus the first element after a short delay to ensure DOM is ready
      setTimeout(() => {
        focusFirstElement()
      }, 100)
    }
  }

  // Cleanup function
  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown)
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    if (isVisible.value) {
      initializeKeyboardNavigation()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    setModalElement,
    focusFirstElement,
    focusLastElement,
    initializeKeyboardNavigation,
    cleanup
  }
}