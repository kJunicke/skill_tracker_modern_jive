<template>
  <div class="card">
    <div class="card-header">
      <h5 class="card-title mb-0">
        <i class="bi bi-calendar-week me-2"></i>
        Training Schedule Configuration
      </h5>
      <small class="text-muted">
        Configure your weekly training days for skills with weekly spaced repetition
      </small>
    </div>
    <div class="card-body">
      <!-- Current Schedule Display -->
      <div class="mb-4">
        <h6 class="fw-bold">Current Schedule:</h6>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span
            v-for="dayName in trainingScheduleStore.trainingDayNames"
            :key="dayName"
            class="badge bg-success"
          >
            <i class="bi bi-check-circle me-1"></i>
            {{ dayName }}
          </span>
        </div>
        <div class="text-muted">
          <i class="bi bi-info-circle me-1"></i>
          <strong>{{ trainingScheduleStore.trainingSchedule.frequency }} training days per week</strong>
          <span v-if="trainingScheduleStore.nextTrainingDay !== null">
            - Next training day: {{ trainingScheduleStore.weekDayNames[trainingScheduleStore.nextTrainingDay] }}
          </span>
        </div>
      </div>

      <!-- Day Selection -->
      <div class="mb-4">
        <h6 class="fw-bold">Select Training Days:</h6>
        <div class="row g-2">
          <div
            v-for="(dayName, dayIndex) in trainingScheduleStore.weekDayNames"
            :key="dayIndex"
            class="col-6 col-md-4 col-lg-3"
          >
            <div class="form-check">
              <input
                :id="`training-day-${dayIndex}`"
                v-model="selectedDays"
                :value="dayIndex"
                type="checkbox"
                class="form-check-input"
                :disabled="selectedDays.length === 1 && selectedDays.includes(dayIndex)"
              >
              <label
                :for="`training-day-${dayIndex}`"
                class="form-check-label"
                :class="{ 'text-muted': selectedDays.length === 1 && selectedDays.includes(dayIndex) }"
              >
                <i class="bi bi-calendar-day me-1"></i>
                {{ dayName }}
              </label>
            </div>
          </div>
        </div>
        
        <!-- Validation Message -->
        <div v-if="validationError" class="mt-2 text-danger">
          <i class="bi bi-exclamation-triangle me-1"></i>
          {{ validationError }}
        </div>
        
        <!-- Helper Text -->
        <small class="text-muted mt-2 d-block">
          <i class="bi bi-info-circle me-1"></i>
          Select at least one training day. You can select multiple days for more frequent training.
        </small>
      </div>

      <!-- Quick Presets -->
      <div class="mb-4">
        <h6 class="fw-bold">Quick Presets:</h6>
        <div class="d-flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="applyPreset([2])"
          >
            <i class="bi bi-calendar-day me-1"></i>
            Nur Dienstag
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="applyPreset([4])"
          >
            <i class="bi bi-calendar-day me-1"></i>
            Nur Donnerstag
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            @click="applyPreset([2, 4])"
          >
            <i class="bi bi-calendar2-week me-1"></i>
            Di + Do (2x/week)
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            @click="resetToDefault"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            Reset Default
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2 justify-content-end">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="cancelChanges"
          :disabled="!hasChanges"
        >
          <i class="bi bi-x-circle me-1"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-success"
          @click="saveSchedule"
          :disabled="!hasChanges || hasValidationError"
        >
          <i class="bi bi-check-circle me-1"></i>
          Save Schedule
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTrainingScheduleStore } from '@/stores/trainingScheduleStore'
import { useToasts } from '@/composables/useToasts'

const trainingScheduleStore = useTrainingScheduleStore()
const { showSuccess, showError } = useToasts()

// Local state for editing
const selectedDays = ref<number[]>([...trainingScheduleStore.trainingSchedule.trainingDays])
const validationError = ref('')

// Computed properties
const hasChanges = computed(() => {
  const current = [...trainingScheduleStore.trainingSchedule.trainingDays].sort()
  const selected = [...selectedDays.value].sort()
  return JSON.stringify(current) !== JSON.stringify(selected)
})

const hasValidationError = computed(() => {
  return validationError.value !== ''
})

// Watch for changes in selected days to validate
watch(selectedDays, (newDays) => {
  if (newDays.length === 0) {
    validationError.value = 'At least one training day must be selected'
  } else {
    validationError.value = ''
  }
}, { deep: true })

// Methods
function applyPreset(days: number[]): void {
  selectedDays.value = [...days]
}

function resetToDefault(): void {
  selectedDays.value = [2, 4] // Tuesday, Thursday
}

function cancelChanges(): void {
  selectedDays.value = [...trainingScheduleStore.trainingSchedule.trainingDays]
  validationError.value = ''
}

function saveSchedule(): void {
  try {
    if (selectedDays.value.length === 0) {
      showError('Validation Error', 'At least one training day must be selected')
      return
    }
    
    trainingScheduleStore.updateTrainingDays(selectedDays.value)
    showSuccess('Schedule Updated', `Training schedule saved: ${selectedDays.value.length} days per week`)
  } catch (error) {
    console.error('Error saving training schedule:', error)
    showError('Save Failed', error instanceof Error ? error.message : 'Unable to save training schedule')
  }
}

// Initialize selected days from store
watch(
  () => trainingScheduleStore.trainingSchedule.trainingDays,
  (newDays) => {
    if (!hasChanges.value) {
      selectedDays.value = [...newDays]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.form-check-label {
  cursor: pointer;
  user-select: none;
}

.form-check-input:disabled + .form-check-label {
  cursor: not-allowed;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.card-header {
  border-bottom: 2px solid var(--bs-border-color);
}

.btn-group-toggle .btn {
  border-radius: 0.375rem !important;
}
</style>