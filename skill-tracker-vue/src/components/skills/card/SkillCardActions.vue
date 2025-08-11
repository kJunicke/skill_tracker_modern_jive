<template>
  <div class="skill-card-actions">
    <!-- Quick Notes -->
    <div v-if="skill.status !== 'backlog' && skill.status !== 'archived'" class="mb-3">
      <div v-if="!showQuickNotes" class="text-center">
        <BaseButton
          variant="secondary"
          outline
          size="sm"
          icon="bi-chat-left-text"
          text="Quick Note"
          @click="toggleQuickNotes"
        />
      </div>
      <div v-if="showQuickNotes" class="quick-notes-input">
        <textarea
          ref="quickNotesTextarea"
          v-model="quickNote"
          class="form-control form-control-sm"
          rows="3"
          placeholder="Add a quick note about this skill..."
          @keydown.enter.exact="saveQuickNote"
          @keydown.escape="cancelQuickNote"
        ></textarea>
        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">Press Enter to save, Esc to cancel</small>
          <div>
            <BaseButton
              variant="secondary"
              outline
              size="sm"
              text="Cancel"
              custom-class="me-2"
              @click="cancelQuickNote"
            />
            <BaseButton
              variant="primary"
              size="sm"
              text="Save"
              :disabled="!quickNote.trim()"
              @click="saveQuickNote"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Practice button -->
    <div v-if="skill.status !== 'backlog' && skill.status !== 'archived'" class="mt-3">
      <BaseButton
        variant="primary"
        size="sm"
        block
        icon="bi-play-circle"
        text="Practice"
        custom-class="practice-btn"
        @click="handlePractice"
      />
    </div>

    <!-- Move to Acquisition button for backlog skills -->
    <div v-if="skill.status === 'backlog'" class="mt-3">
      <BaseButton
        variant="warning"
        size="sm"
        block
        icon="bi-plus-circle"
        text="Start Learning"
        @click="handleMoveToAcquisition"
      />
    </div>

    <!-- Level up button for focus mode -->
    <div v-if="skill.status === 'focus' && skill.focusData?.readyForLevelUp" class="mt-2">
      <BaseButton
        variant="success"
        size="sm"
        block
        icon="bi-arrow-up-circle"
        :text="`Level Up to ${skill.level + 1}!`"
        :custom-class="`level-up-btn ${skill.focusData.readyForLevelUp ? 'ready-pulse' : ''}`"
        @click="handleLevelUp"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import type { SkillData } from '@/types/skill'
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  skill: SkillData
}

interface Emits {
  (e: 'practice-rating', skillId: string): void
  (e: 'level-up', skillId: string): void
  (e: 'move-to-acquisition', skillId: string): void
  (e: 'quick-note', skillId: string, note: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Quick notes functionality
const showQuickNotes = ref(false)
const quickNote = ref('')
const quickNotesTextarea = useTemplateRef<HTMLTextAreaElement>('quickNotesTextarea')

const toggleQuickNotes = async () => {
  showQuickNotes.value = !showQuickNotes.value
  if (showQuickNotes.value) {
    quickNote.value = ''
    await nextTick() // Wait for DOM update
    quickNotesTextarea.value?.focus() // Focus the textarea
  }
}

const saveQuickNote = () => {
  if (quickNote.value.trim()) {
    emit('quick-note', props.skill.id, quickNote.value.trim())
    quickNote.value = ''
    showQuickNotes.value = false
  }
}

const cancelQuickNote = () => {
  quickNote.value = ''
  showQuickNotes.value = false
}

const handlePractice = () => {
  emit('practice-rating', props.skill.id)
}

const handleLevelUp = () => {
  emit('level-up', props.skill.id)
}

const handleMoveToAcquisition = () => {
  emit('move-to-acquisition', props.skill.id)
}
</script>

<style scoped>
.skill-card-actions {
  margin-top: auto;
}

.quick-notes-input textarea {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  resize: vertical;
}

.practice-btn {
  transition: all 0.2s ease-in-out;
}

.practice-btn:hover {
  transform: translateY(-1px);
}

.level-up-btn.ready-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
  }
}
</style>