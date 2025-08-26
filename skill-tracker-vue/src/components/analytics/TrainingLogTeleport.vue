<template>
  <BaseTeleportModal
    :isVisible="isVisible"
    title="Training Log"
    headerType="training"
    size="xl"
    @close="$emit('close')"
  >
    <template #title>
      <i class="bi bi-journal-text me-2"></i>
      Training Log
    </template>

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

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('close')">
        Close
      </button>
      <TrainingLogExport :activities="filteredActivities" />
    </template>
  </BaseTeleportModal>
</template>

<script setup lang="ts">
import { ref, onMounted, toRef } from 'vue'
import type { SkillData } from '@/types/skill'
import BaseTeleportModal from '@/components/base/BaseTeleportModal.vue'
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
/* Modal styles are handled by BaseTeleportModal and /assets/modal.css */
</style>