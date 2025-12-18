<template>
  <header class="header-container mb-5">
    <!-- Button Group - positioned at top on mobile -->
    <div class="header-buttons">
      <!-- View Mode Toggle -->
      <button
        class="btn btn-outline-light btn-sm view-mode-toggle"
        @click="toggleViewMode"
        :title="viewMode === 'regular' ? 'Switch to Compact View' : 'Switch to Regular View'"
      >
        <i :class="viewMode === 'regular' ? 'bi-list' : 'bi-grid-3x3-gap'" class="bi me-2"></i>
        <span class="btn-text">{{ viewMode === 'regular' ? 'Kompakt' : 'Regular' }}</span>
      </button>

      <!-- Dark Mode Toggle -->
      <DarkModeToggle />
    </div>

    <!-- Header Text -->
    <div class="header-content text-center">
      <h1 class="display-4 text-primary mb-3">Modern Jive Skill Tracker</h1>
      <p class="lead text-muted d-none d-sm-block">Track your dance skills with scientific precision</p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useViewModeStore } from '@/stores/viewModeStore'
import DarkModeToggle from '@/components/ui/DarkModeToggle.vue'

const viewModeStore = useViewModeStore()
const viewMode = computed(() => viewModeStore.viewMode)
const toggleViewMode = viewModeStore.toggleViewMode
</script>

<style scoped>
.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.header-content {
  width: 100%;
}

.text-primary {
  color: #fff !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.view-mode-toggle {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.view-mode-toggle:hover {
  border-color: rgba(255, 255, 255, 0.8);
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.view-mode-toggle:focus {
  border-color: rgba(255, 255, 255, 0.8);
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

/* Desktop: Buttons positioned absolutely to the right */
@media (min-width: 769px) {
  .header-container {
    position: relative;
  }

  .header-buttons {
    position: absolute;
    top: 0;
    right: 0;
  }
}

/* Tablet: Centered layout */
@media (min-width: 576px) and (max-width: 768px) {
  .header-buttons {
    margin-bottom: 1rem;
    order: -1;
  }

  h1.display-4 {
    font-size: 2rem;
  }
}

/* Mobile: Compact layout */
@media (max-width: 575.98px) {
  .header-container {
    align-items: flex-start;
  }

  .header-buttons {
    align-self: flex-end;
    margin-bottom: 0.75rem;
    order: -1;
    gap: 8px;
  }

  .view-mode-toggle {
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
    min-height: 38px;
  }

  .view-mode-toggle .bi {
    font-size: 0.9rem;
  }

  /* Hide button text on very small screens */
  .btn-text {
    display: none;
  }

  h1.display-4 {
    font-size: 1.5rem;
    text-align: center;
    width: 100%;
  }
}

/* Ultra-narrow screens (iPhone SE, etc.) */
@media (max-width: 360px) {
  h1.display-4 {
    font-size: 1.25rem;
  }

  .header-buttons {
    gap: 6px;
  }
}
</style>