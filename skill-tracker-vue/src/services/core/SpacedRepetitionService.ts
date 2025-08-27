import type { SkillData } from '@/types/skill'
import { dateUtils } from '@/utils/dateHelpers'
import { calculateTargetXP } from '@/utils/focusDataHelpers'
import { TrainingScheduleService } from './TrainingScheduleService'

/**
 * SM2 Algorithm parameters update result
 */
export interface SM2Update {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string
}

/**
 * Focus mode progression result
 */
export interface FocusProgression {
  focusData: {
    totalSessions: number
    consecutiveGoodSessions: number
    currentXP: number
    targetXP: number
    lastQuality: number | null
    readyForLevelUp: boolean
  }
}

/**
 * Service for handling SM2 Spaced Repetition Algorithm and Focus Mode logic
 * Supports both daily and weekly spaced repetition modes
 */
export class SpacedRepetitionService {
  private trainingScheduleService: TrainingScheduleService

  constructor(trainingDays: number[] = [2, 4]) {
    this.trainingScheduleService = new TrainingScheduleService(trainingDays)
  }

  /**
   * Update training schedule for weekly spaced repetition
   */
  setTrainingSchedule(trainingDays: number[]): void {
    this.trainingScheduleService.setTrainingDays(trainingDays)
  }

  /**
   * Get current training schedule from store or use provided days
   */
  private getTrainingScheduleService(): TrainingScheduleService {
    // Try to get training days from the store
    try {
      // Dynamic import to avoid circular dependencies
      if (typeof window !== 'undefined') {
        const store = (window as Record<string, unknown>).__PINIA_TRAINING_SCHEDULE__
        if (store && store.trainingSchedule && Array.isArray((store.trainingSchedule as { trainingDays: unknown }).trainingDays)) {
          this.trainingScheduleService.setTrainingDays((store.trainingSchedule as { trainingDays: number[] }).trainingDays)
        }
      }
    } catch {
      // Fallback to default training days if store is not available
      console.warn('[FALLBACK] SpacedRepetitionService.getTrainingScheduleService: Could not access training schedule store, using default training days. Reason: Store not available or accessible.')
    }
    
    return this.trainingScheduleService
  }
  private static readonly MAX_EASE_FACTOR = 3.0
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly EASE_FACTOR_BONUS = 0.1
  private static readonly EASE_FACTOR_PENALTY = 0.15
  private static readonly EASE_FACTOR_SLIGHT_PENALTY = 0.02

  // Acquisition interval bonuses based on quality (cumulative system)
  private static readonly ACQUISITION_QUALITY_BONUSES = {
    1: 'reset', // Could Not Perform - reset to 1 day
    2: 0,       // Hard - no change
    3: 1,       // Good - add 1 day
    4: 2        // Very Easy - add 2 days
  } as const

  private static readonly FOCUS_INTERVALS = {
    1: 1, // Forgotten - practice tomorrow
    2: 1, // Hard - practice tomorrow (focus mode encourages daily practice)
    3: 1, // Good - practice tomorrow (daily suggestions)
    4: 1  // Very Easy - practice tomorrow (daily suggestions)
  }

  /**
   * Calculate target XP needed for current level (grows with level)
   */
  calculateTargetXP(level: number): number {
    return calculateTargetXP(level)
  }

