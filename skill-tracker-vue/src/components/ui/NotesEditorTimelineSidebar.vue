<template>
  <div class="timeline-sidebar-container">
    <div class="timeline-sidebar-header">
      <h6 class="mb-0">
        <i class="bi bi-clock-history me-2"></i>
        Progression Timeline
      </h6>
    </div>
    <div class="timeline-sidebar-content">
      <SkillTimelineContent 
        v-if="skill"
        :skill="skill" 
        :is-modal-view="false"
        @add-to-notes="(content: string) => $emit('add-to-notes', content)"
        @edit-levelup-comment="(skillId: string, levelUpData: ProgressionEntry) => $emit('edit-levelup-comment', skillId, levelUpData)"
        @edit-practice-note="(skillId: string, practiceData: PracticeSession) => $emit('edit-practice-note', skillId, practiceData)"
        @edit-quick-note="(skillId: string, noteDate: string, currentNote: string) => $emit('edit-quick-note', skillId, noteDate, currentNote)"
        @delete-quick-note="(skillId: string, noteDate: string) => $emit('delete-quick-note', skillId, noteDate)"
        @toggle-transferred-to-notes="(skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string) => $emit('toggle-transferred-to-notes', skillId, entryType, entryDate)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import SkillTimelineContent from './SkillTimelineContent.vue'

interface Props {
  skill: SkillData | null
}

interface Emits {
  (e: 'add-to-notes', content: string): void
  (e: 'edit-levelup-comment', skillId: string, levelUpData: ProgressionEntry): void
  (e: 'edit-practice-note', skillId: string, practiceData: PracticeSession): void
  (e: 'edit-quick-note', skillId: string, noteDate: string, currentNote: string): void
  (e: 'delete-quick-note', skillId: string, noteDate: string): void
  (e: 'toggle-transferred-to-notes', skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.timeline-sidebar-container {
  border-left: 2px solid #dee2e6;
  padding-left: 1rem;
  height: 450px;
  display: flex;
  flex-direction: column;
}

.timeline-sidebar-header {
  flex-shrink: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 0.75rem;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.timeline-sidebar-content {
  flex: 1;
  overflow-y: auto;
  pointer-events: auto;
}

.timeline-sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.timeline-sidebar-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.timeline-sidebar-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.timeline-sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>