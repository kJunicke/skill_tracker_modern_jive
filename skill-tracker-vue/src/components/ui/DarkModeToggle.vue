<template>
  <button
    class="btn btn-outline-light btn-sm dark-mode-toggle"
    @click="toggleDarkMode"
    :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    type="button"
  >
    <i :class="isDarkMode ? 'bi bi-sun' : 'bi bi-moon'"></i>
    <span class="visually-hidden">{{ isDarkMode ? 'Switch to light mode' : 'Switch to dark mode' }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDarkModeStore } from '@/stores/darkModeStore'

const darkModeStore = useDarkModeStore()

const isDarkMode = computed(() => darkModeStore.isDarkMode)

const toggleDarkMode = () => {
  darkModeStore.toggleDarkMode()
}
</script>

<style scoped>
.dark-mode-toggle {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

/* Hover effect removed per user request */

.dark-mode-toggle:active {
  transform: translateY(0);
}

.dark-mode-toggle i {
  font-size: 1rem;
  color: #ffffff;
}

/* Icon hover effect removed per user request */

.dark-mode-toggle:focus {
  border-color: rgba(255, 255, 255, 0.8);
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

/* Dark theme hover effect removed per user request */
</style>