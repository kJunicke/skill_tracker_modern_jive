import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewMode = 'regular' | 'compact'

export const useViewModeStore = defineStore('viewMode', () => {
  const viewMode = ref<ViewMode>('regular')

  const setViewMode = (mode: ViewMode) => {
    viewMode.value = mode
    // Persist to localStorage
    localStorage.setItem('skill-tracker-view-mode', mode)
  }

  const toggleViewMode = () => {
    const newMode: ViewMode = viewMode.value === 'regular' ? 'compact' : 'regular'
    setViewMode(newMode)
  }

  const loadViewModePreference = () => {
    const saved = localStorage.getItem('skill-tracker-view-mode') as ViewMode
    if (saved && (saved === 'regular' || saved === 'compact')) {
      viewMode.value = saved
    }
  }

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    loadViewModePreference
  }
})