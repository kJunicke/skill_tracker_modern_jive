import { describe, it, expect, beforeEach } from 'vitest'
import { SpacedRepetitionService } from '../core/SpacedRepetitionService'
import type { SkillData } from '@/types/skill'
import { calculateTargetXP } from '@/utils/focusDataHelpers'

describe('SpacedRepetitionService', () => {
  let service: SpacedRepetitionService
  let mockSkill: SkillData

  beforeEach(() => {
    service = new SpacedRepetitionService()
    mockSkill = {
      id: 'skill_1',
      name: 'Test Skill',
      level: 5, // Changed to level 5 for maintenance status
      status: 'maintenance', // Changed to maintenance for SM2 testing
      tags: ['Move'],
      notes: 'Test notes',
      dateCreated: '2023-01-01T00:00:00.000Z',
      dateModified: '2023-01-01T00:00:00.000Z',
      progressionHistory: [],
      practiceLog: [],
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      lastPracticed: '2023-01-01T00:00:00.000Z'
    }
  })

  describe('calculateTargetXP', () => {
    it('should calculate correct target XP for different levels', () => {
      expect(service.calculateTargetXP(1)).toBe(6) // Math.floor(3*2 + 1/3) = 6
      expect(service.calculateTargetXP(2)).toBe(6) // Math.floor(3*2 + 2/3) = 6
      expect(service.calculateTargetXP(3)).toBe(7) // Math.floor(3*2 + 3/3) = 7
      expect(service.calculateTargetXP(5)).toBe(7) // Math.floor(3*2 + 5/3) = 7
    })
  })

  describe('updateSM2Parameters', () => {
    describe('acquisition mode', () => {
      it('should update interval cumulatively for Good quality', () => {
        const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, level: 2, interval: 3 }
        const result = service.updateSM2Parameters(acquisitionSkill, 3) // Good = +1
        
        expect(result.interval).toBe(4) // 3 + 1
        expect(result.repetitions).toBe(1)
      })

      it('should update interval cumulatively for Very Easy quality', () => {
        const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, level: 2, interval: 2 }
        const result = service.updateSM2Parameters(acquisitionSkill, 4) // Very Easy = +2
        
        expect(result.interval).toBe(4) // 2 + 2
        expect(result.repetitions).toBe(1)
      })

      it('should keep same interval for Hard quality', () => {
        const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, level: 2, interval: 3 }
        const result = service.updateSM2Parameters(acquisitionSkill, 2) // Hard = +0
        
        expect(result.interval).toBe(3) // 3 + 0
        expect(result.repetitions).toBe(1)
      })

      it('should reset interval to 1 for Could Not Perform', () => {
        const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, level: 2, interval: 5 }
        const result = service.updateSM2Parameters(acquisitionSkill, 1) // Could Not Perform = reset
        
        expect(result.interval).toBe(1) // Reset to 1
        expect(result.repetitions).toBe(1)
      })

      it('should ensure minimum interval of 1 day', () => {
        const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, level: 2, interval: 1 }
        const result = service.updateSM2Parameters(acquisitionSkill, 2) // Hard = +0
        
        expect(result.interval).toBe(1) // Min 1 day
        expect(result.repetitions).toBe(1)
      })
    })

    describe('maintenance mode', () => {
    it('should increase ease factor for very easy (quality 4)', () => {
      const result = service.updateSM2Parameters(mockSkill, 4)
      
      expect(result.easeFactor).toBe(2.6) // 2.5 + 0.1
      expect(result.repetitions).toBe(1)
      expect(result.interval).toBe(1)
      expect(result.nextReview).toBeTruthy()
    })

    it('should apply slight penalty for good (quality 3)', () => {
      const result = service.updateSM2Parameters(mockSkill, 3)
      
      expect(result.easeFactor).toBe(2.48) // 2.5 - 0.02
      expect(result.repetitions).toBe(1)
      expect(result.interval).toBe(1)
    })

    it('should decrease ease factor for hard (quality 2)', () => {
      const result = service.updateSM2Parameters(mockSkill, 2)
      
      expect(result.easeFactor).toBe(2.35) // 2.5 - 0.15
      expect(result.repetitions).toBe(0) // Reset on failure
      expect(result.interval).toBe(1) // Reset on failure
    })

    it('should reset parameters for forgotten (quality 1)', () => {
      const result = service.updateSM2Parameters(mockSkill, 1)
      
      expect(result.easeFactor).toBe(2.35) // 2.5 - 0.15
      expect(result.repetitions).toBe(0) // Reset on failure
      expect(result.interval).toBe(1) // Reset on failure
    })

    it('should respect ease factor limits', () => {
      // Test maximum ease factor
      const highEaseSkill = { ...mockSkill, easeFactor: 2.95 }
      const maxResult = service.updateSM2Parameters(highEaseSkill, 4)
      expect(maxResult.easeFactor).toBe(3.0) // Capped at maximum

      // Test minimum ease factor
      const lowEaseSkill = { ...mockSkill, easeFactor: 1.4 }
      const minResult = service.updateSM2Parameters(lowEaseSkill, 1)
      expect(minResult.easeFactor).toBe(1.3) // Capped at minimum
    })

    it('should calculate intervals correctly for repeated successes', () => {
      // First successful repetition
      const firstSuccess = service.updateSM2Parameters(mockSkill, 3)
      expect(firstSuccess.repetitions).toBe(1)
      expect(firstSuccess.interval).toBe(1)

      // Second successful repetition
      const skillAfterFirst = { ...mockSkill, repetitions: 1, interval: 1, easeFactor: firstSuccess.easeFactor }
      const secondSuccess = service.updateSM2Parameters(skillAfterFirst, 3)
      expect(secondSuccess.repetitions).toBe(2)
      expect(secondSuccess.interval).toBe(6)

      // Third successful repetition
      const skillAfterSecond = { ...mockSkill, repetitions: 2, interval: 6, easeFactor: secondSuccess.easeFactor }
      const thirdSuccess = service.updateSM2Parameters(skillAfterSecond, 3)
      expect(thirdSuccess.repetitions).toBe(3)
      expect(thirdSuccess.interval).toBeCloseTo(Math.round(6 * secondSuccess.easeFactor))
    })
    })
  })

  describe('calculateNextReview - acquisition cumulative intervals', () => {
    it('should calculate next review with cumulative Good bonus', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        status: 'acquisition' as const, 
        level: 2, 
        interval: 3,
        lastPracticed: '2023-01-01T00:00:00.000Z'
      }
      
      const result = service.calculateNextReview(acquisitionSkill, 3) // Good = +1
      expect(result).toBe('2023-01-05T00:00:00.000Z') // 4 days later (3+1)
    })

    it('should calculate next review with cumulative Very Easy bonus', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        status: 'acquisition' as const, 
        level: 2, 
        interval: 2,
        lastPracticed: '2023-01-01T00:00:00.000Z'
      }
      
      const result = service.calculateNextReview(acquisitionSkill, 4) // Very Easy = +2
      expect(result).toBe('2023-01-05T00:00:00.000Z') // 4 days later (2+2)
    })

    it('should calculate next review with reset for Could Not Perform', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        status: 'acquisition' as const, 
        level: 2, 
        interval: 7,
        lastPracticed: '2023-01-01T00:00:00.000Z'
      }
      
      const result = service.calculateNextReview(acquisitionSkill, 1) // Could Not Perform = reset to 1
      expect(result).toBe('2023-01-02T00:00:00.000Z') // 1 day later (reset)
    })

    it('should calculate next review with no change for Hard', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        status: 'acquisition' as const, 
        level: 2, 
        interval: 3,
        lastPracticed: '2023-01-01T00:00:00.000Z'
      }
      
      const result = service.calculateNextReview(acquisitionSkill, 2) // Hard = +0
      expect(result).toBe('2023-01-04T00:00:00.000Z') // 3 days later (no change)
    })
  })

  describe('calculateNextReview', () => {
    it('should return far future date for archived skills', () => {
      const archivedSkill = { ...mockSkill, status: 'archived' as const }
      const result = service.calculateNextReview(archivedSkill, 2)
      
      const nextReview = new Date(result)
      const now = new Date()
      const daysDifference = (nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      
      expect(daysDifference).toBeGreaterThan(3600) // More than 10 years
    })

    it('should use status-specific interval logic', () => {
      const baseDate = new Date('2023-01-01T00:00:00.000Z')
      
      // Acquisition uses cumulative intervals based on quality
      const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const, repetitions: 0, interval: 1 }
      const acquisitionResult = service.calculateNextReview(acquisitionSkill, 3) // Good = +1 day
      expect(new Date(acquisitionResult).getDate()).toBe(baseDate.getDate() + 2) // 1 + 1 = 2 days

      // Maintenance uses SM2 interval directly
      const maintenanceSkill = { ...mockSkill, status: 'maintenance' as const, interval: 7 }
      const maintenanceResult = service.calculateNextReview(maintenanceSkill, 3)
      expect(new Date(maintenanceResult).getDate()).toBe(baseDate.getDate() + 7)
    })

    it('should handle focus mode daily suggestions', () => {
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 1,
          consecutiveGoodSessions: 0,
          currentXP: 0,
          targetXP: calculateTargetXP(1),
          lastQuality: null,
          readyForLevelUp: false
        }
      }

      // Focus mode always suggests daily practice regardless of quality
      const forgottenResult = service.calculateNextReview(focusSkill, 1)
      const hardResult = service.calculateNextReview(focusSkill, 2)
      const goodResult = service.calculateNextReview(focusSkill, 3)
      const excellentResult = service.calculateNextReview(focusSkill, 4)

      // All should return tomorrow's date (daily suggestions)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const expectedTomorrow = tomorrow.toISOString().split('T')[0]
      
      expect(new Date(forgottenResult).toISOString().split('T')[0]).toBe(expectedTomorrow)
      expect(new Date(hardResult).toISOString().split('T')[0]).toBe(expectedTomorrow)
      expect(new Date(goodResult).toISOString().split('T')[0]).toBe(expectedTomorrow)
      expect(new Date(excellentResult).toISOString().split('T')[0]).toBe(expectedTomorrow)
    })
  })

  describe('handleFocusProgression', () => {
    it('should initialize focus data if not present', () => {
      const skillWithoutFocus = { ...mockSkill, status: 'focus' as const }
      delete (skillWithoutFocus as unknown as { focusData?: unknown }).focusData

      const result = service.handleFocusProgression(skillWithoutFocus, 3) // Good quality = 3 in 1-4 scale
      
      expect(result.focusData.totalSessions).toBe(1)
      expect(result.focusData.currentXP).toBe(2) // Good quality = 2 XP
      expect(result.focusData.lastQuality).toBe(3)
      expect(result.focusData.readyForLevelUp).toBe(false)
    })

    it('should update XP correctly based on quality', () => {
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 2,
          consecutiveGoodSessions: 1,
          currentXP: 5,
          targetXP: calculateTargetXP(5), // Updated for level 5
          lastQuality: 3,
          readyForLevelUp: false
        }
      }

      // Test different quality XP rewards (1-4 scale)
      const forgottenResult = service.handleFocusProgression(focusSkill, 1) // 0 XP
      expect(forgottenResult.focusData.currentXP).toBe(5) // 5 + 0 = 5

      const hardResult = service.handleFocusProgression(focusSkill, 2) // 1 XP
      expect(hardResult.focusData.currentXP).toBe(6) // 5 + 1 = 6

      const goodResult = service.handleFocusProgression(focusSkill, 3) // 2 XP
      expect(goodResult.focusData.currentXP).toBe(7) // 5 + 2 = 7

      const excellentResult = service.handleFocusProgression(focusSkill, 4) // 3 XP
      expect(excellentResult.focusData.currentXP).toBe(8) // 5 + 3 = 8
    })

    it('should mark ready for level up at 75% of target XP', () => {
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 10,
          consecutiveGoodSessions: 5,
          currentXP: 5, // Just below 75% of 7 (5.25)
          targetXP: calculateTargetXP(5), // Level 5 target XP
          lastQuality: 3,
          readyForLevelUp: false
        }
      }

      const result = service.handleFocusProgression(focusSkill, 3) // +2 XP = 7 total
      expect(result.focusData.currentXP).toBe(7)
      expect(result.focusData.readyForLevelUp).toBe(true) // 7 >= 6 (75% of 7 = 5.25, rounded up to 6)
    })

    it('should increment total sessions', () => {
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 5,
          consecutiveGoodSessions: 2,
          currentXP: 3,
          targetXP: calculateTargetXP(5),
          lastQuality: 3,
          readyForLevelUp: false
        }
      }

      const result = service.handleFocusProgression(focusSkill, 3)
      expect(result.focusData.totalSessions).toBe(6)
    })
  })

  describe('getDaysUntilReview', () => {
    it('should return 0 for skills without next review', () => {
      const skillWithoutReview = { ...mockSkill }
      delete (skillWithoutReview as unknown as { nextReview?: string }).nextReview

      const result = service.getDaysUntilReview(skillWithoutReview)
      expect(result).toBe(0)
    })

    it('should calculate days correctly', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const skillWithReview = { 
        ...mockSkill, 
        nextReview: tomorrow.toISOString()
      }

      const result = service.getDaysUntilReview(skillWithReview)
      expect(result).toBe(1)
    })
  })

  describe('resetFocusDataForLevelUp', () => {
    it('should reset focus data for focus skills', () => {
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 15,
          consecutiveGoodSessions: 8,
          currentXP: 5,
          targetXP: calculateTargetXP(1),
          lastQuality: 3,
          readyForLevelUp: true
        }
      }

      const result = service.resetFocusDataForLevelUp(focusSkill, 4)
      
      expect(result).toEqual({
        focusData: {
          totalSessions: 15, // Preserved
          consecutiveGoodSessions: 8, // Preserved
          currentXP: 0, // Reset
          targetXP: calculateTargetXP(4), // New target for level 4
          lastQuality: 3, // Preserved
          readyForLevelUp: false // Reset
        }
      })
    })

    it('should return empty object for non-focus skills', () => {
      const nonFocusSkill = { ...mockSkill, status: 'acquisition' as const }
      const result = service.resetFocusDataForLevelUp(nonFocusSkill, 4)
      
      expect(result).toEqual({})
    })

    it('should return empty object for focus skills without focus data', () => {
      const focusSkillWithoutData = { ...mockSkill, status: 'focus' as const }
      delete (focusSkillWithoutData as unknown as { focusData?: unknown }).focusData

      const result = service.resetFocusDataForLevelUp(focusSkillWithoutData, 4)
      expect(result).toEqual({})
    })
  })

  describe('checkAutomaticStatusTransitions', () => {
    it('should transition acquisition to maintenance at level 5', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        level: 5, 
        status: 'acquisition' as const 
      }
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkill)
      
      expect(result.status).toBe('maintenance')
    })

    it('should initialize ease factor for smooth interval transition', () => {
      const acquisitionSkillWithLargeInterval = { 
        ...mockSkill, 
        level: 5, 
        status: 'acquisition' as const,
        interval: 12 // Large interval from acquisition
        // easeFactor will be default 2.5 from mockSkill
      }
      // Remove easeFactor to test initialization
      delete (acquisitionSkillWithLargeInterval as Partial<SkillData>).easeFactor
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkillWithLargeInterval)
      
      expect(result.status).toBe('maintenance')
      expect(result.easeFactor).toBe(2.0) // 12/6 = 2.0 (minimum to maintain interval)
      expect(result.repetitions).toBe(2) // Set to use ease factor formula
      expect(result.interval).toBe(12) // Preserve current interval
    })

    it('should respect SM2 ease factor boundaries', () => {
      const acquisitionSkillWithSmallInterval = { 
        ...mockSkill, 
        level: 5, 
        status: 'acquisition' as const,
        interval: 3 // Small interval
      }
      // Remove easeFactor to test initialization
      delete (acquisitionSkillWithSmallInterval as Partial<SkillData>).easeFactor
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkillWithSmallInterval)
      
      expect(result.status).toBe('maintenance')
      // 3/6 = 0.5, but minimum is 1.3
      expect(result.easeFactor).toBe(1.3) 
      expect(result.repetitions).toBe(2)
      expect(result.interval).toBe(3)
    })

    it('should handle very large intervals within max ease factor', () => {
      const acquisitionSkillWithHugeInterval = { 
        ...mockSkill, 
        level: 5, 
        status: 'acquisition' as const,
        interval: 25 // Very large interval
      }
      // Remove easeFactor to test initialization
      delete (acquisitionSkillWithHugeInterval as Partial<SkillData>).easeFactor
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkillWithHugeInterval)
      
      expect(result.status).toBe('maintenance')
      // 25/6 = 4.17, but maximum is 3.0
      expect(result.easeFactor).toBe(3.0) 
      expect(result.repetitions).toBe(2)
      expect(result.interval).toBe(25)
    })

    it('should not downgrade existing higher ease factor', () => {
      const acquisitionSkillWithHighEaseFactor = { 
        ...mockSkill, 
        level: 5, 
        status: 'acquisition' as const,
        interval: 6,
        easeFactor: 2.8 // Already high ease factor
      }
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkillWithHighEaseFactor)
      
      expect(result.status).toBe('maintenance')
      expect(result.easeFactor).toBeUndefined() // Don't downgrade from 2.8 to 1.0
      expect(result.repetitions).toBe(2)
      expect(result.interval).toBe(6)
    })

    it('should not transition acquisition below level 5', () => {
      const acquisitionSkill = { 
        ...mockSkill, 
        level: 4, 
        status: 'acquisition' as const 
      }
      
      const result = service.checkAutomaticStatusTransitions(acquisitionSkill)
      
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should transition focus to maintenance after 7 days without practice', () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const focusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        lastPracticed: sevenDaysAgo.toISOString(),
        nextReview: '2023-01-15T00:00:00.000Z'
      }
      
      const result = service.checkAutomaticStatusTransitions(focusSkill)
      
      expect(result.status).toBe('maintenance')
      expect(result.nextReview).toBe('2023-01-15T00:00:00.000Z')
    })
  })

  describe('shouldSuggestLevelUp', () => {
    it('should suggest level-up for acquisition with good quality', () => {
      const acquisitionSkill = { ...mockSkill, status: 'acquisition' as const }
      
      expect(service.shouldSuggestLevelUp(acquisitionSkill, 3)).toBe(true) // Good
      expect(service.shouldSuggestLevelUp(acquisitionSkill, 4)).toBe(true) // Very Easy
      expect(service.shouldSuggestLevelUp(acquisitionSkill, 2)).toBe(false) // Hard
      expect(service.shouldSuggestLevelUp(acquisitionSkill, 1)).toBe(false) // Forgotten
    })

    it('should not suggest level-up for maintenance skills', () => {
      const maintenanceSkill = { ...mockSkill, status: 'maintenance' as const }
      
      expect(service.shouldSuggestLevelUp(maintenanceSkill, 4)).toBe(false)
    })

    it('should suggest level-up for focus skills when ready', () => {
      const readyFocusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 5,
          consecutiveGoodSessions: 3,
          currentXP: 6,
          targetXP: calculateTargetXP(5),
          lastQuality: 3,
          readyForLevelUp: true
        }
      }
      
      const notReadyFocusSkill = { 
        ...mockSkill, 
        status: 'focus' as const,
        focusData: {
          totalSessions: 5,
          consecutiveGoodSessions: 3,
          currentXP: 4,
          targetXP: calculateTargetXP(5),
          lastQuality: 3,
          readyForLevelUp: false
        }
      }
      
      expect(service.shouldSuggestLevelUp(readyFocusSkill, 3)).toBe(true)
      expect(service.shouldSuggestLevelUp(notReadyFocusSkill, 3)).toBe(false)
    })
  })
})