<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="modal-content"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" :id="titleId">
            <i class="bi bi-play-circle me-2"></i>
            Practice Session: {{ skill?.name }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
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
                custom-class="quality-btn"
                @click="selectQuality(option.value)"
              >
                <div class="d-flex align-items-center justify-content-between w-100">
                  <div>
                    <i :class="`bi ${option.icon} me-2`"></i>
                    <strong>{{ option.label }}</strong>
                  </div>
                  <div class="text-end">
                    <small class="d-block">{{ option.description }}</small>
                    <small class="text-muted">+{{ option.xp }} XP</small>
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
        </div>

        <!-- Footer -->
        <div class="modal-footer">
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
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SkillData } from '@/types/skill'
import { SpacedRepetitionService } from '@/services/core/SpacedRepetitionService'
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
const titleId = computed(() => 'practiceRatingModal-title')

const qualityOptions = [
  {
    label: 'Forgotten',
    description: 'Could not perform the skill',
    icon: 'bi-x-circle',
    color: 'danger' as const,
    xp: 0,
    value: 1
  },
  {
    label: 'Hard',
    description: 'Struggled but eventually got it',
    icon: 'bi-exclamation-triangle',
    color: 'warning' as const,
    xp: 1,
    value: 2
  },
  {
    label: 'Good',
    description: 'Performed well with minor issues',
    icon: 'bi-check-circle',
    color: 'success' as const,
    xp: 2,
    value: 3
  },
  {
    label: 'Very Easy',
    description: 'Flawless execution, felt natural',
    icon: 'bi-star-fill',
    color: 'primary' as const,
    xp: 3,
    value: 4
  }
] as const

const selectQuality = (quality: number) => {
  selectedQuality.value = quality
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

const handleOverlayClick = () => {
  emit('close')
}

// Watch for modal visibility changes to reset form when modal opens
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    resetForm()
    // TODO: For acquisition mode skills, default to level-up (will be implemented later)
    // if (props.skill?.status === 'acquisition') {
    //   isLevelUp.value = true
    // }
  }
})

// Reset form when modal closes
defineExpose({
  resetForm,
  isLevelUp
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
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

.quality-btn {
  text-align: left;
  transition: all 0.2s ease-in-out;
}

.quality-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.quality-btn.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
}

.quality-btn.btn-warning {
  background: linear-gradient(135deg, #ffc107, #e0a800);
  border: none;
  color: #000;
}

.quality-btn.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border: none;
}

.quality-btn.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
}
</style>