<template>
  <!-- Unified Timeline Modal -->
  <BaseModal
    modal-id="progressionTimelineModal"
    :title="`Progression Timeline: ${skill?.name}`"
    icon="bi-clock-history"
    header-variant="info"
    size="lg"
    centered
    scrollable
    hide-footer
    data-testid="timeline-modal"
    :is-visible="isVisible"
    @close="$emit('close')"
  >
    <div v-if="currentSkill">
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
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import { getDaysUntilReview } from '@/utils/spacedRepetition'
import { useSkillStore } from '@/stores/skillStore'
import SkillTimelineContent from './SkillTimelineContent.vue'
import BaseModal from '@/components/base/BaseModal.vue'

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

// Get the current skill from store instead of using the prop copy
const currentSkill = computed(() => {
  if (!props.skill?.id) return null
  return skillStore.skills.find(s => s.id === props.skill!.id) || props.skill
})

const nextReviewDays = computed(() => {
  if (!currentSkill.value) return 0
  const days = getDaysUntilReview(currentSkill.value)
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
</script>

<style scoped>
/* Styles already handled by BaseModal */
</style>