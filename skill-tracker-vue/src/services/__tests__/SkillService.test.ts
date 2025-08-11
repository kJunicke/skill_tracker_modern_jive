import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SkillService, type CreateSkillDto, type PracticeSessionDto } from '../core/SkillService'
import type { StorageService } from '../core/StorageService'
import type { SpacedRepetitionService } from '../core/SpacedRepetitionService'
import type { AnalyticsService } from '../core/AnalyticsService'
import type { SkillData } from '@/types/skill'

// Mock services
const mockStorageService = {
  loadSkills: vi.fn(),
  saveSkills: vi.fn(),
  clearSkills: vi.fn(),
  backupSkills: vi.fn(),
  adapter: {} // Required property for StorageService interface
}

const mockSpacedRepetitionService = {
  calculateTargetXP: vi.fn(),
  updateSM2Parameters: vi.fn(),
  handleFocusProgression: vi.fn(),
  resetFocusDataForLevelUp: vi.fn(),
  checkAutomaticStatusTransitions: vi.fn(),
  shouldSuggestLevelUp: vi.fn()
}

const mockAnalyticsService = {}

describe('SkillService', () => {
  let skillService: SkillService
  let mockSkills: SkillData[]

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    skillService = new SkillService(
      mockStorageService as unknown as StorageService,
      mockSpacedRepetitionService as unknown as SpacedRepetitionService,
      mockAnalyticsService as unknown as AnalyticsService
    )

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
      }
    ]

    mockStorageService.loadSkills.mockResolvedValue([...mockSkills])
    mockStorageService.saveSkills.mockResolvedValue(undefined)
    
    // Set up default returns for spaced repetition service
    mockSpacedRepetitionService.checkAutomaticStatusTransitions.mockReturnValue({})
    mockSpacedRepetitionService.shouldSuggestLevelUp.mockReturnValue(false)
  })

  describe('createSkill', () => {
    it('should create a new skill with valid data', async () => {
      const skillData: CreateSkillDto = {
        name: 'New Skill',
        level: 1,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'New skill notes'
      }

      mockSpacedRepetitionService.calculateTargetXP.mockReturnValue(15)

      const result = await skillService.createSkill(skillData)

      expect(result).toMatchObject({
        name: 'New Skill',
        level: 1,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'New skill notes'
      })
      expect(result.id).toMatch(/^skill_\d+_[a-z0-9]+$/)
      expect(result.dateCreated).toBeTruthy()
      expect(result.dateModified).toBeTruthy()
      expect(result.easeFactor).toBe(2.5)
      expect(result.interval).toBe(1)
      expect(result.repetitions).toBe(0)
      expect(mockStorageService.saveSkills).toHaveBeenCalledWith([...mockSkills, result])
    })

    it('should initialize focus data for focus status skills', async () => {
      const skillData: CreateSkillDto = {
        name: 'Focus Skill',
        level: 2,
        status: 'focus',
        tags: ['Communication'],
        notes: 'Focus skill notes'
      }

      mockSpacedRepetitionService.calculateTargetXP.mockReturnValue(25)

      const result = await skillService.createSkill(skillData)

      expect(result.focusData).toEqual({
        totalSessions: 0,
        consecutiveGoodSessions: 0,
        currentXP: 0,
        targetXP: 25,
        lastQuality: null,
        readyForLevelUp: false
      })
      expect(mockSpacedRepetitionService.calculateTargetXP).toHaveBeenCalledWith(2)
    })

    it('should throw error for invalid skill data', async () => {
      const invalidSkillData: CreateSkillDto = {
        name: '', // Invalid: empty name
        level: 1,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'Test notes'
      }

      await expect(skillService.createSkill(invalidSkillData)).rejects.toThrow('Invalid skill data: Skill name is required')
    })

    it('should validate skill name length', async () => {
      const invalidSkillData: CreateSkillDto = {
        name: 'a'.repeat(101), // Invalid: too long
        level: 1,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'Test notes'
      }

      await expect(skillService.createSkill(invalidSkillData)).rejects.toThrow('Skill name must be 100 characters or less')
    })

    it('should validate skill level range', async () => {
      const invalidSkillData: CreateSkillDto = {
        name: 'Test Skill',
        level: -1, // Invalid: negative
        status: 'acquisition',
        tags: ['Move'],
        notes: 'Test notes'
      }

      await expect(skillService.createSkill(invalidSkillData)).rejects.toThrow('Skill level must be 0 or higher')
    })
  })

  describe('updateSkill', () => {
    it('should update an existing skill', async () => {
      const updates = { name: 'Updated Skill Name', level: 4 }

      const result = await skillService.updateSkill('skill_1', updates)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dateModified, ...expectedResult } = mockSkills[0]
      expect(result).toMatchObject({
        ...expectedResult,
        name: 'Updated Skill Name',
        level: 4
      })
      expect(result.dateModified).not.toBe(mockSkills[0].dateModified)
      expect(mockStorageService.saveSkills).toHaveBeenCalled()
    })

    it('should throw error when skill not found', async () => {
      await expect(skillService.updateSkill('nonexistent', { name: 'Updated' }))
        .rejects.toThrow('Skill with id nonexistent not found')
    })
  })

  describe('deleteSkill', () => {
    it('should delete an existing skill', async () => {
      const result = await skillService.deleteSkill('skill_1')

      expect(result).toBe(true)
      expect(mockStorageService.saveSkills).toHaveBeenCalledWith([])
    })

    it('should return false when skill not found', async () => {
      const result = await skillService.deleteSkill('nonexistent')

      expect(result).toBe(false)
      expect(mockStorageService.saveSkills).not.toHaveBeenCalled()
    })
  })

  describe('recordPracticeSession', () => {
    it('should record a practice session', async () => {
      const session: PracticeSessionDto = {
        quality: 3, // Changed to 3 for "Good" in 1-4 scale
        note: 'Good practice session'
      }

      const sm2Updates = {
        easeFactor: 2.48,
        interval: 6,
        repetitions: 1,
        nextReview: '2023-01-07T00:00:00.000Z'
      }

      mockSpacedRepetitionService.updateSM2Parameters.mockReturnValue(sm2Updates)

      const result = await skillService.recordPracticeSession('skill_1', session)

      expect(result.practiceLog).toHaveLength(1)
      expect(result.practiceLog[0]).toMatchObject({
        quality: 3, // Updated to match new quality
        qualityText: 'Good', // This should now be correct
        note: 'Good practice session'
      })
      expect(result.practiceLog[0].date).toBeTruthy()
      expect(result.lastPracticed).toBeTruthy()
      expect(result.easeFactor).toBe(2.48)
      expect(mockSpacedRepetitionService.updateSM2Parameters).toHaveBeenCalledWith(
        expect.objectContaining({...mockSkills[0]}), 3
      )
      expect(mockStorageService.saveSkills).toHaveBeenCalled()
    })

    it('should handle focus progression for focus skills', async () => {
      const focusSkill = { ...mockSkills[0], status: 'focus' as const }
      mockStorageService.loadSkills.mockResolvedValue([focusSkill])

      const session: PracticeSessionDto = { quality: 2, note: 'Focus practice' }
      const sm2Updates = { easeFactor: 2.48, interval: 6, repetitions: 1, nextReview: '2023-01-07T00:00:00.000Z' }
      const focusUpdates = { focusData: { totalSessions: 1, currentXP: 2, readyForLevelUp: false } }

      mockSpacedRepetitionService.updateSM2Parameters.mockReturnValue(sm2Updates)
      mockSpacedRepetitionService.handleFocusProgression.mockReturnValue(focusUpdates)

      const result = await skillService.recordPracticeSession('skill_1', session)

      expect(mockSpacedRepetitionService.handleFocusProgression).toHaveBeenCalledWith(focusSkill, 2)
      expect(result.focusData).toEqual(focusUpdates.focusData)
    })

    it('should throw error when skill not found', async () => {
      const session: PracticeSessionDto = { quality: 2, note: 'Test' }

      await expect(skillService.recordPracticeSession('nonexistent', session))
        .rejects.toThrow('Skill with id nonexistent not found')
    })
  })

  describe('levelUpSkill', () => {
    it('should level up a skill', async () => {
      const result = await skillService.levelUpSkill('skill_1', 4, 'Great progress!')

      expect(result.level).toBe(4)
      expect(result.progressionHistory).toHaveLength(1)
      expect(result.progressionHistory[0]).toMatchObject({
        level: 4,
        comment: 'Great progress!',
        previousLevel: 3
      })
      expect(result.progressionHistory[0].date).toBeTruthy()
      expect(mockStorageService.saveSkills).toHaveBeenCalled()
    })

    it('should reset focus data when leveling up focus skills', async () => {
      const focusSkill = { 
        ...mockSkills[0], 
        status: 'focus' as const, 
        focusData: { totalSessions: 5, currentXP: 8, readyForLevelUp: true }
      }
      mockStorageService.loadSkills.mockResolvedValue([focusSkill])

      const focusResetUpdates = {
        focusData: { currentXP: 0, targetXP: 30, readyForLevelUp: false }
      }
      mockSpacedRepetitionService.resetFocusDataForLevelUp.mockReturnValue(focusResetUpdates)

      const result = await skillService.levelUpSkill('skill_1', 4, 'Level up!')

      expect(mockSpacedRepetitionService.resetFocusDataForLevelUp).toHaveBeenCalledWith(focusSkill, 4)
      expect(result.focusData).toEqual(focusResetUpdates.focusData)
    })


    it('should throw error when skill not found', async () => {
      await expect(skillService.levelUpSkill('nonexistent', 4, 'Test'))
        .rejects.toThrow('Skill with id nonexistent not found')
    })
  })

  describe('updateLevelUpComment', () => {
    it('should update level-up comment', async () => {
      const skillWithProgression = {
        ...mockSkills[0],
        progressionHistory: [{ level: 4, date: '2023-01-01', comment: 'Old comment', previousLevel: 3 }]
      }
      mockStorageService.loadSkills.mockResolvedValue([skillWithProgression])

      await skillService.updateLevelUpComment('skill_1', 4, 'Updated comment')

      expect(mockStorageService.saveSkills).toHaveBeenCalled()
      const savedSkills = mockStorageService.saveSkills.mock.calls[0][0]
      expect(savedSkills[0].progressionHistory[0].comment).toBe('Updated comment')
    })
  })

  describe('shouldSuggestStatusTransition', () => {
    it('should suggest transition when skill qualifies', async () => {
      const acquisitionSkill = { 
        ...mockSkills[0], 
        level: 5,
        status: 'acquisition' as const
      }
      mockStorageService.loadSkills.mockResolvedValue([acquisitionSkill])

      const transitionUpdates = { status: 'maintenance' as const }
      mockSpacedRepetitionService.checkAutomaticStatusTransitions.mockReturnValue(transitionUpdates)

      const result = await skillService.shouldSuggestStatusTransition('skill_1')

      expect(result.shouldSuggest).toBe(true)
      expect(result.suggestedStatus).toBe('maintenance')
      expect(result.reason).toContain('Level 5 erreicht')
    })

    it('should not suggest transition when skill does not qualify', async () => {
      const acquisitionSkill = { 
        ...mockSkills[0], 
        level: 3,
        status: 'acquisition' as const
      }
      mockStorageService.loadSkills.mockResolvedValue([acquisitionSkill])

      mockSpacedRepetitionService.checkAutomaticStatusTransitions.mockReturnValue({})

      const result = await skillService.shouldSuggestStatusTransition('skill_1')

      expect(result.shouldSuggest).toBe(false)
    })

    it('should return false when skill not found', async () => {
      const result = await skillService.shouldSuggestStatusTransition('nonexistent')

      expect(result.shouldSuggest).toBe(false)
    })
  })

  describe('updatePracticeNote', () => {
    it('should update practice note', async () => {
      const skillWithPractice = {
        ...mockSkills[0],
        practiceLog: [{ date: '2023-01-01T10:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Old note' }]
      }
      mockStorageService.loadSkills.mockResolvedValue([skillWithPractice])

      await skillService.updatePracticeNote('skill_1', '2023-01-01T10:00:00.000Z', 'Updated note')

      expect(mockStorageService.saveSkills).toHaveBeenCalled()
      const savedSkills = mockStorageService.saveSkills.mock.calls[0][0]
      expect(savedSkills[0].practiceLog[0].note).toBe('Updated note')
    })
  })

  describe('loadAllSkills', () => {
    it('should load all skills from storage', async () => {
      const result = await skillService.loadAllSkills()

      expect(result).toEqual(mockSkills)
      expect(mockStorageService.loadSkills).toHaveBeenCalled()
    })
  })
})