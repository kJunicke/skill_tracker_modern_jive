<template>
  <button
    class="btn btn-outline-light dark-mode-toggle"
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
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.dark-mode-toggle:active {
  transform: translateY(0);
}

.dark-mode-toggle i {
  font-size: 1.2rem;
  color: #ffffff;
  transition: transform 0.3s ease;
}

.dark-mode-toggle:hover i {
  transform: scale(1.1);
}

[data-theme="dark"] .dark-mode-toggle {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.6);
}
</style>