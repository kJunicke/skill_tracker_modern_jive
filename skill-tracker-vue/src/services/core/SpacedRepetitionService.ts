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
  // SM2 Algorithm Constants
  private static readonly MAX_EASE_FACTOR = 3.0
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly EASE_FACTOR_BONUS = 0.1
  private static readonly EASE_FACTOR_PENALTY = 0.15
  private static readonly EASE_FACTOR_SLIGHT_PENALTY = 0.02
  
  // Other Constants
  private static readonly ARCHIVED_DELAY_YEARS = 10
  private static readonly FOCUS_LEVEL_UP_THRESHOLD = 0.75 // 75%
  private static readonly FOCUS_INACTIVITY_DAYS = 7

  // Quality-based configurations (1=Could Not Perform, 2=Hard, 3=Good, 4=Very Easy)
  private static readonly QUALITY_CONFIG = {
    1: { acquisition: 'reset', xp: 0, name: 'Could Not Perform' },
    2: { acquisition: 0, xp: 1, name: 'Hard' },
    3: { acquisition: 1, xp: 2, name: 'Good' },
    4: { acquisition: 2, xp: 3, name: 'Very Easy' }
  } as const

  /**
   * Helper method for consistent fallback logging
   */
  private logFallback(methodName: string, property: string, skillName: string, defaultValue: string | number, reason: string): void {
    console.warn(`[FALLBACK] SpacedRepetitionService.${methodName}: Missing ${property} for skill "${skillName}", using ${defaultValue}. Reason: ${reason}.`)
  }

  /**
   * Get ease factor with fallback logging
   */
  private getEaseFactorOrDefault(skill: SkillData, methodName: string): number {
    if (!skill.easeFactor) {
      this.logFallback(methodName, 'easeFactor', skill.name, '2.5', 'easeFactor is undefined or null')
      return 2.5
    }
    return skill.easeFactor
  }

  /**
   * Get interval with status-aware fallback logging
   */
  private getIntervalOrDefault(skill: SkillData, methodName: string): number {
    if (skill.status === 'acquisition') {
      return skill.interval ?? 0
    }
    if (!skill.interval) {
      this.logFallback(methodName, 'interval', skill.name, 'default 1', `interval is undefined, null, or 0 for ${skill.status} skill`)
      return 1
    }
    return skill.interval
  }

  /**
   * Get repetitions with fallback logging
   */
  private getRepetitionsOrDefault(skill: SkillData, methodName: string): number {
    if (!skill.repetitions) {
      this.logFallback(methodName, 'repetitions', skill.name, 'default 0', 'repetitions is undefined, null, or 0')
      return 0
    }
    return skill.repetitions
  }

  /**
   * Clamp ease factor to SM2 boundaries
   */
  private clampEaseFactor(easeFactor: number, change: number, operation: 'add' | 'subtract'): number {
    const newValue = operation === 'add' ? easeFactor + change : easeFactor - change
    return Math.max(SpacedRepetitionService.MIN_EASE_FACTOR, Math.min(newValue, SpacedRepetitionService.MAX_EASE_FACTOR))
  }

  /**
   * Check if status is inactive (no spaced repetition)
   */
  private isInactiveStatus(status: string): boolean {
    return status === 'backlog' || status === 'archived'
  }

  /**
   * Check if status requires interval-based scheduling
   */
  private requiresIntervalScheduling(status: string): boolean {
    return status === 'acquisition' || status === 'maintenance'
  }


  /**
   * Update SM2 parameters after practice session - only for MAINTENANCE status
   */
  updateSM2Parameters(skill: SkillData, quality: number): SM2Update {
    let easeFactor = this.getEaseFactorOrDefault(skill, 'updateSM2Parameters')
    let interval = this.getIntervalOrDefault(skill, 'updateSM2Parameters')
    let repetitions = this.getRepetitionsOrDefault(skill, 'updateSM2Parameters')

    // Only apply SM2 algorithm for MAINTENANCE status
    if (skill.status === 'maintenance') {
      // Update ease factor based on quality
      if (quality >= 4) { // Very Easy
        easeFactor = this.clampEaseFactor(easeFactor, SpacedRepetitionService.EASE_FACTOR_BONUS, 'add')
      } else if (quality >= 3) { // Good
        easeFactor = this.clampEaseFactor(easeFactor, SpacedRepetitionService.EASE_FACTOR_SLIGHT_PENALTY, 'subtract')
      } else { // Hard or Forgotten
        easeFactor = this.clampEaseFactor(easeFactor, SpacedRepetitionService.EASE_FACTOR_PENALTY, 'subtract')
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
      
      const bonus = SpacedRepetitionService.QUALITY_CONFIG[quality as keyof typeof SpacedRepetitionService.QUALITY_CONFIG]?.acquisition
      
      if (bonus === 'reset') {
        // Could Not Perform - reset to 1 day
        interval = 1
      } else {
        // Add cumulative bonus to current interval (ensure minimum 1 day)
        interval = Math.max(1, interval + (bonus as number))
      }
    }
    // For other statuses (backlog, focus, archived), don't update SM2 parameters

    const nextReview = this.calculateNextReview({ ...skill, easeFactor, interval, repetitions })

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview
    }
  }

  /**
   * Calculate next review date based on 5-status learning system
   * Uses daily intervals for all skills - weekly display handled by getDisplayNextReview()
   */
  calculateNextReview(skill: SkillData): string {
    const practicedDate = skill.lastPracticed || dateUtils.now()
    if (!skill.lastPracticed) {
      this.logFallback('calculateNextReview', 'lastPracticed', skill.name, 'current date', 'lastPracticed is undefined or null')
    }

    if (this.isInactiveStatus(skill.status)) {
      return dateUtils.addDays(dateUtils.now(), SpacedRepetitionService.ARCHIVED_DELAY_YEARS * 365)
    }

    if (this.requiresIntervalScheduling(skill.status)) {
      const interval = skill.interval || 1
      if (!skill.interval) {
        this.logFallback('calculateNextReview', 'interval', skill.name, 'default 1', 'interval is undefined, null, or 0')
      }
      return dateUtils.addDays(practicedDate, interval)
    }

    if (skill.status === 'focus') {
      return dateUtils.addDays(dateUtils.now(), 1) // Daily practice
    }

    // Unknown status fallback
    this.logFallback('calculateNextReview', 'status', skill.name, '1 day interval', `Unknown skill status "${skill.status}"`)
    return dateUtils.addDays(practicedDate, 1)
  }


  /**
   * Handle Focus mode progression logic with XP system
   */
  handleFocusProgression(skill: SkillData, quality: number): FocusProgression {
    // Initialize focus tracking if not present
    const existingFocusData = skill.focusData
    if (!existingFocusData) {
      this.logFallback('handleFocusProgression', 'focusData', skill.name, 'default values', 'focusData is undefined or null')
    }
    const focusData = existingFocusData || {
      totalSessions: 0,
      consecutiveGoodSessions: 0,
      currentXP: 0,
      targetXP: calculateTargetXP(skill.level),
      lastQuality: null,
      readyForLevelUp: false
    }

    // XP rewards from quality configuration
    const qualityConfig = SpacedRepetitionService.QUALITY_CONFIG[quality as keyof typeof SpacedRepetitionService.QUALITY_CONFIG]
    if (!qualityConfig) {
      this.logFallback('handleFocusProgression', 'quality', skill.name, '0 XP', `Invalid quality "${quality}" not in range 1-4`)
    }
    const calculatedXP = qualityConfig?.xp || 0

    const updatedFocusData = {
      totalSessions: focusData.totalSessions + 1,
      consecutiveGoodSessions: quality >= 3 ? focusData.consecutiveGoodSessions + 1 : 0, // Good or Very Easy
      currentXP: focusData.currentXP + calculatedXP,
      targetXP: focusData.targetXP,
      lastQuality: quality,
      readyForLevelUp: focusData.readyForLevelUp
    }

    // Check if ready for level up
    const levelUpThreshold = Math.ceil(updatedFocusData.targetXP * SpacedRepetitionService.FOCUS_LEVEL_UP_THRESHOLD)
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
      const calculatedCurrentInterval = skill.interval || (() => {
        this.logFallback('checkAutomaticStatusTransitions', 'interval', skill.name, 'default 1', 'interval is undefined, null, or 0 for acquisition→maintenance transition')
        return 1
      })()
      
      // SM2 formula for 3rd+ repetition: nextInterval = previousInterval * easeFactor
      // We want nextInterval >= currentInterval, so: easeFactor >= currentInterval / 6
      // (6 is the standard interval for 2nd repetition in SM2)
      const minEaseFactor = calculatedCurrentInterval / 6
      
      // Clamp to SM2 boundaries
      const calculatedEaseFactor = this.clampEaseFactor(0, minEaseFactor, 'add')
      
      // Only update if we don't have an ease factor or need to increase it for smooth transition
      const finalEaseFactor = skill.easeFactor || (() => {
        this.logFallback('checkAutomaticStatusTransitions', 'easeFactor', skill.name, `calculated value ${calculatedEaseFactor.toFixed(2)}`, 'easeFactor is undefined or null')
        return 2.5
      })()
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
      if (daysSinceLastPractice >= SpacedRepetitionService.FOCUS_INACTIVITY_DAYS) {
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

  /**
   * Get display-friendly next review date that respects training schedules
   * For weekly skills: rounds calculated nextReview to next available training day
   */
  getDisplayNextReview(skill: SkillData): string {
    const nextReview = skill.nextReview
    if (!nextReview) {
      this.logFallback('getDisplayNextReview', 'nextReview', skill.name, 'current date', 'nextReview is undefined or null')
      return dateUtils.now()
    }

    // For weekly skills, round to next training day
    if (skill.spacedRepetitionMode === 'weekly') {
      // If already a training day, keep it; otherwise find next training day
      return this.trainingScheduleService.isTrainingDay(nextReview) 
        ? nextReview 
        : this.trainingScheduleService.getNextTrainingDate(nextReview)
    }

    return nextReview
  }

  /**
   * Get training schedule service for external use
   */
  getPublicTrainingScheduleService(): TrainingScheduleService {
    return this.trainingScheduleService
  }
}