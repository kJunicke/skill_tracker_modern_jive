<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="modal-content modal-lg"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" :id="titleId">
            <i class="bi bi-clock-history me-2"></i>
            Progression Timeline: {{ skill?.name }}
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
          <!-- Error state when skill cannot be found in store -->
          <div v-if="!currentSkill && props.skill?.id" class="text-center text-muted py-5">
            <i class="bi bi-exclamation-triangle fs-1"></i>
            <p class="mt-3 mb-0">Unable to load skill data</p>
            <small class="text-muted">The skill may have been deleted or modified</small>
          </div>
          
          <div v-else-if="currentSkill">
            <!-- Unified Timeline Component -->
            <SkillTimelineContent
              :skill="currentSkill"
              :is-modal-view="true"
              @edit-levelup-comment="handleEditLevelUpComment"
              @edit-practice-note="handleEditPracticeNote"
              @edit-quick-note="handleEditQuickNote"
              @delete-quick-note="handleDeleteQuickNote"
              @toggle-transferred-to-notes="handleToggleTransferredToNotes"
            />

            <!-- SM2 Statistics -->
            <div class="card mt-4 bg-light">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-graph-up me-2"></i>
                  Spaced Repetition Statistics
                </h6>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-3">
                    <h5 class="text-primary">{{ currentSkill.easeFactor?.toFixed(2) || '2.50' }}</h5>
                    <small class="text-muted">Ease Factor</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-info">{{ currentSkill.repetitions || 0 }}</h5>
                    <small class="text-muted">Repetitions</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-warning">{{ currentSkill.interval || 1 }}</h5>
                    <small class="text-muted">Interval (days)</small>
                  </div>
                  <div class="col-md-3">
                    <h5 class="text-success">{{ nextReviewDays }}</h5>
                    <small class="text-muted">Next Review</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import { SpacedRepetitionService } from '@/services/core/SpacedRepetitionService'
import { useSkillStore } from '@/stores/skillStore'
import SkillTimelineContent from './SkillTimelineContent.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'edit-notes', skillId: string): void
  (e: 'edit-levelup-comment', skillId: string, levelUpData: ProgressionEntry): void
  (e: 'edit-practice-note', skillId: string, practiceData: PracticeSession): void
  (e: 'edit-quick-note', skillId: string, noteDate: string, currentNote: string): void
  (e: 'delete-quick-note', skillId: string, noteDate: string): void
  (e: 'toggle-transferred-to-notes', skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const skillStore = useSkillStore()
const titleId = computed(() => 'progressionTimelineModal-title')

// Get the current skill from store instead of using the prop copy
// Never use the static prop as fallback to prevent stale data issues
const currentSkill = computed(() => {
  if (!props.skill?.id) return null
  return skillStore.skills.find(s => s.id === props.skill!.id) || null
})

const nextReviewDays = computed(() => {
  if (!currentSkill.value) return 0
  const service = new SpacedRepetitionService()
  const days = service.getDaysUntilReview(currentSkill.value)
  return days > 0 ? `${days} days` : 'Today'
})

const handleEditLevelUpComment = (skillId: string, levelUpData: ProgressionEntry) => {
  emit('edit-levelup-comment', skillId, levelUpData)
}

const handleEditPracticeNote = (skillId: string, practiceData: PracticeSession) => {
  emit('edit-practice-note', skillId, practiceData)
}

const handleEditQuickNote = (skillId: string, noteDate: string, currentNote: string) => {
  emit('edit-quick-note', skillId, noteDate, currentNote)
}

const handleDeleteQuickNote = (skillId: string, noteDate: string) => {
  emit('delete-quick-note', skillId, noteDate)
}

const handleToggleTransferredToNotes = (skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string) => {
  emit('toggle-transferred-to-notes', skillId, entryType, entryDate)
}

const handleOverlayClick = () => {
  emit('close')
}
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

.modal-lg {
  max-width: 900px;
  width: 90%;
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
</style>