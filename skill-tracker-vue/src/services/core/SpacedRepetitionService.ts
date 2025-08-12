import type { SkillData } from '@/types/skill'
import { dateUtils } from '@/utils/dateHelpers'
import { calculateTargetXP } from '@/utils/focusDataHelpers'

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
 */
export class SpacedRepetitionService {
  private static readonly MAX_EASE_FACTOR = 3.0
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly EASE_FACTOR_BONUS = 0.1
  private static readonly EASE_FACTOR_PENALTY = 0.15
  private static readonly EASE_FACTOR_SLIGHT_PENALTY = 0.02

  private static readonly ACQUISITION_INTERVALS = [1, 2, 3] // Fixed 1-2-3 day intervals for acquisition

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
    let easeFactor = skill.easeFactor || 2.5
    let interval = skill.interval || 1
    let repetitions = skill.repetitions || 0

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
      // For acquisition, just increment repetitions for interval cycling
      repetitions += 1
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
   */
  calculateNextReview(skill: SkillData, quality: number): string {
    const lastPracticedDate = skill.lastPracticed || dateUtils.now()

    switch (skill.status) {
      case 'backlog':
      case 'archived':
        // No spaced repetition - effectively never need review
        return dateUtils.addDays(dateUtils.now(), 3650) // 10 years

      case 'acquisition':
        // Fixed 1-2-3 day intervals for building skills (Level 1-4)
        return this.calculateAcquisitionInterval(skill, quality, lastPracticedDate)

      case 'maintenance':
        // Standard SM2 algorithm for skill retention (Level 5+)
        return this.calculateMaintenanceInterval(skill, quality, lastPracticedDate)

      case 'focus':
        // Daily suggestions - normal spaced repetition is paused
        return this.calculateFocusInterval(skill, quality)

      default:
        return this.calculateAcquisitionInterval(skill, quality, lastPracticedDate)
    }
  }

  /**
   * Calculate acquisition intervals - fixed 1-2-3 day pattern for skill building
   */
  private calculateAcquisitionInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    // For acquisition, use fixed short intervals regardless of quality
    // Cycle through 1-2-3 day intervals to build familiarity
    const repetitions = skill.repetitions || 0
    const intervalIndex = repetitions % SpacedRepetitionService.ACQUISITION_INTERVALS.length
    const interval = SpacedRepetitionService.ACQUISITION_INTERVALS[intervalIndex]
    
    return dateUtils.addDays(lastPracticedDate, interval)
  }

  /**
   * Calculate maintenance intervals - standard SM2 algorithm for retention
   */
  private calculateMaintenanceInterval(skill: SkillData, quality: number, lastPracticedDate: string): string {
    // Use standard SM2 calculated interval for maintenance
    const interval = skill.interval || 1
    return dateUtils.addDays(lastPracticedDate, interval)
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
    const existingFocusData = skill.focusData || {
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
    const xpGained = xpRewards[quality as keyof typeof xpRewards] || 0

    const updatedFocusData = {
      totalSessions: existingFocusData.totalSessions + 1,
      consecutiveGoodSessions: quality >= 3 ? existingFocusData.consecutiveGoodSessions + 1 : 0, // Good or Very Easy
      currentXP: existingFocusData.currentXP + xpGained,
      targetXP: existingFocusData.targetXP,
      lastQuality: quality,
      readyForLevelUp: existingFocusData.readyForLevelUp
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
}