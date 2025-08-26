<template>
  <BaseTeleportModal
    :isVisible="isVisible"
    title="Practice Session"
    headerType="practice"
    @close="$emit('close')"
  >
    <template #title>
      <i class="bi bi-play-circle me-2"></i>
      Practice Session: {{ skill?.name }}
    </template>

    <div v-if="skill" class="text-center">
      <!-- Skill Info -->
      <div class="mb-4">
        <h6 class="text-muted">How did your practice session go?</h6>
        <small class="text-muted">
          Rate your performance to update the SM2 spaced repetition schedule
        </small>
      </div>

      <!-- Quality Rating Buttons -->
      <div class="d-grid gap-3 mb-4">
        <BaseButton
          v-for="(option, index) in qualityOptions"
          :key="index"
          :variant="option.color"
          :outline="selectedQuality !== option.value"
          size="lg"
          :custom-class="`quality-btn ${selectedQuality === option.value ? 'quality-btn-selected' : ''}`"
          @click="selectQuality(option.value)"
        >
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center">
              <i :class="`bi ${option.icon} me-2 quality-icon`"></i>
              <strong>{{ option.label }}</strong>
              <i v-if="selectedQuality === option.value" class="bi bi-check-circle-fill ms-2 text-success"></i>
            </div>
            <div class="text-end">
              <small class="d-block quality-description">{{ option.description }}</small>
              <small class="d-block text-muted mt-1">
                {{ getQualityHelperText(option.value) }}
              </small>
            </div>
          </div>
        </BaseButton>
      </div>

      <!-- Session Notes (becomes required when level-up is checked) -->
      <div class="mb-4">
        <label for="sessionNotes" class="form-label">
          <i class="bi bi-journal-text me-1"></i>
          Session Notes 
          <span v-if="isLevelUp" class="text-danger">*</span>
          <span v-else>(Optional)</span>
        </label>
        <textarea
          id="sessionNotes"
          v-model="sessionNotes"
          class="form-control"
          rows="3"
          :placeholder="isLevelUp ? 'Describe your practice and what you mastered for this level-up...' : 'What did you work on? Any insights or challenges?'"
          :required="isLevelUp"
        ></textarea>
        <small v-if="isLevelUp" class="text-muted">
          When leveling up, describe both your practice session and what you've mastered.
        </small>
      </div>

      <!-- Level-Up Toggle Button -->
      <div class="mb-4 text-center">
        <BaseButton
          variant="success"
          :outline="!isLevelUp"
          size="lg"
          block
          icon="bi-arrow-up-circle"
          @click="isLevelUp = !isLevelUp"
        >
          This practice session represents a level-up
          <i v-if="isLevelUp" class="bi bi-check-circle ms-2"></i>
        </BaseButton>
      </div>

      <!-- Level Up Preview -->
      <div v-if="isLevelUp && skill" class="alert alert-success mb-4">
        <h6><i class="bi bi-trophy me-2"></i>Level Up!</h6>
        <p class="mb-0">
          <strong>Level {{ skill.level }} → Level {{ skill.level + 1 }}</strong>
        </p>
      </div>

      <!-- Next Review Preview -->
      <div v-if="selectedQuality !== null" class="alert alert-info">
        <h6><i class="bi bi-calendar3 me-2"></i>Next Review Schedule</h6>
        <p class="mb-0">
          Based on your rating, your next review will be in 
          <strong>{{ getNextReviewDays(selectedQuality) }} days</strong>
          ({{ getNextReviewDate(selectedQuality) }})
        </p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('close')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="selectedQuality === null || (isLevelUp && !sessionNotes.trim())"
        @click="submitRating"
      >
        <i class="bi bi-check-circle me-2"></i>
        {{ isLevelUp ? 'Submit Practice & Level Up' : 'Submit Rating' }}
      </button>
    </template>
  </BaseTeleportModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SkillData } from '@/types/skill'
import { SpacedRepetitionService } from '@/services/core/SpacedRepetitionService'
import BaseTeleportModal from '@/components/base/BaseTeleportModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'practice-complete', skillId: string, quality: number, notes: string, isLevelUp?: boolean): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedQuality = ref<number | null>(null)
const sessionNotes = ref('')
const isLevelUp = ref(false)