  /**
   * Update SM2 parameters after practice session - only for MAINTENANCE status
   */
  updateSM2Parameters(skill: SkillData, quality: number): SM2Update {
    let easeFactor = skill.easeFactor
    if (!easeFactor) {
      console.warn(`[FALLBACK] SpacedRepetitionService.updateSM2Parameters: Missing easeFactor for skill "${skill.name}", using default 2.5. Reason: easeFactor is undefined or null.`)
      easeFactor = 2.5
    }
    
    let interval = skill.status === 'acquisition' ? (skill.interval ?? 0) : skill.interval
    if (skill.status !== 'acquisition' && !interval) {
      console.warn(`[FALLBACK] SpacedRepetitionService.updateSM2Parameters: Missing interval for ${skill.status} skill "${skill.name}", using default 1. Reason: interval is undefined, null, or 0.`)
      interval = 1
    }
    
    let repetitions = skill.repetitions
    if (!repetitions) {
      console.warn(`[FALLBACK] SpacedRepetitionService.updateSM2Parameters: Missing repetitions for skill "${skill.name}", using default 0. Reason: repetitions is undefined, null, or 0.`)
      repetitions = 0
    }

    // Only apply SM2 algorithm for MAINTENANCE status
    if (skill.status === 'maintenance') {
      // Update ease factor based on quality (1-4 scale)
      if (quality >= 4) { // Very Easy
        easeFactor = Math.min(easeFactor + SpacedRepetitionService.EASE_FACTOR_BONUS, SpacedRepetitionService.MAX_EASE_FACTOR)
      } else if (quality >= 3) { // Good
        easeFactor = Math.max(easeFactor - SpacedRepetitionService.EASE_FACTOR_SLIGHT_PENALTY, SpacedRepetitionService.MIN_EASE_FACTOR)
      } else { // Hard or Forgotten
        easeFactor = Math.max(easeFactor - SpacedRepetitionService.EASE_FACTOR_PENALTY, SpacedRepetitionService.MIN_EASE_FACTOR)
      }

      // Update interval and repetitions
      if (quality < 3) { // Failed recall (Forgotten or Hard)
        // Failed recall - reset interval and repetitions
        interval = 1
        repetitions = 0
      } else {
        // Successful recall (Good or Very Easy)
        repetitions += 1
        if (repetitions === 1) {
          interval = 1
        } else if (repetitions === 2) {
          interval = 6
        } else {
          interval = Math.round(interval * easeFactor)
        }
      }
    } else if (skill.status === 'acquisition') {
      // For acquisition, update interval based on cumulative quality bonuses
      repetitions += 1
      
      const bonus = SpacedRepetitionService.ACQUISITION_QUALITY_BONUSES[quality as keyof typeof SpacedRepetitionService.ACQUISITION_QUALITY_BONUSES]
      
      if (bonus === 'reset') {
        // Could Not Perform - reset to 1 day
        interval = 1
      } else {
        // Add cumulative bonus to current interval
        interval = interval + (bonus as number)
        // Ensure minimum of 1 day (allows 0->1 progression)
        interval = Math.max(1, interval)
      }
    }
    // For other statuses (backlog, focus, archived), don't update SM2 parameters

    const nextReview = this.calculateNextReview({ ...skill, easeFactor, interval, repetitions }, quality)

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview
    }
  }

  /**
   * Calculate next review date based on new 5-status learning system
   * Supports both daily and weekly spaced repetition modes
   */
  calculateNextReview(skill: SkillData, quality: number): string {
    const lastPracticedDate = skill.lastPracticed
    if (!lastPracticedDate) {
      console.warn(`[FALLBACK] SpacedRepetitionService.calculateNextReview: Missing lastPracticed date for skill "${skill.name}", using current date. Reason: lastPracticed is undefined or null.`)
    }
    const practicedDate = lastPracticedDate || dateUtils.now()
    const isWeeklyMode = skill.spacedRepetitionMode === 'weekly'

    switch (skill.status) {
      case 'backlog':
      case 'archived':
        // No spaced repetition - effectively never need review
        return dateUtils.addDays(dateUtils.now(), 3650) // 10 years

      case 'acquisition':
        // Fixed intervals for building skills (Level 1-4)
        return isWeeklyMode 
          ? this.calculateWeeklyAcquisitionInterval(skill, quality, practicedDate)
          : this.calculateAcquisitionInterval(skill, quality, practicedDate)

      case 'maintenance':
        // SM2 algorithm for skill retention (Level 5+)
        return isWeeklyMode
          ? this.calculateWeeklyMaintenanceInterval(skill, quality, practicedDate)
          : this.calculateMaintenanceInterval(skill, quality, practicedDate)

      case 'focus':
        // Suggestions - normal spaced repetition is paused
        return isWeeklyMode
          ? this.calculateWeeklyFocusInterval(skill, quality)
          : this.calculateFocusInterval(skill, quality)

      default:
        console.warn(`[FALLBACK] SpacedRepetitionService.calculateNextReview: Unknown skill status "${skill.status}" for skill "${skill.name}", using acquisition intervals. Reason: Status not in expected values (backlog, acquisition, maintenance, focus, archived).`)
        return isWeeklyMode
          ? this.calculateWeeklyAcquisitionInterval(skill, quality, practicedDate)
          : this.calculateAcquisitionInterval(skill, quality, practicedDate)
    }
  }

  /**
   * Calculate acquisition intervals - cumulative progression based on quality
   * Anki-inspired system: 1 day base + cumulative bonuses based on performance
   */
  private calculateAcquisitionInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    // Use the interval already calculated by updateSM2Parameters
    const calculatedInterval = skill.interval ?? 1
    if (skill.interval === undefined) {
      console.warn(`[FALLBACK] SpacedRepetitionService.calculateAcquisitionInterval: Missing interval for skill "${skill.name}", using default 1. Reason: interval is undefined.`)
    }
    
    return dateUtils.addDays(lastPracticedDate, calculatedInterval)
  }

  /**
   * Calculate maintenance intervals - standard SM2 algorithm for retention
   */
  private calculateMaintenanceInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    // Use standard SM2 calculated interval for maintenance
    const interval = skill.interval
    if (!interval) {
      console.warn(`[FALLBACK] SpacedRepetitionService.calculateMaintenanceInterval: Missing interval for maintenance skill "${skill.name}", using default 1. Reason: interval is undefined, null, or 0.`)
    }
    const calculatedInterval = interval || 1
    return dateUtils.addDays(lastPracticedDate, calculatedInterval)
  }

  /**
   * Calculate specialized intervals for Focus mode - daily suggestions
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateFocusInterval(_skill: SkillData, _quality: number): string {
    // Focus mode suggests daily practice - return tomorrow's date
    return dateUtils.addDays(dateUtils.now(), 1)
  }

  /**
   * Handle Focus mode progression logic with XP system
   */
  handleFocusProgression(skill: SkillData, quality: number): FocusProgression {
    // Initialize focus tracking if not present
    const existingFocusData = skill.focusData
    if (!existingFocusData) {
      console.warn(`[FALLBACK] SpacedRepetitionService.handleFocusProgression: Missing focusData for skill "${skill.name}", initializing default values. Reason: focusData is undefined or null.`)
    }
    const focusData = existingFocusData || {
      totalSessions: 0,
      consecutiveGoodSessions: 0,
      currentXP: 0,
      targetXP: calculateTargetXP(skill.level),
      lastQuality: null,
      readyForLevelUp: false
    }

    // XP rewards based on quality (1-4 scale: Forgotten=0, Hard=1, Good=2, Very Easy=3)
    const xpRewards = {
      1: 0, // Forgotten - no XP
      2: 1, // Hard - 1 XP
      3: 2, // Good - 2 XP
      4: 3  // Very Easy - 3 XP
    }
    const xpGained = xpRewards[quality as keyof typeof xpRewards]
    if (xpGained === undefined) {
      console.warn(`[FALLBACK] SpacedRepetitionService.handleFocusProgression: Invalid quality "${quality}" for skill "${skill.name}", using 0 XP. Reason: Quality not in expected range 1-4.`)
    }
    const calculatedXP = xpGained || 0

    const updatedFocusData = {
      totalSessions: focusData.totalSessions + 1,
      consecutiveGoodSessions: quality >= 3 ? focusData.consecutiveGoodSessions + 1 : 0, // Good or Very Easy
      currentXP: focusData.currentXP + calculatedXP,
      targetXP: focusData.targetXP,
      lastQuality: quality,
      readyForLevelUp: focusData.readyForLevelUp
    }

    // Check if ready for level up (75% of target XP)
    const levelUpThreshold = Math.ceil(updatedFocusData.targetXP * 0.75)
    if (updatedFocusData.currentXP >= levelUpThreshold && !updatedFocusData.readyForLevelUp) {
      updatedFocusData.readyForLevelUp = true
    }

    return { focusData: updatedFocusData }
  }

  /**
   * Get days until next review
   */
  getDaysUntilReview(skill: SkillData): number {
    if (!skill.nextReview) return 0
    return dateUtils.daysBetween(dateUtils.now(), skill.nextReview)
  }

  /**
   * Reset focus data for level up
   */
  resetFocusDataForLevelUp(skill: SkillData, newLevel: number): Partial<SkillData> {
    if (skill.status !== 'focus' || !skill.focusData) {
      return {}
    }

    return {
      focusData: {
        ...skill.focusData,
        currentXP: 0,
        targetXP: calculateTargetXP(newLevel),
        readyForLevelUp: false
      }
    }
  }

  /**
   * Check and apply automatic status transitions based on learning system rules
   */
  checkAutomaticStatusTransitions(skill: SkillData): Partial<SkillData> {
    const updates: Partial<SkillData> = {}

    // ACQUISITION → MAINTENANCE at Level 5
    if (skill.status === 'acquisition' && skill.level >= 5) {
      updates.status = 'maintenance'
      
      // Initialize ease factor to ensure smooth interval transition
      // Calculate minimum ease factor needed to maintain current interval
      const currentInterval = skill.interval
      if (!currentInterval) {
        console.warn(`[FALLBACK] SpacedRepetitionService.checkAutomaticStatusTransitions: Missing interval for acquisition→maintenance transition of skill "${skill.name}", using default 1. Reason: interval is undefined, null, or 0.`)
      }
      const calculatedCurrentInterval = currentInterval || 1
      
      // SM2 formula for 3rd+ repetition: nextInterval = previousInterval * easeFactor
      // We want nextInterval >= currentInterval, so: easeFactor >= currentInterval / 6
      // (6 is the standard interval for 2nd repetition in SM2)
      const minEaseFactor = calculatedCurrentInterval / 6
      
      // Clamp to SM2 boundaries and ensure reasonable values
      const calculatedEaseFactor = Math.max(
        SpacedRepetitionService.MIN_EASE_FACTOR,
        Math.min(minEaseFactor, SpacedRepetitionService.MAX_EASE_FACTOR)
      )
      
      // Only update if we don't have an ease factor or need to increase it for smooth transition
      const currentEaseFactor = skill.easeFactor
      if (!currentEaseFactor) {
        console.warn(`[FALLBACK] SpacedRepetitionService.checkAutomaticStatusTransitions: Missing easeFactor for skill "${skill.name}", using calculated value ${calculatedEaseFactor.toFixed(2)}. Reason: easeFactor is undefined or null.`)
      }
      const finalEaseFactor = currentEaseFactor || 2.5
      if (!skill.easeFactor || calculatedEaseFactor > finalEaseFactor) {
        updates.easeFactor = calculatedEaseFactor
      }
      
      // Set repetitions to 2 so next SM2 calculation uses ease factor formula
      updates.repetitions = 2
      
      // Preserve current interval to maintain learning progress
      updates.interval = calculatedCurrentInterval
    }

    // FOCUS → MAINTENANCE after 7 days without practice
    if (skill.status === 'focus' && skill.lastPracticed) {
      const daysSinceLastPractice = dateUtils.daysBetween(skill.lastPracticed, dateUtils.now())
      if (daysSinceLastPractice >= 7) {
        updates.status = 'maintenance'
        // Continue spaced repetition from where it left off
        if (skill.nextReview) {
          updates.nextReview = skill.nextReview
        }
      }
    }

    return updates
  }

  /**
   * Check if skill should suggest level-up based on status
   */
  shouldSuggestLevelUp(skill: SkillData, quality: number): boolean {
    switch (skill.status) {
      case 'acquisition':
        // Suggest level-up almost every time in acquisition (default behavior)
        return quality >= 3 // Good or Very Easy (1-4 scale)

      case 'maintenance':
        // Seldom suggest level-up in maintenance - only for breakthrough moments
        return false // User must manually trigger level-up

      case 'focus':
        // Suggest level-up after reaching XP threshold
        return skill.focusData?.readyForLevelUp || false

      default:
        return false
    }
  }

  // Weekly Spaced Repetition Methods

  /**
   * Calculate weekly acquisition intervals - 1-2-3 week intervals instead of days
   */
  private calculateWeeklyAcquisitionInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    const currentInterval = skill.interval
    if (!currentInterval) {
      console.warn(`[FALLBACK] SpacedRepetitionService.calculateWeeklyAcquisitionInterval: Missing interval for weekly skill "${skill.name}", using default 1. Reason: interval is undefined, null, or 0.`)
    }
    const calculatedCurrentInterval = currentInterval || 1
    const bonus = SpacedRepetitionService.ACQUISITION_QUALITY_BONUSES[quality as keyof typeof SpacedRepetitionService.ACQUISITION_QUALITY_BONUSES]
    
    let newInterval: number
    
    if (bonus === 'reset') {
      // Could Not Perform - reset to 1 week
      newInterval = 1
    } else {
      // Add cumulative bonus to current interval (in weeks)
      newInterval = calculatedCurrentInterval + (bonus as number)
      // Ensure minimum of 1 week
      newInterval = Math.max(1, newInterval)
    }
    
    // Convert weeks to training sessions and find next training date
    const scheduleService = this.getTrainingScheduleService()
    return scheduleService.addWeeksToTrainingDate(lastPracticedDate, newInterval)
  }

  /**
   * Calculate weekly maintenance intervals - SM2 algorithm with weekly multipliers
   */
  private calculateWeeklyMaintenanceInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    // Use standard SM2 calculated interval but interpret as weeks
    const intervalInWeeks = skill.interval
    if (!intervalInWeeks) {
      console.warn(`[FALLBACK] SpacedRepetitionService.calculateWeeklyMaintenanceInterval: Missing interval for weekly maintenance skill "${skill.name}", using default 1. Reason: interval is undefined, null, or 0.`)
    }
    const calculatedWeeklyInterval = intervalInWeeks || 1
    
    // Convert weeks to training sessions and find next training date
    const scheduleService = this.getTrainingScheduleService()
    return scheduleService.addWeeksToTrainingDate(lastPracticedDate, calculatedWeeklyInterval)
  }

  /**
   * Calculate weekly focus intervals - next training day
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateWeeklyFocusInterval(_skill: SkillData, _quality: number): string {
    // Focus mode suggests next available training day
    const scheduleService = this.getTrainingScheduleService()
    return scheduleService.getNextTrainingDate(dateUtils.now())
  }

  /**
   * Get training schedule service for external use
   */
  getPublicTrainingScheduleService(): TrainingScheduleService {
    return this.getTrainingScheduleService()
  }
}