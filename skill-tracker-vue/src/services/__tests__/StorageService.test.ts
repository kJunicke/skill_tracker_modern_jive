import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageService, type StorageAdapter } from '../core/StorageService'
import type { SkillData } from '@/types/skill'

// Mock storage adapter
const mockStorageAdapter: StorageAdapter = {
  load: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn()
}

describe('StorageService', () => {
  let storageService: StorageService
  let mockSkills: SkillData[]

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    storageService = new StorageService(mockStorageAdapter)
    
    // Setup mock data
    mockSkills = [
      {
        id: 'skill_1',
        name: 'Test Skill 1',
        level: 3,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'Test notes',
        dateCreated: '2023-01-01T00:00:00.000Z',
        dateModified: '2023-01-01T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [],
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      },
      {
        id: 'skill_2',
        name: 'Test Skill 2',
        level: 5,
        status: 'maintenance',
        tags: ['Communication'],
        notes: 'More test notes',
        dateCreated: '2023-01-02T00:00:00.000Z',
        dateModified: '2023-01-02T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [],
        easeFactor: 2.7,
        interval: 6,
        repetitions: 2
      }
    ]
  })

  describe('loadSkills', () => {
    it('should load skills successfully', async () => {
      mockStorageAdapter.load = vi.fn().mockResolvedValue(mockSkills)

      const result = await storageService.loadSkills()

      expect(result).toEqual(mockSkills)
      expect(mockStorageAdapter.load).toHaveBeenCalledWith('modernJiveSkills')
    })

    it('should return empty array when no skills exist', async () => {
      mockStorageAdapter.load = vi.fn().mockResolvedValue(null)

      const result = await storageService.loadSkills()

      expect(result).toEqual([])
      expect(mockStorageAdapter.load).toHaveBeenCalledWith('modernJiveSkills')
    })

    it('should return empty array when loaded data is not an array', async () => {
      mockStorageAdapter.load = vi.fn().mockResolvedValue({ invalid: 'data' })

      const result = await storageService.loadSkills()

      expect(result).toEqual([])
    })

    it('should handle load errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockStorageAdapter.load = vi.fn().mockRejectedValue(new Error('Storage error'))

      const result = await storageService.loadSkills()

      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading skills:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('saveSkills', () => {
    it('should save skills successfully', async () => {
      mockStorageAdapter.save = vi.fn().mockResolvedValue(undefined)

      await storageService.saveSkills(mockSkills)

      expect(mockStorageAdapter.save).toHaveBeenCalledWith('modernJiveSkills', mockSkills)
    })

    it('should handle save errors by throwing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockStorageAdapter.save = vi.fn().mockRejectedValue(new Error('Storage error'))

      await expect(storageService.saveSkills(mockSkills))
        .rejects.toThrow('Failed to save skills')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving skills:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('clearSkills', () => {
    it('should clear skills successfully', async () => {
      mockStorageAdapter.remove = vi.fn().mockResolvedValue(undefined)

      await storageService.clearSkills()

      expect(mockStorageAdapter.remove).toHaveBeenCalledWith('modernJiveSkills')
    })

    it('should handle clear errors by throwing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockStorageAdapter.remove = vi.fn().mockRejectedValue(new Error('Storage error'))

      await expect(storageService.clearSkills())
        .rejects.toThrow('Failed to clear skills')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error clearing skills:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('backupSkills', () => {
    it('should create backup and return skills', async () => {
      mockStorageAdapter.load = vi.fn().mockResolvedValue(mockSkills)
      mockStorageAdapter.save = vi.fn().mockResolvedValue(undefined)

      const result = await storageService.backupSkills()

      expect(result).toEqual(mockSkills)
      expect(mockStorageAdapter.load).toHaveBeenCalledWith('modernJiveSkills')
      expect(mockStorageAdapter.save).toHaveBeenCalledWith(
        expect.stringMatching(/^modernJiveSkills_backup_\d+$/),
        mockSkills
      )
    })

    it('should backup empty array if no skills exist', async () => {
      mockStorageAdapter.load = vi.fn().mockResolvedValue([])
      mockStorageAdapter.save = vi.fn().mockResolvedValue(undefined)

      const result = await storageService.backupSkills()

      expect(result).toEqual([])
      expect(mockStorageAdapter.save).toHaveBeenCalledWith(
        expect.stringMatching(/^modernJiveSkills_backup_\d+$/),
        []
      )
    })
  })

  describe('StorageService constants', () => {
    it('should use correct storage key', () => {
      // This test ensures the private static SKILLS_KEY is used consistently
      // We verify this by checking the key used in method calls
      mockStorageAdapter.load = vi.fn().mockResolvedValue([])
      
      storageService.loadSkills()
      
      expect(mockStorageAdapter.load).toHaveBeenCalledWith('modernJiveSkills')
    })
  })
})