<template>
  <!-- All Modals -->
  <div>
    <SkillModal
      v-if="modalStates.skill.isVisible"
      data-testid="skill-modal"
      :skill="modalStates.skill.selectedSkill"
      :is-visible="modalStates.skill.isVisible"
      @save="$emit('save-skill', $event)"
      @close="$emit('close-skill-modal')"
    />

    <PracticeRating
      v-if="modalStates.practice.isVisible"
      :key="modalKey"
      data-testid="practice-rating"
      :skill="modalStates.practice.selectedSkill"
      :is-visible="modalStates.practice.isVisible"
      @practice-complete="(skillId, quality, notes, isLevelUp, levelUpComment) => $emit('practice-complete', skillId, quality, notes, isLevelUp, levelUpComment)"
      @close="$emit('close-practice-modal')"
    />

    <TimelineModal
      v-if="modalStates.timeline.isVisible"
      data-testid="timeline-modal"
      :skill="modalStates.timeline.selectedSkill"
      :is-visible="modalStates.timeline.isVisible"
      @close="$emit('close-timeline-modal')"
      @edit-notes="$emit('edit-notes', $event)"
      @edit-levelup-comment="(skillId, levelUpData) => $emit('edit-levelup-comment', skillId, levelUpData)"
      @edit-practice-note="(skillId, practiceData) => $emit('edit-practice-note', skillId, practiceData)"
      @edit-quick-note="(skillId, noteDate, currentNote) => $emit('edit-quick-note', skillId, noteDate, currentNote)"
      @delete-quick-note="(skillId, noteDate) => $emit('delete-quick-note', skillId, noteDate)"
      @toggle-transferred-to-notes="(skillId, entryType, entryDate) => $emit('toggle-transferred-to-notes', skillId, entryType, entryDate)"
    />

    <StatusEditor
      v-if="modalStates.status.isVisible"
      data-testid="status-editor"
      :skill="modalStates.status.selectedSkill"
      :is-visible="modalStates.status.isVisible"
      @status-changed="(skillId, newStatus) => $emit('status-changed', {skillId, newStatus})"
      @close="$emit('close-status-modal')"
    />

    <TagsEditor
      v-if="modalStates.tags.isVisible"
      data-testid="tags-editor"
      :skill="modalStates.tags.selectedSkill"
      :is-visible="modalStates.tags.isVisible"
      @tags-changed="(skillId, newTags) => $emit('tags-changed', {skillId, newTags})"
      @close="$emit('close-tags-modal')"
    />

    <NotesEditor
      v-if="modalStates.notes.isVisible"
      data-testid="notes-editor"
      :skill="modalStates.notes.selectedSkill"
      :is-visible="modalStates.notes.isVisible"
      @notes-changed="(skillId, newNotes) => $emit('notes-changed', skillId, newNotes)"
      @close="$emit('close-notes-modal')"
      @edit-levelup-comment="(skillId, levelUpData) => $emit('edit-levelup-comment', skillId, levelUpData)"
      @edit-practice-note="(skillId, practiceData) => $emit('edit-practice-note', skillId, practiceData)"
      @edit-quick-note="(skillId, noteDate, currentNote) => $emit('edit-quick-note', skillId, noteDate, currentNote)"
      @delete-quick-note="(skillId, noteDate) => $emit('delete-quick-note', skillId, noteDate)"
      @toggle-transferred-to-notes="(skillId, entryType, entryDate) => $emit('toggle-transferred-to-notes', skillId, entryType, entryDate)"
    />

    <TrainingLog
      v-if="modalStates.trainingLog.isVisible"
      data-testid="training-log"
      :skills="skills"
      :is-visible="modalStates.trainingLog.isVisible"
      @close="$emit('close-training-log-modal')"
    />

    <StatusTransitionConfirmation
      :show="modalStates.statusTransition.isVisible"
      :skill="modalStates.statusTransition.selectedSkill"
      :suggested-status="modalStates.statusTransition.suggestedStatus"
      :reason="modalStates.statusTransition.reason"
      @confirm="(skillId, newStatus) => $emit('status-transition-confirm', skillId, newStatus)"
      @cancel="$emit('close-status-transition-modal')"
    />

  </div>
</template>

<script setup lang="ts">
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'
import SkillModal from '@/components/skills/SkillModal.vue'
import PracticeRating from '@/components/training/PracticeRating.vue'
import TimelineModal from '@/components/ui/TimelineModal.vue'
import StatusEditor from '@/components/ui/StatusEditor.vue'
import TagsEditor from '@/components/ui/TagsEditor.vue'
import NotesEditor from '@/components/ui/NotesEditor.vue'
import TrainingLog from '@/components/analytics/TrainingLog.vue'
import StatusTransitionConfirmation from '@/components/modals/StatusTransitionConfirmation.vue'

interface ModalStates {
  skill: { selectedSkill: SkillData | null; isVisible: boolean }
  practice: { selectedSkill: SkillData | null; isVisible: boolean }
  timeline: { selectedSkill: SkillData | null; isVisible: boolean }
  status: { selectedSkill: SkillData | null; isVisible: boolean }
  tags: { selectedSkill: SkillData | null; isVisible: boolean }
  notes: { selectedSkill: SkillData | null; isVisible: boolean }
  trainingLog: { isVisible: boolean }
  statusTransition: { 
    selectedSkill: SkillData | null; 
    isVisible: boolean; 
    suggestedStatus?: SkillStatus; 
    reason: string 
  }
}

interface Props {
  skills: SkillData[]
  modalStates: ModalStates
  modalKey: number
}

interface Emits {
  (e: 'save-skill', value: SkillData): void
  (e: 'close-skill-modal'): void
  (e: 'practice-complete', skillId: string, quality: number, notes: string, isLevelUp?: boolean, levelUpComment?: string): void
  (e: 'close-practice-modal'): void
  (e: 'close-timeline-modal'): void
  (e: 'edit-notes', value: string): void
  (e: 'edit-levelup-comment', skillId: string, levelUpData: ProgressionEntry): void
  (e: 'edit-practice-note', skillId: string, practiceData: PracticeSession): void
  (e: 'edit-quick-note', skillId: string, noteDate: string, currentNote: string): void
  (e: 'delete-quick-note', skillId: string, noteDate: string): void
  (e: 'toggle-transferred-to-notes', skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string): void
  (e: 'status-changed', value: {skillId: string, newStatus: string}): void
  (e: 'close-status-modal'): void
  (e: 'tags-changed', value: {skillId: string, newTags: string[]}): void
  (e: 'close-tags-modal'): void
  (e: 'notes-changed', skillId: string, newNotes: string): void
  (e: 'close-notes-modal'): void
  (e: 'close-training-log-modal'): void
  (e: 'status-transition-confirm', skillId: string, newStatus: SkillStatus): void
  (e: 'close-status-transition-modal'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>