import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
  const isDarkMode = ref(false)

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    updateDocumentTheme()
    saveDarkModePreference()
  }

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
    updateDocumentTheme()
    saveDarkModePreference()
  }

  const updateDocumentTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  const saveDarkModePreference = () => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
  }

  const loadDarkModePreference = () => {
    try {
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        const parsed = JSON.parse(stored)
        setDarkMode(parsed)
      }
    } catch (error) {
      console.warn('Failed to load dark mode preference:', error)
    }
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    loadDarkModePreference
  }
})