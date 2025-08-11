<template>
  <div class="timeline-filters mb-3">
    <!-- Compact View Filters (Sidebar) -->
    <div v-if="!isModalView" class="btn-group w-100" role="group">
      <input 
        type="checkbox" 
        class="btn-check" 
        id="show-level-ups-inline" 
        v-model="localFilters.showLevelUps"
      >
      <label class="btn btn-outline-warning btn-sm" for="show-level-ups-inline">
        Level-Ups
      </label>
      
      <input 
        type="checkbox" 
        class="btn-check" 
        id="show-practices-inline" 
        v-model="localFilters.showPractices"
      >
      <label class="btn btn-outline-info btn-sm" for="show-practices-inline">
        Practice
      </label>
      
      <input 
        type="checkbox" 
        class="btn-check" 
        id="show-quicknotes-inline" 
        v-model="localFilters.showQuickNotes"
      >
      <label class="btn btn-outline-info btn-sm" for="show-quicknotes-inline">
        Notes
      </label>
    </div>
    
    <!-- Modal View Filters (Full Timeline) -->
    <div v-else class="d-flex justify-content-between align-items-center">
      <h6 class="mb-0">Activity Timeline</h6>
      <div class="btn-group" role="group">
        <button 
          type="button"
          class="btn btn-sm"
          :class="localFilters.showLevelUps ? 'btn-success' : 'btn-outline-success'"
          @click="localFilters.showLevelUps = !localFilters.showLevelUps"
        >
          <i class="bi bi-arrow-up-circle me-1"></i>
          Level-Ups ({{ eventCounts.levelUps }})
        </button>
        
        <button 
          type="button"
          class="btn btn-sm"
          :class="localFilters.showPractices ? 'btn-primary' : 'btn-outline-primary'"
          @click="localFilters.showPractices = !localFilters.showPractices"
        >
          <i class="bi bi-play-circle me-1"></i>
          Practice ({{ eventCounts.practices }})
        </button>

        <button 
          type="button"
          class="btn btn-sm"
          :class="localFilters.showQuickNotes ? 'btn-info' : 'btn-outline-info'"
          @click="localFilters.showQuickNotes = !localFilters.showQuickNotes"
        >
          <i class="bi bi-chat-left-text me-1"></i>
          Notes ({{ eventCounts.quickNotes }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface TimelineFilters {
  showLevelUps: boolean
  showPractices: boolean
  showQuickNotes: boolean
}

interface EventCounts {
  levelUps: number
  practices: number
  quickNotes: number
}

interface Props {
  filters: TimelineFilters
  eventCounts: EventCounts
  isModalView?: boolean
}

interface Emits {
  (e: 'update:filters', filters: TimelineFilters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Create reactive local filters that sync with parent
const localFilters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})
</script>

<style scoped>
.btn-check:checked + .btn-outline-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-check:checked + .btn-outline-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: #fff;
}

.btn-group .btn {
  transition: all 0.2s ease-in-out;
}
</style>