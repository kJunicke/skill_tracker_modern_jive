import type { FocusData } from '@/types/skill'

export function createDefaultFocusData(): FocusData {
  return {
    consecutiveGoodSessions: 0,
    totalSessions: 0,
    currentXP: 0,
    targetXP: 100,
    lastQuality: null,
    readyForLevelUp: false
  }
}

export function initializeFocusData(existingData?: Partial<FocusData>): FocusData {
  const defaultData = createDefaultFocusData()
  
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