import type { SkillData } from '@/types/skill'
import { dateUtils } from './dateHelpers'

/**
 * SM2 Spaced Repetition Algorithm Implementation
 * Based on the original SM2 algorithm by Piotr Wozniak
 */
export function calculateNextReview(skill: SkillData, quality: number): string {
  // Quality: 0 = Completely Forgotten, 1 = Hard, 2 = Good, 3 = Very Easy
  
  // Handle archived skills - they never need review
  if (skill.status === 'archived') {
    return dateUtils.addDays(dateUtils.now(), 3650) // 10 years
  }

  // Initialize SM2 parameters if not present
  let easeFactor = skill.easeFactor || 2.5
  let interval = skill.interval || 1
  let repetitions = skill.repetitions || 0

  // Update ease factor based on quality
  if (quality >= 3) {
    // Very Easy - increase ease factor
    easeFactor = Math.min(easeFactor + 0.1, 3.0)
  } else if (quality >= 2) {
    // Good - maintain ease factor
    easeFactor = Math.max(easeFactor - 0.02, 1.3)
  } else {
    // Hard or Forgotten - decrease ease factor significantly
    easeFactor = Math.max(easeFactor - 0.15, 1.3)
  }

  // Calculate new interval
  if (quality < 2) {
    // Failed recall - reset interval and repetitions
    interval = 1
    repetitions = 0
  } else {
    // Successful recall
    repetitions += 1
    
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  // Special Focus mode interval logic
  if (skill.status === 'focus') {
    return calculateFocusInterval(skill, quality)
  }

  // Status modifiers for interval
  const statusModifiers = {
    backlog: 999,     // Effectively never (not actively learning)
    acquisition: 1.0, // Normal interval  
    maintenance: 1.5, // Review less frequently
    focus: 0.8,       // Review more frequently
    archived: 999     // Effectively never (handled above)
  }

  const modifier = statusModifiers[skill.status || 'acquisition']
  const finalInterval = Math.max(1, Math.round(interval * modifier))

  const lastPracticedDate = skill.lastPracticed || dateUtils.now()
  return dateUtils.addDays(lastPracticedDate, finalInterval)
}

/**
 * Calculate specialized intervals for Focus mode
 */
function calculateFocusInterval(skill: SkillData, quality: number): string {
  if (!skill.focusData) {
    return calculateNextReview({ ...skill, status: 'acquisition' }, quality)
  }

  // Focus mode uses shorter, more aggressive intervals
  let interval: number
  switch (quality) {
    case 0: // Forgotten - practice tomorrow
      interval = 1
      break
    case 1: // Hard - practice in 2 days
      interval = 2
      break
    case 2: // Good - practice in 3-4 days
      interval = 3
      break
    case 3: // Excellent - can wait a bit longer, but still focused
      interval = 5
      break
    default:
      interval = 2
  }

  const lastPracticedDate = skill.lastPracticed || dateUtils.now()
  return dateUtils.addDays(lastPracticedDate, interval)
}

/**
 * Update SM2 parameters after practice session
 */
export function updateSM2Parameters(skill: SkillData, quality: number): Partial<SkillData> {
  const updates: Partial<SkillData> = {}
  
  // Update ease factor
  let easeFactor = skill.easeFactor || 2.5
  if (quality >= 3) {
    easeFactor = Math.min(easeFactor + 0.1, 3.0)
  } else if (quality >= 2) {
    easeFactor = Math.max(easeFactor - 0.02, 1.3)
  } else {
    easeFactor = Math.max(easeFactor - 0.15, 1.3)
  }
  updates.easeFactor = easeFactor

  // Update interval and repetitions
  let interval = skill.interval || 1
  let repetitions = skill.repetitions || 0

  if (quality < 2) {
    interval = 1
    repetitions = 0
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  updates.interval = interval
  updates.repetitions = repetitions
  updates.nextReview = calculateNextReview({ ...skill, ...updates }, quality)

  return updates
}

/**
 * Calculate target XP needed for current level (grows with level)
 */
export function calculateTargetXP(level: number): number {
  return Math.ceil(level * 10 + (level - 1) * 5)
}

/**
 * Handle Focus mode progression logic with XP system
 */
export function handleFocusProgression(skill: SkillData, quality: number): Partial<SkillData> {
  const updates: Partial<SkillData> = {}
  
  // Initialize focus tracking if not present
  if (!skill.focusData) {
    updates.focusData = {
      totalSessions: 0,
      consecutiveGoodSessions: 0,
      currentXP: 0,
      targetXP: calculateTargetXP(skill.level),
      lastQuality: null,
      readyForLevelUp: false
    }
  }

  const focusData = { ...skill.focusData, ...updates.focusData }
  
  focusData.totalSessions = (focusData.totalSessions || 0) + 1
  focusData.lastQuality = quality

  // XP rewards based on quality (Hard=1, Good=2, Very Easy=3)
  const xpRewards = [0, 1, 2, 3] // Index matches quality (0=Forgotten, 1=Hard, 2=Good, 3=Very Easy)
  const xpGained = xpRewards[quality] || 0
  focusData.currentXP = (focusData.currentXP || 0) + xpGained

  // Check if ready for level up (75% of target XP)
  const levelUpThreshold = Math.ceil((focusData.targetXP || 50) * 0.75)
  if ((focusData.currentXP || 0) >= levelUpThreshold && !focusData.readyForLevelUp) {
    focusData.readyForLevelUp = true
  }

  updates.focusData = {
    consecutiveGoodSessions: focusData.consecutiveGoodSessions || 0,
    totalSessions: focusData.totalSessions || 0,
    currentXP: focusData.currentXP || 0,
    targetXP: focusData.targetXP || 50,
    lastQuality: focusData.lastQuality,
    readyForLevelUp: focusData.readyForLevelUp || false
  }
  return updates
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(skill: SkillData): number {
  if (!skill.nextReview) return 0
  return dateUtils.daysBetween(dateUtils.now(), skill.nextReview)
}