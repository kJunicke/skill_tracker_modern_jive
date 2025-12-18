import { describe, it, expect, beforeEach } from 'vitest'
import { SpacedRepetitionService } from '../core/SpacedRepetitionService'
import type { SkillData } from '@/types/skill'

describe('Weekly Spaced Repetition - Display Only Mode', () => {
  let service: SpacedRepetitionService
  let mockWeeklySkill: SkillData

  beforeEach(() => {
    service = new SpacedRepetitionService([2, 4]) // Tuesday, Thursday training
    mockWeeklySkill = {
      id: 'weekly_skill_1',
      name: 'Weekly Test Skill',
      level: 2,
      status: 'acquisition' as const,
      spacedRepetitionMode: 'weekly',
      tags: ['Move'],
      notes: 'Weekly test notes',
      dateCreated: '2023-01-01T00:00:00.000Z',
      dateModified: '2023-01-01T00:00:00.000Z',
      progressionHistory: [],
      practiceLog: [],
      easeFactor: 2.5,
      interval: 2, // 2 days (uses daily algorithm)
      repetitions: 1,
      lastPracticed: '2023-01-01',
      nextReview: '2023-01-03' // Monday - should round to Thursday
    }
  })

  describe('Algorithm - Same as Daily Mode', () => {
    it('should use daily intervals in acquisition mode', () => {
      const skill = { ...mockWeeklySkill, interval: 1, repetitions: 0 }
      const result = service.updateSM2Parameters(skill, 3) // Good quality
      
      expect(result.interval).toBe(2) // 1 + 1 (Good bonus) - daily intervals
      expect(result.repetitions).toBe(1)
    })

    it('should use daily intervals in maintenance mode', () => {
      const skill = { ...mockWeeklySkill, status: 'maintenance' as const, level: 5, interval: 6, repetitions: 2 }
      const result = service.updateSM2Parameters(skill, 3) // Good quality
      
      expect(result.interval).toBe(Math.round(6 * 2.48)) // SM2 with adjusted easeFactor
      expect(result.repetitions).toBe(3)
    })
  })

  describe('Display Rounding - getDisplayNextReview()', () => {
    it('should round Monday nextReview to next training day (Tuesday)', () => {
      const skill = { ...mockWeeklySkill, nextReview: '2023-01-02' } // Monday
      const displayReview = service.getDisplayNextReview(skill)
      
      const reviewDate = new Date(displayReview)
      expect(reviewDate.getDay()).toBe(2) // Tuesday (next training day after Monday)
    })

    it('should keep Thursday nextReview as Thursday (already training day)', () => {
      const skill = { ...mockWeeklySkill, nextReview: '2023-01-05' } // Thursday
      const displayReview = service.getDisplayNextReview(skill)
      
      expect(displayReview).toBe('2023-01-05') // No change needed
    })

    it('should round weekend nextReview to next Tuesday', () => {
      const skill = { ...mockWeeklySkill, nextReview: '2023-01-07' } // Saturday
      const displayReview = service.getDisplayNextReview(skill)
      
      const reviewDate = new Date(displayReview)
      expect(reviewDate.getDay()).toBe(2) // Tuesday (next training day)
    })
  })

  describe('Daily Skills - No Rounding', () => {
    it('should return nextReview unchanged for daily skills', () => {
      const dailySkill = { ...mockWeeklySkill, spacedRepetitionMode: 'daily' as const, nextReview: '2023-01-03' }
      const displayReview = service.getDisplayNextReview(dailySkill)
      
      expect(displayReview).toBe('2023-01-03') // No rounding for daily skills
    })
  })

  describe('Error Handling', () => {
    it('should handle missing nextReview gracefully', () => {
      const skill = { ...mockWeeklySkill, nextReview: undefined }
      const displayReview = service.getDisplayNextReview(skill)
      
      // Should return current date as fallback
      expect(displayReview).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })
})