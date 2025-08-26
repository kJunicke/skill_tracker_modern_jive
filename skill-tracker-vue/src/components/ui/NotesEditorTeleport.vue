<template>
  <BaseTeleportModal
    :isVisible="isVisible"
    title="Notes Editor"
    headerType="notes"
    :size="showTimeline ? 'xl' : 'lg'"
    @close="$emit('close')"
  >
    <template #title>
      <i class="bi bi-sticky me-2"></i>
      Edit Notes: {{ skill?.name }}
      <div class="d-flex align-items-center ms-auto">
        <button
          v-if="skill"
          type="button"
          class="btn btn-outline-light btn-sm me-2"
          @click="toggleTimeline"
          :title="showTimeline ? 'Hide timeline' : 'Show timeline'"
        >
          <i class="bi bi-hourglass-split" :class="{ 'text-warning': showTimeline }"></i>
        </button>
      </div>
    </template>
        
    <div v-if="skill">
      <div class="row">
        <!-- Notes Editor Column -->
        <div :class="showTimeline ? 'col-md-6' : 'col-12'">
          <NotesEditorPanel
            v-model:notes="editedNotes"
            :placeholder="placeholder"
            :editor-height="showTimeline ? '450px' : '300px'"
            :with-timeline="showTimeline"
            @character-count-update="updateCharacterCount"
            @edit-start="onEditStart"
            @edit-end="onEditEnd"
          />
        </div>
        
        <!-- Timeline Sidebar -->
        <div v-if="showTimeline" class="col-md-6">
          <NotesEditorTimelineSidebar
            :skill="currentSkill"
            @add-to-notes="handleAddToNotes"
            @edit-levelup-comment="handleEditLevelUpComment"
            @edit-practice-note="handleEditPracticeNote"
            @edit-quick-note="handleEditQuickNote"
            @delete-quick-note="handleDeleteQuickNote"
            @toggle-transferred-to-notes="handleToggleTransferredToNotes"
          />
        </div>
      </div>

      <!-- Markdown Formatting Guide -->
      <MarkdownFormattingGuide class="mb-4" />
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
        v-if="skill?.notes"
        type="button"
        class="btn btn-outline-danger"
        @click="clearNotes"
      >
        <i class="bi bi-trash me-2"></i>
        Clear Notes
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="!hasChanges"
        @click="saveNotes"
      >
        <i class="bi bi-check-circle me-2"></i>
        Save Notes
      </button>
    </template>
  </BaseTeleportModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import { useSkillStore } from '@/stores/skillStore'
import '@/styles/markdown.css'
import { SKILL_NOTES_PLACEHOLDER } from '@/composables/useMarkdown'
import BaseTeleportModal from '@/components/base/BaseTeleportModal.vue'
import NotesEditorPanel from './NotesEditorPanel.vue'
import NotesEditorTimelineSidebar from './NotesEditorTimelineSidebar.vue'
import MarkdownFormattingGuide from './MarkdownFormattingGuide.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'notes-changed', skillId: string, newNotes: string): void
  (e: 'close'): void
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

const editedNotes = ref('')
const characterCount = ref(0)
const showTimeline = ref(false)

const hasChanges = computed(() => {
  if (!props.skill) return false
  return (props.skill.notes || '') !== editedNotes.value
})

const placeholder = computed(() => SKILL_NOTES_PLACEHOLDER)

const updateCharacterCount = (count: number) => {
  characterCount.value = count
}

const onEditStart = () => {
  // Optional: Handle edit start event
}

const onEditEnd = () => {
  // Optional: Handle edit end event
}

const toggleTimeline = () => {
  showTimeline.value = !showTimeline.value
}

const handleAddToNotes = (content: string) => {
  editedNotes.value += content
  updateCharacterCount(editedNotes.value.length)
}

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

const saveNotes = () => {
  if (!props.skill || !hasChanges.value) return
  emit('notes-changed', props.skill.id, editedNotes.value.trim())
}

const clearNotes = () => {
  editedNotes.value = ''
  updateCharacterCount(0)
  if (props.skill) {
    emit('notes-changed', props.skill.id, '')
  }
}

const resetForm = () => {
  editedNotes.value = props.skill?.notes || ''
  updateCharacterCount((props.skill?.notes || '').length)
}


// Watch for skill changes to reset form
watch(() => props.skill, () => {
  if (props.skill) {
    resetForm()
  }
}, { immediate: true })

// Expose resetForm for parent components
defineExpose({
  resetForm
})
</script>

<style scoped>
/* Modal styles are handled by BaseTeleportModal and /assets/modal.css */

/* Smooth transition for layout changes */
.col-md-6, .col-12 {
  transition: all 0.3s ease-in-out;
}
</style>