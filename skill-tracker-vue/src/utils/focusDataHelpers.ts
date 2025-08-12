import type { FocusData } from '@/types/skill'

/**
 * Central XP calculation function - used by all parts of the application
 */
export function calculateTargetXP(level: number): number {
  return Math.floor(3 * 2 + level / 3)
}

export function createDefaultFocusData(level: number = 1): FocusData {
  return {
    consecutiveGoodSessions: 0,
    totalSessions: 0,
    currentXP: 0,
    targetXP: calculateTargetXP(level),
    lastQuality: null,
    readyForLevelUp: false
  }
}

export function initializeFocusData(existingData?: Partial<FocusData>, level: number = 1): FocusData {
  const defaultData = createDefaultFocusData(level)
  
  if (!existingData) {
    return defaultData
  }

  return {
    ...defaultData,
    ...existingData
  }
}

export function calculateXPProgress(focusData: FocusData): number {
  return Math.min((focusData.currentXP / focusData.targetXP) * 100, 100)
}

export function isReadyForLevelUp(focusData: FocusData): boolean {
  return focusData.currentXP >= focusData.targetXP
}