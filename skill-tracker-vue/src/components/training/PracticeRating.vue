<template>
  <!-- Practice Rating Modal -->
  <BaseModal
    modal-id="practiceRatingModal"
    :title="`Practice Session: ${skill?.name}`"
    icon="bi-play-circle"
    header-variant="primary"
    centered
    :confirm-text="isLevelUp ? 'Submit Practice & Level Up' : 'Submit Rating'"
    confirm-icon="bi-check-circle"
    :confirm-disabled="selectedQuality === null || (isLevelUp && !levelUpComment.trim())"
    data-testid="practice-rating"
    :is-visible="isVisible"
    @close="$emit('close')"
    @cancel="$emit('close')"
    @confirm="submitRating"
  >
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

            <!-- Session Notes -->
            <div class="mb-4">
              <label for="sessionNotes" class="form-label">
                <i class="bi bi-journal-text me-1"></i>
                Session Notes (Optional)
              </label>
              <textarea
                id="sessionNotes"
                v-model="sessionNotes"
                class="form-control"
                rows="3"
                placeholder="What did you work on? Any insights or challenges?"
              ></textarea>
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

            <!-- Level-Up Comment (Required when level-up is checked) -->
            <div v-if="isLevelUp" class="mb-4">
              <label for="levelUpComment" class="form-label">
                <i class="bi bi-star me-1"></i>
                Level-Up Comment <span class="text-danger">*</span>
              </label>
              <textarea
                id="levelUpComment"
                v-model="levelUpComment"
                class="form-control"
                rows="3"
                placeholder="Describe what you've mastered and why you're ready to level up..."
                required
              ></textarea>
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
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SkillData } from '@/types/skill'
import { calculateNextReview } from '@/utils/spacedRepetition'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'practice-complete', skillId: string, quality: number, notes: string, isLevelUp?: boolean, levelUpComment?: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedQuality = ref<number | null>(null)
const sessionNotes = ref('')
const isLevelUp = ref(false)
const levelUpComment = ref('')

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

const getNextReviewDays = (quality: number): number => {
  if (!props.skill) return 0
  
  // Use quality directly since it's now 1-4 scale
  const nextReview = calculateNextReview(props.skill, quality)
  const today = new Date()
  const reviewDate = new Date(nextReview)
  const diffTime = reviewDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getNextReviewDate = (quality: number): string => {
  if (!props.skill) return ''
  
  // Use quality directly since it's now 1-4 scale
  const nextReview = calculateNextReview(props.skill, quality)
  return new Date(nextReview).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const submitRating = () => {
  if (!props.skill || selectedQuality.value === null) return
  if (isLevelUp.value && !levelUpComment.value.trim()) return
  
  emit(
    'practice-complete', 
    props.skill.id, 
    selectedQuality.value, 
    sessionNotes.value,
    isLevelUp.value,
    isLevelUp.value ? levelUpComment.value : undefined
  )
  
  // Reset form
  selectedQuality.value = null
  sessionNotes.value = ''
  isLevelUp.value = false
  levelUpComment.value = ''
}

// Watch for modal visibility changes to reset form
const resetForm = () => {
  selectedQuality.value = null
  sessionNotes.value = ''
  isLevelUp.value = false
  levelUpComment.value = ''
}

// Reset form when modal closes
defineExpose({
  resetForm
})
</script>

<style scoped>
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

.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}
</style>