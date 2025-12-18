import { describe, it, expect, beforeEach } from 'vitest'
import { SpacedRepetitionService } from '../core/SpacedRepetitionService'
import type { SkillData } from '@/types/skill'

describe('Weekly Mode Display-Only Approach', () => {
  let service: SpacedRepetitionService
  let newWeeklySkill: SkillData

  beforeEach(() => {
    service = new SpacedRepetitionService([2, 4]) // Tuesday, Thursday training days
    newWeeklySkill = {
      id: 'weekly_test_1',
      name: 'Test Weekly Skill',
      level: 1,
      status: 'acquisition',
      spacedRepetitionMode: 'weekly',
      tags: ['Move'],
      notes: '',
      dateCreated: '2023-01-01T00:00:00.000Z',
      dateModified: '2023-01-01T00:00:00.000Z',
      progressionHistory: [],
      practiceLog: [],
      easeFactor: 2.5,
      interval: 0, // New skill starts at 0
      repetitions: 0,
      lastPracticed: '2023-01-01', // Sunday
      nextReview: '2023-01-01'
    }
  })

  describe('Algorithm Uses Daily Intervals', () => {
    it('should use daily intervals for Good quality (+1 day)', () => {
      console.log('🔍 Testing Weekly Display-Only Approach')
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
      
      expect(updatedParams.interval).toBe(1) // Should be 1 day, not 1 week
      expect(updatedParams.repetitions).toBe(1) // Incremented from 0
      
      // Step 2: Create skill with updated parameters
      const updatedSkill = { ...newWeeklySkill, ...updatedParams }
      console.log('🎯 Updated skill for next review calculation:', { 
        interval: updatedSkill.interval,
        repetitions: updatedSkill.repetitions 
      })
      
      // Step 3: calculateNextReview should use the already calculated interval
      const nextReview = service.calculateNextReview(updatedSkill)
      console.log('🗓️ Next review date:', nextReview)
      
      // With simplified approach: uses daily intervals (1 day for Good quality)
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference:', daysDifference)
      
      // Fixed: Uses daily intervals (1 day), no more weekly multiplication
      expect(daysDifference).toBe(1) // Exactly 1 day with simplified approach
    })

    it('should use daily intervals for Very Easy quality (+2 days)', () => {
      const skill = { ...newWeeklySkill, interval: 1, repetitions: 1 } // After first practice
      
      console.log('🔍 Testing Very Easy (+2) daily intervals')
      console.log('📊 Input skill:', { interval: skill.interval, repetitions: skill.repetitions })
      
      const updatedParams = service.updateSM2Parameters(skill, 4) // Very Easy quality
      console.log('📈 After updateSM2Parameters:', { 
        interval: updatedParams.interval, 
        repetitions: updatedParams.repetitions 
      })
      
      expect(updatedParams.interval).toBe(3) // 1 + 2 (Very Easy bonus) = 3 days
      expect(updatedParams.repetitions).toBe(2)
      
      const nextReview = service.calculateNextReview({ ...skill, ...updatedParams })
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference for Very Easy:', daysDifference)
      
      // Fixed: Uses daily intervals (3 days), no more weekly multiplication
      expect(daysDifference).toBe(3) // Exactly 3 days with simplified approach
    })

    it('should handle Could Not Perform reset correctly', () => {
      const skill = { ...newWeeklySkill, interval: 3, repetitions: 2 } // Advanced skill
      
      console.log('🔍 Testing Could Not Perform reset')
      console.log('📊 Input skill:', { interval: skill.interval, repetitions: skill.repetitions })
      
      const updatedParams = service.updateSM2Parameters(skill, 1) // Could Not Perform
      console.log('📈 After updateSM2Parameters (reset):', { 
        interval: updatedParams.interval, 
        repetitions: updatedParams.repetitions 
      })
      
      expect(updatedParams.interval).toBe(1) // Reset to 1 day
      expect(updatedParams.repetitions).toBe(3) // Incremented (acquisition mode)
      
      const nextReview = service.calculateNextReview({ ...skill, ...updatedParams })
      const reviewDate = new Date(nextReview)
      const lastPracticedDate = new Date('2023-01-01')
      const daysDifference = Math.floor((reviewDate.getTime() - lastPracticedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log('📏 Days difference for reset:', daysDifference)
      
      // Fixed: Reset to 1 day interval, no more weekly multiplication
      expect(daysDifference).toBe(1) // Exactly 1 day with simplified approach
    })
  })

  describe('Display Rounding Works Separately', () => {
    it('should round daily intervals to training days for display only', () => {
      const skill = { 
        ...newWeeklySkill, 
        nextReview: '2023-01-03' // Monday - not a training day
      }
      
      const displayReview = service.getDisplayNextReview(skill)
      const displayDate = new Date(displayReview)
      
      // Should round to next training day (Tuesday)
      expect(displayDate.getDay()).toBe(2) // Tuesday (next training day after Monday)
      
      // But original nextReview stays unchanged
      expect(skill.nextReview).toBe('2023-01-03') // Still Monday
    })
  })

  describe('Consistency with Daily Mode', () => {
    it('should use the same algorithm as daily mode', () => {
      const weeklySkill = { ...newWeeklySkill, spacedRepetitionMode: 'weekly' as const }
      const dailySkill = { ...newWeeklySkill, spacedRepetitionMode: 'daily' as const }
      
      const weeklyResult = service.updateSM2Parameters(weeklySkill, 3)
      const dailyResult = service.updateSM2Parameters(dailySkill, 3)
      
      // Should have identical algorithm results
      expect(weeklyResult.interval).toBe(dailyResult.interval)
      expect(weeklyResult.repetitions).toBe(dailyResult.repetitions)
      expect(weeklyResult.easeFactor).toBe(dailyResult.easeFactor)
      
      console.log('✅ Daily and Weekly modes use consistent calculation pattern')
    })
  })
})