const qualityOptions = [
  {
    label: 'Forgotten',
    description: 'Could not perform the skill',
    icon: 'bi-x-circle',
    color: 'danger' as const,
    value: 1
  },
  {
    label: 'Hard',
    description: 'Struggled but eventually got it',
    icon: 'bi-exclamation-triangle',
    color: 'warning' as const,
    value: 2
  },
  {
    label: 'Good',
    description: 'Performed well with minor issues',
    icon: 'bi-check-circle',
    color: 'success' as const,
    value: 3
  },
  {
    label: 'Very Easy',
    description: 'Flawless execution, felt natural',
    icon: 'bi-star-fill',
    color: 'primary' as const,
    value: 4
  }
] as const

const selectQuality = (quality: number) => {
  selectedQuality.value = quality
}

const getQualityHelperText = (quality: number): string => {
  const helperTexts: Record<number, string> = {
    1: 'Schedule will reset - need more practice',
    2: 'Shorter interval - keep working on it',
    3: 'Good progress - standard interval',
    4: 'Excellent! Longer interval earned'
  }
  return helperTexts[quality] || ''
}

const spacedRepetitionService = new SpacedRepetitionService()

const getNextReviewDays = (quality: number): number => {
  if (!props.skill) return 0
  
  const nextReview = spacedRepetitionService.calculateNextReview(props.skill, quality)
  const today = new Date()
  const reviewDate = new Date(nextReview)
  const diffTime = reviewDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getNextReviewDate = (quality: number): string => {
  if (!props.skill) return ''
  
  const nextReview = spacedRepetitionService.calculateNextReview(props.skill, quality)
  return new Date(nextReview).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const submitRating = () => {
  if (!props.skill || selectedQuality.value === null) return
  if (isLevelUp.value && !sessionNotes.value.trim()) return
  
  emit(
    'practice-complete', 
    props.skill.id, 
    selectedQuality.value, 
    sessionNotes.value,
    isLevelUp.value
  )
  
  // Reset form
  selectedQuality.value = null
  sessionNotes.value = ''
  isLevelUp.value = false
}

// Reset form function
const resetForm = () => {
  selectedQuality.value = null
  sessionNotes.value = ''
  isLevelUp.value = false
}


// Watch for modal visibility changes to reset form when modal opens
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    resetForm()
    // For acquisition mode skills, default to level-up
    if (props.skill?.status === 'acquisition') {
      isLevelUp.value = true
    }
  }
})

// Reset form when modal closes
defineExpose({
  resetForm,
  isLevelUp
})
</script>

<style scoped>
/* Modal styles are handled by BaseTeleportModal and /assets/modal.css */

/* Practice Rating specific styles */
.quality-btn {
  text-align: left;
  transition: all 0.3s ease-in-out;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.quality-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.quality-btn-selected {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.5) !important;
}

.quality-btn:active {
  transform: translateY(0);
}

.quality-icon {
  font-size: 1.2em;
  transition: transform 0.2s ease;
}

.quality-btn:hover .quality-icon {
  transform: scale(1.1);
}

.quality-description {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: color 0.2s ease;
}

.quality-btn:hover .quality-description {
  color: rgba(255, 255, 255, 1);
}

/* Enhanced button colors with better gradients */
.quality-btn.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
}

.quality-btn.btn-danger:hover {
  background: linear-gradient(135deg, #e85667, #dc3545);
}

.quality-btn.btn-warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  border: none;
  color: #000;
}

.quality-btn.btn-warning:hover {
  background: linear-gradient(135deg, #ffd43a, #ffc107);
}

.quality-btn.btn-warning .quality-description {
  color: rgba(0, 0, 0, 0.7);
}

.quality-btn.btn-warning:hover .quality-description {
  color: rgba(0, 0, 0, 0.9);
}

.quality-btn.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border: none;
}

.quality-btn.btn-success:hover {
  background: linear-gradient(135deg, #34ce57, #28a745);
}

.quality-btn.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
}

.quality-btn.btn-primary:hover {
  background: linear-gradient(135deg, #339dff, #007bff);
}

/* Selection animation */
.quality-btn-selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.quality-btn-selected:hover::before {
  left: 100%;
}
</style>