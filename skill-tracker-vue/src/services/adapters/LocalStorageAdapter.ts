import type { StorageAdapter } from '../core/StorageService'

/**
 * LocalStorage implementation of StorageAdapter
 */
export class LocalStorageAdapter implements StorageAdapter {
  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error)
      return null
    }
  }

  async save<T>(key: string, data: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error)
      throw new Error(`Failed to save data to localStorage: ${error}`)
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error)
      throw new Error(`Failed to remove data from localStorage: ${error}`)
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      throw new Error(`Failed to clear localStorage: ${error}`)
    }
  }
}