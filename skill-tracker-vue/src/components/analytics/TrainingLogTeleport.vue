<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="modal-content modal-xl"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="modal-header modal-header-training">
          <h5 class="modal-title" :id="titleId">
            <i class="bi bi-journal-text me-2"></i>
            Training Log
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
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

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Close
          </button>
          <TrainingLogExport :activities="filteredActivities" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef, computed } from 'vue'
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

const titleId = computed(() => 'trainingLogModal-title')

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

const handleOverlayClick = () => {
  // Allow closing on overlay click for TrainingLog as it's a read-only modal
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-xl {
  max-width: 1200px;
  width: 95%;
}

.modal-header {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  opacity: 0.8;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>