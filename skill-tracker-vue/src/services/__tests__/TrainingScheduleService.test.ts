import { describe, it, expect, beforeEach } from 'vitest'
import { TrainingScheduleService } from '../core/TrainingScheduleService'

describe('TrainingScheduleService', () => {
  let service: TrainingScheduleService

  beforeEach(() => {
    service = new TrainingScheduleService([2, 4]) // Tuesday, Thursday
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with default training days (Tuesday, Thursday)', () => {
      const defaultService = new TrainingScheduleService()
      expect(defaultService.isTrainingDay(new Date('2023-01-03'))).toBe(true) // Tuesday
      expect(defaultService.isTrainingDay(new Date('2023-01-05'))).toBe(true) // Thursday
      expect(defaultService.isTrainingDay(new Date('2023-01-04'))).toBe(false) // Wednesday
    })

    it('should initialize with custom training days', () => {
      const customService = new TrainingScheduleService([1, 3, 5]) // Monday, Wednesday, Friday
      expect(customService.isTrainingDay(new Date('2023-01-02'))).toBe(true) // Monday
      expect(customService.isTrainingDay(new Date('2023-01-04'))).toBe(true) // Wednesday
      expect(customService.isTrainingDay(new Date('2023-01-06'))).toBe(true) // Friday
      expect(customService.isTrainingDay(new Date('2023-01-03'))).toBe(false) // Tuesday
    })

    it('should sort training days automatically', () => {
      const service = new TrainingScheduleService([5, 1, 3]) // Friday, Monday, Wednesday
      expect(service.isTrainingDay(new Date('2023-01-02'))).toBe(true) // Monday
      expect(service.isTrainingDay(new Date('2023-01-04'))).toBe(true) // Wednesday
      expect(service.isTrainingDay(new Date('2023-01-06'))).toBe(true) // Friday
    })
  })

  describe('setTrainingDays', () => {
    it('should update training days successfully', () => {
      service.setTrainingDays([1, 3, 5]) // Monday, Wednesday, Friday
      
      expect(service.isTrainingDay(new Date('2023-01-02'))).toBe(true) // Monday
      expect(service.isTrainingDay(new Date('2023-01-04'))).toBe(true) // Wednesday
      expect(service.isTrainingDay(new Date('2023-01-06'))).toBe(true) // Friday
      expect(service.isTrainingDay(new Date('2023-01-03'))).toBe(false) // Tuesday
    })

    it('should throw error when no training days provided', () => {
      expect(() => service.setTrainingDays([])).toThrow('At least one training day must be selected')
    })

    it('should sort training days when updating', () => {
      service.setTrainingDays([6, 0, 3]) // Saturday, Sunday, Wednesday
      
      expect(service.isTrainingDay(new Date('2023-01-01'))).toBe(true) // Sunday
      expect(service.isTrainingDay(new Date('2023-01-04'))).toBe(true) // Wednesday  
      expect(service.isTrainingDay(new Date('2023-01-07'))).toBe(true) // Saturday
    })
  })

  describe('isTrainingDay', () => {
    it('should correctly identify training days from Date object', () => {
      expect(service.isTrainingDay(new Date('2023-01-03'))).toBe(true) // Tuesday
      expect(service.isTrainingDay(new Date('2023-01-05'))).toBe(true) // Thursday
      expect(service.isTrainingDay(new Date('2023-01-04'))).toBe(false) // Wednesday
      expect(service.isTrainingDay(new Date('2023-01-06'))).toBe(false) // Friday
    })

    it('should correctly identify training days from string date', () => {
      expect(service.isTrainingDay('2023-01-03')).toBe(true) // Tuesday
      expect(service.isTrainingDay('2023-01-05')).toBe(true) // Thursday
      expect(service.isTrainingDay('2023-01-04')).toBe(false) // Wednesday
      expect(service.isTrainingDay('2023-01-06')).toBe(false) // Friday
    })

    it('should handle different date formats', () => {
      expect(service.isTrainingDay('2023-01-03T10:30:00Z')).toBe(true) // Tuesday with time
      expect(service.isTrainingDay('2023-01-03T00:00:00.000Z')).toBe(true) // Tuesday ISO format
    })
  })

  describe('getNextTrainingDate', () => {
    it('should return next Tuesday when called from Sunday', () => {
      const nextTraining = service.getNextTrainingDate('2023-01-01') // Sunday
      expect(nextTraining).toBe('2023-01-03') // Next Tuesday
    })

    it('should return next Thursday when called from Tuesday', () => {
      const nextTraining = service.getNextTrainingDate('2023-01-03') // Tuesday
      expect(nextTraining).toBe('2023-01-05') // Next Thursday
    })

    it('should return next Tuesday when called from Thursday', () => {
      const nextTraining = service.getNextTrainingDate('2023-01-05') // Thursday
      expect(nextTraining).toBe('2023-01-10') // Next Tuesday
    })

    it('should return next training day when called from non-training day', () => {
      const nextTraining = service.getNextTrainingDate('2023-01-04') // Wednesday
      expect(nextTraining).toBe('2023-01-05') // Next Thursday
    })

    it('should handle Date object input', () => {
      const nextTraining = service.getNextTrainingDate(new Date('2023-01-01')) // Sunday
      expect(nextTraining).toBe('2023-01-03') // Next Tuesday
    })

    it('should use current date when no parameter provided', () => {
      // Mock current date to be testable
      const nextTraining = service.getNextTrainingDate()
      expect(nextTraining).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Should be YYYY-MM-DD format
    })

    it('should work across month boundaries', () => {
      const nextTraining = service.getNextTrainingDate('2023-01-31') // Tuesday (end of month)
      expect(nextTraining).toBe('2023-02-02') // Next Thursday (next month)
    })

    it('should work across year boundaries', () => {
      const nextTraining = service.getNextTrainingDate('2023-12-31') // Sunday (end of year)
      expect(nextTraining).toBe('2024-01-02') // Next Tuesday (next year)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle single training day per week', () => {
      const singleDayService = new TrainingScheduleService([2]) // Only Tuesday
      
      expect(singleDayService.isTrainingDay('2023-01-03')).toBe(true) // Tuesday
      expect(singleDayService.isTrainingDay('2023-01-05')).toBe(false) // Thursday
      
      const nextTraining = singleDayService.getNextTrainingDate('2023-01-01') // Sunday
      expect(nextTraining).toBe('2023-01-03') // Next Tuesday
    })

    it('should handle daily training (all 7 days)', () => {
      const dailyService = new TrainingScheduleService([0, 1, 2, 3, 4, 5, 6]) // Every day
      
      for (let i = 0; i <= 6; i++) {
        const date = new Date('2023-01-01')
        date.setDate(date.getDate() + i)
        expect(dailyService.isTrainingDay(date)).toBe(true)
      }
    })

    it('should handle weekend-only training', () => {
      const weekendService = new TrainingScheduleService([0, 6]) // Sunday, Saturday
      
      expect(weekendService.isTrainingDay('2023-01-01')).toBe(true) // Sunday
      expect(weekendService.isTrainingDay('2023-01-07')).toBe(true) // Saturday
      expect(weekendService.isTrainingDay('2023-01-03')).toBe(false) // Tuesday
    })

    it('should throw error when no training day found (should not happen with valid setup)', () => {
      // This scenario should not occur with proper implementation
      // but we test the error handling path
      const emptyService = new TrainingScheduleService([])
      expect(() => emptyService.setTrainingDays([])).toThrow()
    })

    it('should handle duplicate training days', () => {
      const duplicateService = new TrainingScheduleService([2, 2, 4, 4]) // Duplicates
      
      expect(duplicateService.isTrainingDay('2023-01-03')).toBe(true) // Tuesday
      expect(duplicateService.isTrainingDay('2023-01-05')).toBe(true) // Thursday
    })
  })

  describe('Real-world Training Schedules', () => {
    it('should handle typical beginner schedule (2x per week)', () => {
      const beginnerService = new TrainingScheduleService([2, 5]) // Tuesday, Friday
      
      expect(beginnerService.isTrainingDay('2023-01-03')).toBe(true) // Tuesday
      expect(beginnerService.isTrainingDay('2023-01-06')).toBe(true) // Friday
      
      const nextFromMonday = beginnerService.getNextTrainingDate('2023-01-02') // Monday
      expect(nextFromMonday).toBe('2023-01-03') // Tuesday
    })

    it('should handle intensive schedule (3x per week)', () => {
      const intensiveService = new TrainingScheduleService([1, 3, 5]) // Monday, Wednesday, Friday
      
      expect(intensiveService.isTrainingDay('2023-01-02')).toBe(true) // Monday
      expect(intensiveService.isTrainingDay('2023-01-04')).toBe(true) // Wednesday
      expect(intensiveService.isTrainingDay('2023-01-06')).toBe(true) // Friday
      
      const nextFromWednesday = intensiveService.getNextTrainingDate('2023-01-04') // Wednesday
      expect(nextFromWednesday).toBe('2023-01-06') // Friday
    })

    it('should handle workshop schedule (weekends only)', () => {
      const workshopService = new TrainingScheduleService([6, 0]) // Saturday, Sunday
      
      expect(workshopService.isTrainingDay('2023-01-07')).toBe(true) // Saturday
      expect(workshopService.isTrainingDay('2023-01-08')).toBe(true) // Sunday
      
      const nextFromFriday = workshopService.getNextTrainingDate('2023-01-06') // Friday
      expect(nextFromFriday).toBe('2023-01-07') // Saturday
    })
  })
})