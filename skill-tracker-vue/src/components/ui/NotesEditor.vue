<template>
  <!-- Notes Editor Modal -->
  <div 
    class="modal fade" 
    id="notesEditorModal" 
    tabindex="-1" 
    aria-labelledby="notesEditorModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered" :class="{ 'modal-xl': showTimeline, 'modal-lg': !showTimeline }">
      <div class="modal-content">
        <!-- Header -->
        <NotesEditorHeader
          :skill-name="skill?.name"
          :show-timeline-toggle="!!skill"
          :timeline-visible="showTimeline"
          @toggle-timeline="toggleTimeline"
          @close="$emit('close')"
        />
        
        <!-- Body -->
        <div class="modal-body">
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
        </div>
        
        <!-- Footer -->
        <NotesEditorFooter
          :has-changes="hasChanges"
          :has-existing-notes="!!skill?.notes"
          @cancel="$emit('close')"
          @save="saveNotes"
          @clear="clearNotes"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession } from '@/types/skill'
import { useSkillStore } from '@/stores/skillStore'
import '@/styles/markdown.css'
import { SKILL_NOTES_PLACEHOLDER } from '@/composables/useMarkdown'
import NotesEditorHeader from './NotesEditorHeader.vue'
import NotesEditorPanel from './NotesEditorPanel.vue'
import NotesEditorTimelineSidebar from './NotesEditorTimelineSidebar.vue'
import MarkdownFormattingGuide from './MarkdownFormattingGuide.vue'
import NotesEditorFooter from './NotesEditorFooter.vue'

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
.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Smooth transition for layout changes */
.modal-dialog {
  transition: max-width 0.3s ease-in-out;
}

.col-md-6, .col-12 {
  transition: all 0.3s ease-in-out;
}
</style>