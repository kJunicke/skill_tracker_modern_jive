import { describe, it, expect, beforeEach } from 'vitest'
import { SpacedRepetitionService } from '../core/SpacedRepetitionService'
import type { SkillData } from '@/types/skill'

/**
 * Test for Weekly Mode Double-Bonus Bug Fix
 * Bug Pattern: "State Management: Calculation vs Persistence Bug"
 * 
 * Problem: Good quality (+1) was applied twice:
 * 1. Once in updateSM2Parameters() → interval: 0 + 1 = 1 week
 * 2. Once in calculateWeeklyAcquisitionInterval() → interval: 1 + 1 = 2 weeks
 * Result: New skill goes from "due today" to "due in 2 weeks" after first Good practice
 * 
 * Expected: Good should progress 0 → 1 week, not 0 → 2 weeks
 */
describe('Weekly Mode Double-Bonus Bug Fix', () => {
  let service: SpacedRepetitionService
  let newWeeklySkill: SkillData

  beforeEach(() => {
    service = new SpacedRepetitionService()
    
    // New skill in acquisition mode - should start with interval: 0
    newWeeklySkill = {
      id: 'new_weekly_skill',
      name: 'New Weekly Skill',
      level: 1,
      status: 'acquisition',
      spacedRepetitionMode: 'weekly',
      tags: ['Move'],
      notes: 'New skill test',
      dateCreated: '2023-01-01T00:00:00.000Z',
      dateModified: '2023-01-01T00:00:00.000Z',
      progressionHistory: [],
      practiceLog: [],
      easeFactor: 2.5,
      interval: 0, // NEW SKILL - starts at 0
      repetitions: 0,
      lastPracticed: '2023-01-01' // Sunday
    }
  })

  describe('Bug Reproduction Tests', () => {
    it('should prevent double-application of Good quality bonus (+1)', () => {
      console.log('🔍 Testing Weekly Double-Bonus Bug Fix')
      console.log('📊 Input skill:', { 
        interval: newWeeklySkill.interval, 
        repetitions: newWeeklySkill.repetitions,
        spacedRepetitionMode: newWeeklySkill.spacedRepetitionMode
      })
      
      // Step 1: updateSM2Parameters should calculate interval: 0 + 1 = 1
      const updatedParams = service.updateSM2Parameters(newWeeklySkill, 3) // Good quality
      console.log('📈 After updateSM2Parameters:', { 
        interval: updatedParams.interval,
        repetitions: updatedParams.repetitions
      })
      
      expect(updatedParams.interval).toBe(1) // Should be 1 week, not 2
      expect(updatedParams.repetitions).toBe(1) // Incremented from 0
      
      // Step 2: Create skill with updated parameters
      const updatedSkill = { ...newWeeklySkill, ...updatedParams }
      console.log('🎯 Updated skill for next review calculation:', { 
        interval: updatedSkill.interval,
        repetitions: updatedSkill.repetitions 
      })
      
      // Step 3: calculateNextReview should use the already calculated interval
      const nextReview = service.calculateNextReview(updatedSkill, 3) // Good quality
      console.log('🗓️ Next review date:', nextReview)
      
      // Calculate expected date: 1 week from lastPracticed (2023-01-01 Sunday)
      // Should be next training day after 1 week, not 2 weeks
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference:', daysDifference)
      
      // Should be around 7-14 days (1 week + training schedule), NOT 14-21 days (2 weeks)
      expect(daysDifference).toBeGreaterThanOrEqual(7)
      expect(daysDifference).toBeLessThan(14) // Critical: Should be less than 2 weeks
      expect(reviewDate.getDay()).toBeOneOf([2, 4]) // Tuesday or Thursday training day
    })

    it('should prevent double-application of Very Easy quality bonus (+2)', () => {
      const skill = { ...newWeeklySkill, interval: 1, repetitions: 1 } // After first practice
      
      console.log('🔍 Testing Very Easy (+2) double-bonus prevention')
      console.log('📊 Input skill:', { interval: skill.interval, repetitions: skill.repetitions })
      
      // Step 1: updateSM2Parameters should calculate interval: 1 + 2 = 3
      const updatedParams = service.updateSM2Parameters(skill, 4) // Very Easy quality
      console.log('📈 After updateSM2Parameters:', { 
        interval: updatedParams.interval,
        repetitions: updatedParams.repetitions
      })
      
      expect(updatedParams.interval).toBe(3) // Should be 3 weeks, not 5 (1+2+2)
      expect(updatedParams.repetitions).toBe(2)
      
      // Step 2: Verify next review uses correct interval
      const updatedSkill = { ...skill, ...updatedParams }
      const nextReview = service.calculateNextReview(updatedSkill, 4) // Very Easy quality
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference for Very Easy:', daysDifference)
      
      // Should be around 21 days (3 weeks), NOT 35 days (5 weeks)
      expect(daysDifference).toBeGreaterThanOrEqual(21) // At least 3 weeks
      expect(daysDifference).toBeLessThan(35) // Less than 5 weeks
    })

    it('should handle Could Not Perform reset correctly', () => {
      const skill = { ...newWeeklySkill, interval: 3, repetitions: 2 } // Advanced skill
      
      console.log('🔍 Testing Could Not Perform reset')
      console.log('📊 Input skill:', { interval: skill.interval, repetitions: skill.repetitions })
      
      // Step 1: updateSM2Parameters should reset interval to 1
      const updatedParams = service.updateSM2Parameters(skill, 1) // Could Not Perform
      console.log('📈 After updateSM2Parameters (reset):', { 
        interval: updatedParams.interval,
        repetitions: updatedParams.repetitions
      })
      
      expect(updatedParams.interval).toBe(1) // Should reset to 1 week
      expect(updatedParams.repetitions).toBe(3) // Still incremented
      
      // Step 2: Verify next review uses reset interval
      const updatedSkill = { ...skill, ...updatedParams }
      const nextReview = service.calculateNextReview(updatedSkill, 1) // Could Not Perform
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference for reset:', daysDifference)
      
      // Should be around 7 days (1 week), confirming reset worked
      expect(daysDifference).toBeGreaterThanOrEqual(7) // At least 1 week
      expect(daysDifference).toBeLessThan(14) // Less than 2 weeks
    })
  })

  describe('Consistency with Daily Mode Fix', () => {
    it('should match the same fix pattern as daily mode', () => {
      // This test ensures weekly and daily modes use the same fix pattern
      const dailySkill = { ...newWeeklySkill, spacedRepetitionMode: 'daily' as const }
      const weeklySkill = { ...newWeeklySkill, spacedRepetitionMode: 'weekly' as const }
      
      // Both should increment interval by same amount (+1 for Good quality)
      const dailyUpdated = service.updateSM2Parameters(dailySkill, 3) // Good
      const weeklyUpdated = service.updateSM2Parameters(weeklySkill, 3) // Good
      
      // Both should have same interval progression (0 → 1)
      expect(dailyUpdated.interval).toBe(1) // 1 day
      expect(weeklyUpdated.interval).toBe(1) // 1 week
      expect(dailyUpdated.repetitions).toBe(weeklyUpdated.repetitions)
      
      console.log('✅ Daily and Weekly modes use consistent calculation pattern')
    })
  })
})