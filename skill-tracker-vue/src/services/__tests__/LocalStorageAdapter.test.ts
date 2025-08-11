import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock implementations to default behavior
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
    localStorageMock.clear.mockImplementation(() => {})
    adapter = new LocalStorageAdapter()
  })

  describe('load', () => {
    it('should load and parse data from localStorage', async () => {
      const mockData = { test: 'data', array: [1, 2, 3] }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData))

      const result = await adapter.load('testKey')

      expect(result).toEqual(mockData)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey')
    })

    it('should return null when item does not exist', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = await adapter.load('nonExistentKey')

      expect(result).toBeNull()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('nonExistentKey')
    })

    it('should return null and log error when JSON parsing fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid-json{')

      const result = await adapter.load('invalidKey')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading from localStorage key "invalidKey":',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle localStorage access errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied')
      })

      const result = await adapter.load('testKey')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading from localStorage key "testKey":',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('save', () => {
    it('should stringify and save data to localStorage', async () => {
      const testData = { test: 'data', number: 42, array: ['a', 'b'] }

      await adapter.save('testKey', testData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData))
    })

    it('should handle different data types', async () => {
      // Test with array
      const arrayData = [1, 2, 3, 'test']
      await adapter.save('arrayKey', arrayData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('arrayKey', JSON.stringify(arrayData))

      // Test with string
      const stringData = 'simple string'
      await adapter.save('stringKey', stringData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('stringKey', JSON.stringify(stringData))

      // Test with number
      const numberData = 123.45
      await adapter.save('numberKey', numberData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('numberKey', JSON.stringify(numberData))

      // Test with boolean
      const booleanData = true
      await adapter.save('booleanKey', booleanData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('booleanKey', JSON.stringify(booleanData))
    })

    it('should throw error when localStorage save fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const storageError = new Error('localStorage quota exceeded')
      localStorageMock.setItem.mockImplementation(() => {
        throw storageError
      })

      await expect(adapter.save('testKey', { data: 'test' }))
        .rejects.toThrow('Failed to save data to localStorage: Error: localStorage quota exceeded')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving to localStorage key "testKey":',
        storageError
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('remove', () => {
    it('should remove item from localStorage', async () => {
      await adapter.remove('testKey')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey')
    })

    it('should throw error when localStorage remove fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const storageError = new Error('localStorage access denied')
      localStorageMock.removeItem.mockImplementation(() => {
        throw storageError
      })

      await expect(adapter.remove('testKey'))
        .rejects.toThrow('Failed to remove data from localStorage: Error: localStorage access denied')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error removing from localStorage key "testKey":',
        storageError
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('clear', () => {
    it('should clear all localStorage data', async () => {
      await adapter.clear()

      expect(localStorageMock.clear).toHaveBeenCalled()
    })

    it('should throw error when localStorage clear fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const storageError = new Error('localStorage access denied')
      localStorageMock.clear.mockImplementation(() => {
        throw storageError
      })

      await expect(adapter.clear())
        .rejects.toThrow('Failed to clear localStorage: Error: localStorage access denied')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error clearing localStorage:',
        storageError
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('integration scenarios', () => {
    it('should handle a complete save-load cycle', async () => {
      const testData = {
        skills: [
          { id: '1', name: 'Test Skill 1', level: 3 },
          { id: '2', name: 'Test Skill 2', level: 5 }
        ],
        metadata: {
          lastUpdated: '2023-01-01T00:00:00.000Z',
          version: '1.0.0'
        }
      }

      // Save data
      await adapter.save('testData', testData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('testData', JSON.stringify(testData))

      // Mock the return value for loading
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData))

      // Load data
      const loaded = await adapter.load('testData')
      expect(loaded).toEqual(testData)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData')
    })

    it('should handle edge case with null and undefined values', async () => {
      const testData = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        emptyArray: [],
        emptyObject: {}
      }

      await adapter.save('edgeCaseData', testData)
      
      // Note: JSON.stringify converts undefined to null in objects
      const expectedSerialized = JSON.stringify(testData)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('edgeCaseData', expectedSerialized)
    })
  })
})