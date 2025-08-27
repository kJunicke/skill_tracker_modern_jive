import { dateUtils } from '@/utils/dateHelpers'

/**
 * Service for handling training schedule calculations for weekly spaced repetition
 */
export class TrainingScheduleService {
  private trainingDays: number[]

  constructor(trainingDays: number[] = [2, 4]) { // Default: Tuesday, Thursday
    this.trainingDays = [...trainingDays].sort((a, b) => a - b)
  }

  /**
   * Update training days
   */
  setTrainingDays(days: number[]): void {
    if (days.length === 0) {
      throw new Error('At least one training day must be selected')
    }
    this.trainingDays = [...days].sort((a, b) => a - b)
  }

  /**
   * Check if a given date is a training day
   */
  isTrainingDay(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return this.trainingDays.includes(dateObj.getDay())
  }

  /**
   * Get the next training date from a given date
   */
  getNextTrainingDate(fromDate: string | Date = dateUtils.now()): string {
    const startDate = typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate)
    const nextDate = new Date(startDate)
    
    // Start from the next day
    nextDate.setDate(startDate.getDate() + 1)
    
    // Find the next training day within 7 days
    for (let i = 0; i < 7; i++) {
      if (this.isTrainingDay(nextDate)) {
        return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
      }
      nextDate.setDate(nextDate.getDate() + 1)
    }
    
    // Fallback: should not happen with valid training days
    throw new Error('No training day found within next week')
  }

  /**
   * Get the previous training date from a given date
   */
  getPreviousTrainingDate(fromDate: string | Date = dateUtils.now()): string {
    const startDate = typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate)
    const prevDate = new Date(startDate)
    
    // Start from the previous day
    prevDate.setDate(startDate.getDate() - 1)
    
    // Find the previous training day within 7 days
    for (let i = 0; i < 7; i++) {
      if (this.isTrainingDay(prevDate)) {
        return prevDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
      }
      prevDate.setDate(prevDate.getDate() - 1)
    }
    
    // Fallback: should not happen with valid training days
    throw new Error('No training day found within previous week')
  }

  /**
   * Add weeks to a date and round to the next training day
   */
  addWeeksToTrainingDate(fromDate: string | Date, weeks: number): string {
    const startDate = typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate)
    const targetDate = new Date(startDate)
    
    // Add weeks
    targetDate.setDate(startDate.getDate() + (weeks * 7))
    
    // If the target date is already a training day, use it
    if (this.isTrainingDay(targetDate)) {
      return targetDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
    }
    
    // Otherwise, find the next training day from the target date
    return this.getNextTrainingDate(targetDate)
  }

  /**
   * Calculate the number of training sessions between two dates
   */
  getTrainingSessionsBetween(startDate: string | Date, endDate: string | Date): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate)
    const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate)
    
    if (start >= end) {
      return 0
    }
    
    let count = 0
    const current = new Date(start)
    
    while (current < end) {
      if (this.isTrainingDay(current)) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return count
  }

  /**
   * Get days until next training day from today
   */
  getDaysUntilNextTraining(fromDate: string | Date = dateUtils.now()): number {
    const nextTrainingDate = this.getNextTrainingDate(fromDate)
    const fromDateStr = typeof fromDate === 'string' ? fromDate : fromDate.toISOString().split('T')[0]
    return dateUtils.daysBetween(fromDateStr, nextTrainingDate)
  }

  /**
   * Get training frequency (sessions per week)
   */
  getFrequency(): number {
    return this.trainingDays.length
  }

  /**
   * Get training day names for display
   */
  getTrainingDayNames(): string[] {
    const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    return this.trainingDays.map(day => dayNames[day])
  }

  /**
   * Create a copy of the service with different training days
   */
  withTrainingDays(days: number[]): TrainingScheduleService {
    return new TrainingScheduleService(days)
  }
}