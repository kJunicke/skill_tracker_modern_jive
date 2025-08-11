<template>
  <!-- Training Log Modal -->
  <div 
    class="modal fade" 
    id="trainingLogModal" 
    tabindex="-1" 
    aria-labelledby="trainingLogModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title" id="trainingLogModalLabel">
            <i class="bi bi-journal-text me-2"></i>
            Training Log
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body">
          <!-- Filters Component -->
          <TrainingLogFilters
            :filters="filters"
            :skills="skills"
            :activity-counts="activityCounts"
            @update:filters="updateFilters"
          />

          <!-- Timeline Component -->
          <TrainingLogTimeline
            :activities="filteredActivities"
            :view-mode="viewMode"
            @update:view-mode="viewMode = $event"
          />
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <TrainingLogExport :activities="filteredActivities" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef } from 'vue'
import type { SkillData } from '@/types/skill'
import TrainingLogFilters from './TrainingLogFilters.vue'
import TrainingLogTimeline from './TrainingLogTimeline.vue'
import TrainingLogExport from './TrainingLogExport.vue'
import { useTrainingLogData } from '@/composables/useTrainingLogData'

interface Props {
  skills: SkillData[]
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()


// Component state
const viewMode = ref<'timeline' | 'table'>('timeline')

const filters = ref({
  timePeriod: 'all',
  activityType: 'all',
  skillId: 'all',
  dateFrom: '',
  dateTo: '',
  showPractice: true,
  showLevelup: true,
  showQuicknote: true
})

// Use composable for data processing - pass reactive reference to props
const { filteredActivities, activityCounts } = useTrainingLogData(toRef(props, 'skills'), filters)

// Filter update handler
const updateFilters = (newFilters: typeof filters.value) => {
  filters.value = newFilters
}

// Initialize default date range - keep empty for 'all' time period
onMounted(() => {
  // Only set dates when custom range is selected
  // For 'all' time period, leave dates empty
  if (filters.value.timePeriod === 'custom') {
    const today = new Date()
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    filters.value.dateFrom = oneMonthAgo.toISOString().split('T')[0]
    filters.value.dateTo = today.toISOString().split('T')[0]
  }
})
</script>

<style scoped>
.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: none;
}
</style>