<template>
  <header class="text-center mb-5 position-relative">
    <h1 class="display-4 text-primary mb-3">💃 Modern Jive Skill Tracker</h1>
    <p class="lead text-muted">Track your dance skills with scientific precision</p>
    
    <!-- Button Group -->
    <div class="header-buttons">
      <!-- View Mode Toggle -->
      <button
        class="btn btn-outline-light btn-sm view-mode-toggle"
        @click="toggleViewMode"
        :title="viewMode === 'regular' ? 'Switch to Compact View' : 'Switch to Regular View'"
      >
        <i :class="viewMode === 'regular' ? 'bi-list' : 'bi-grid-3x3-gap'" class="bi me-2"></i>
        {{ viewMode === 'regular' ? 'Kompakt' : 'Regular' }}
      </button>
      
      <!-- Dark Mode Toggle -->
      <DarkModeToggle />
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
.text-primary {
  color: #fff !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.view-mode-toggle {
  border-color: rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

/* Mobile responsive spacing */
@media (max-width: 768px) {
  .header-buttons {
    top: 10px;
    gap: 8px;
  }
  
  .view-mode-toggle {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
  
  .view-mode-toggle .bi {
    font-size: 0.9rem;
  }
  
  /* Adjust header text to avoid overlap */
  h1.display-4 {
    padding-right: 120px;
    font-size: 2rem;
  }
  
  .lead {
    padding-right: 50px;
  }
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
</style>