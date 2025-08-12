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
      
      <!-- Compact marked filter - cycles through all/unmarked/marked -->
      <button 
        v-if="localFilters.showLevelUps || localFilters.showPractices || localFilters.showQuickNotes"
        type="button" 
        class="btn btn-outline-secondary btn-sm"
        @click="cycleMarkedFilter"
        :title="markedFilterTooltip"
      >
        <i :class="markedFilterIcon"></i>
      </button>
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

        <!-- Marked Entries Filter Button (shows when any entries are enabled) -->
        <button 
          v-if="localFilters.showLevelUps || localFilters.showPractices || localFilters.showQuickNotes"
          type="button" 
          class="btn btn-sm"
          :class="markedFilterButtonClass"
          @click="cycleMarkedFilterModal"
          :title="markedFilterTooltip"
        >
          <i :class="markedFilterIcon"></i>
          {{ markedFilterLabel }}
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
  markedNotesFilter: 'all' | 'marked' | 'unmarked'
}

interface EventCounts {
  levelUps: number
  practices: number
  quickNotes: number
  markedNotes: number
  unmarkedNotes: number
  total: number
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

// Computed label for marked filter dropdown
const markedFilterLabel = computed(() => {
  switch (localFilters.value.markedNotesFilter) {
    case 'all': return 'All'
    case 'marked': return 'Marked'
    case 'unmarked': return 'Unmarked'
    default: return 'All'
  }
})

// Compact view helpers
const markedFilterIcon = computed(() => {
  switch (localFilters.value.markedNotesFilter) {
    case 'all': return 'bi bi-list-ul'
    case 'marked': return 'bi bi-check-circle'
    case 'unmarked': return 'bi bi-circle'
    default: return 'bi bi-list-ul'
  }
})

const markedFilterTooltip = computed(() => {
  switch (localFilters.value.markedNotesFilter) {
    case 'all': return `All Entries (${props.eventCounts.total})`
    case 'marked': return `Marked Entries (${props.eventCounts.markedNotes})`
    case 'unmarked': return `Unmarked Entries (${props.eventCounts.unmarkedNotes})`
    default: return 'All Entries'
  }
})

const cycleMarkedFilter = () => {
  const currentFilter = localFilters.value.markedNotesFilter
  let newFilter: 'all' | 'marked' | 'unmarked'
  
  switch (currentFilter) {
    case 'all': newFilter = 'unmarked'; break
    case 'unmarked': newFilter = 'marked'; break
    case 'marked': newFilter = 'all'; break
    default: newFilter = 'all'
  }
  
  localFilters.value = { ...localFilters.value, markedNotesFilter: newFilter }
}

// Button classes for marked filter
const markedFilterButtonClass = computed(() => {
  switch (localFilters.value.markedNotesFilter) {
    case 'all': return 'btn-outline-secondary'
    case 'marked': return 'btn-success'
    case 'unmarked': return 'btn-outline-success'
    default: return 'btn-outline-secondary'
  }
})

// Modal view cycle function (same logic as compact but different function name)
const cycleMarkedFilterModal = () => {
  const currentFilter = localFilters.value.markedNotesFilter
  let newFilter: 'all' | 'marked' | 'unmarked'
  
  switch (currentFilter) {
    case 'all': newFilter = 'unmarked'; break
    case 'unmarked': newFilter = 'marked'; break
    case 'marked': newFilter = 'all'; break
    default: newFilter = 'all'
  }
  
  localFilters.value = { ...localFilters.value, markedNotesFilter: newFilter }
}
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

.btn-check:checked + .btn-outline-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn-group .btn {
  transition: all 0.2s ease-in-out;
}
</style>