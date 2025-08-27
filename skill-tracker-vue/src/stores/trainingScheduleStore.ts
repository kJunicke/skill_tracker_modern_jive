import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TrainingSchedule {
  trainingDays: number[] // 0-6 (Sunday-Saturday)
  frequency: number // calculated from trainingDays.length
}

export const useTrainingScheduleStore = defineStore('trainingSchedule', () => {
  // Default to Tuesday and Thursday (2 days per week)
  const trainingSchedule = ref<TrainingSchedule>({
    trainingDays: [2, 4], // Tuesday, Thursday
    frequency: 2
  })

  const weekDayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

  // Computed properties
  const trainingDayNames = computed(() => 
    trainingSchedule.value.trainingDays
      .sort((a, b) => a - b)
      .map(day => weekDayNames[day])
  )

  const nextTrainingDay = computed(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const sortedDays = [...trainingSchedule.value.trainingDays].sort((a, b) => a - b)
    
    // Find the next training day this week
    let nextDay = sortedDays.find(day => day > currentDay)
    
    // If no training day left this week, take first day of next week
    if (nextDay === undefined) {
      nextDay = sortedDays[0]
    }
    
    return nextDay
  })

  // Actions
  function updateTrainingDays(days: number[]): void {
    if (days.length === 0) {
      throw new Error('At least one training day must be selected')
    }
    
    trainingSchedule.value.trainingDays = [...days].sort((a, b) => a - b)
    trainingSchedule.value.frequency = days.length
    saveToLocalStorage()
  }

  function addTrainingDay(day: number): void {
    if (!trainingSchedule.value.trainingDays.includes(day)) {
      const newDays = [...trainingSchedule.value.trainingDays, day]
      updateTrainingDays(newDays)
    }
  }

  function removeTrainingDay(day: number): void {
    if (trainingSchedule.value.trainingDays.length <= 1) {
      throw new Error('Cannot remove the last training day')
    }
    
    const newDays = trainingSchedule.value.trainingDays.filter(d => d !== day)
    updateTrainingDays(newDays)
  }

  function isTrainingDay(date: Date): boolean {
    return trainingSchedule.value.trainingDays.includes(date.getDay())
  }

  function getNextTrainingDate(fromDate: Date = new Date()): Date {
    const nextDate = new Date(fromDate)
    nextDate.setHours(0, 0, 0, 0) // Reset time to start of day
    
    // Look for the next training day within the next 7 days
    for (let i = 1; i <= 7; i++) {
      nextDate.setDate(fromDate.getDate() + i)
      if (isTrainingDay(nextDate)) {
        return nextDate
      }
    }
    
    // Fallback: return next occurrence of first training day
    nextDate.setDate(fromDate.getDate() + 1)
    while (!isTrainingDay(nextDate)) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
    
    return nextDate
  }

  function getPreviousTrainingDate(fromDate: Date = new Date()): Date {
    const prevDate = new Date(fromDate)
    prevDate.setHours(0, 0, 0, 0) // Reset time to start of day
    
    // Look for the previous training day within the last 7 days
    for (let i = 1; i <= 7; i++) {
      prevDate.setDate(fromDate.getDate() - i)
      if (isTrainingDay(prevDate)) {
        return prevDate
      }
    }
    
    // Fallback: return previous occurrence of last training day
    prevDate.setDate(fromDate.getDate() - 1)
    while (!isTrainingDay(prevDate)) {
      prevDate.setDate(prevDate.getDate() - 1)
    }
    
    return prevDate
  }

  // Persistence
  function saveToLocalStorage(): void {
    localStorage.setItem('trainingSchedule', JSON.stringify(trainingSchedule.value))
  }

  function loadFromLocalStorage(): void {
    const stored = localStorage.getItem('trainingSchedule')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Validate the loaded data
        if (Array.isArray(parsed.trainingDays) && parsed.trainingDays.length > 0) {
          trainingSchedule.value = {
            trainingDays: parsed.trainingDays,
            frequency: parsed.trainingDays.length
          }
        }
      } catch (error) {
        console.warn('Failed to load training schedule from localStorage:', error)
      }
    }
  }

  function resetToDefault(): void {
    trainingSchedule.value = {
      trainingDays: [2, 4], // Tuesday, Thursday
      frequency: 2
    }
    saveToLocalStorage()
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    // State
    trainingSchedule,
    weekDayNames,
    
    // Computed
    trainingDayNames,
    nextTrainingDay,
    
    // Actions
    updateTrainingDays,
    addTrainingDay,
    removeTrainingDay,
    isTrainingDay,
    getNextTrainingDate,
    getPreviousTrainingDate,
    resetToDefault,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})