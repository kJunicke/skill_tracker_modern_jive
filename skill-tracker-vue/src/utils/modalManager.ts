import { Modal } from 'bootstrap'

// Modal instance cache to prevent memory leaks
const modalInstances = new Map<string, Modal>()

/**
 * Shows a Bootstrap modal by element ID
 * @param elementId - The modal element ID
 * @returns Promise that resolves when modal is shown
 */
export async function showModal(elementId: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn(`Modal element with ID "${elementId}" not found`)
    return
  }

  try {
    // Get existing instance or create new one
    let modal = modalInstances.get(elementId)
    if (!modal) {
      modal = new Modal(element)
      modalInstances.set(elementId, modal)
    }

    modal.show()
  } catch (error) {
    console.error(`Error showing modal "${elementId}":`, error)
  }
}

/**
 * Hides a Bootstrap modal by element ID
 * @param elementId - The modal element ID
 * @returns Promise that resolves when modal is hidden
 */
export async function hideModal(elementId: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn(`Modal element with ID "${elementId}" not found`)
    return
  }

  try {
    const modal = modalInstances.get(elementId) || Modal.getInstance(element)
    if (modal) {
      modal.hide()
    }
  } catch (error) {
    console.error(`Error hiding modal "${elementId}":`, error)
  }
}

/**
 * Destroys a modal instance and removes it from cache
 * @param elementId - The modal element ID
 */
export function destroyModal(elementId: string): void {
  const modal = modalInstances.get(elementId)
  if (modal) {
    modal.dispose()
    modalInstances.delete(elementId)
  }
}

/**
 * Destroys all cached modal instances
 */
export function destroyAllModals(): void {
  modalInstances.forEach((modal) => {
    modal.dispose()
  })
  modalInstances.clear()
}

/**
 * Checks if a modal is currently visible
 * @param elementId - The modal element ID
 * @returns boolean indicating if modal is visible
 */
export function isModalVisible(elementId: string): boolean {
  const element = document.getElementById(elementId)
  if (!element) return false
  
  return element.classList.contains('show')
}