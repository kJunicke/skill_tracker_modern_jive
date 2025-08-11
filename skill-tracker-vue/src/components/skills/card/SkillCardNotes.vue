<template>
  <div class="skill-card-notes">
    <!-- Notes preview -->
    <div v-if="skill.notes" class="mb-2">
      <div 
        class="clickable-notes" 
        @click="handleNotesEdit"
        style="cursor: pointer;"
      >
        <div class="notes-preview-container">
          <small class="text-muted d-block mb-1">
            <i class="bi bi-sticky me-1"></i>
            Notes:
          </small>
          <div class="notes-content">
            <MarkdownRenderer 
              :content="notesPreview"
              max-height="120px"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty notes placeholder -->
    <div v-else class="mb-2">
      <div 
        class="clickable-notes text-muted" 
        @click="handleNotesEdit"
        style="cursor: pointer;"
      >
        <small>
          <i class="bi bi-sticky me-1"></i>
          Click to add notes
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer.vue'

interface Props {
  skill: SkillData
}

interface Emits {
  (e: 'notes-edit', skillId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notesPreview = computed(() => {
  if (!props.skill.notes) return ''
  // For preview, we'll show the first 200 characters to allow for markdown formatting
  return props.skill.notes.length > 200 
    ? props.skill.notes.substring(0, 200) + '...'
    : props.skill.notes
})

const handleNotesEdit = () => {
  emit('notes-edit', props.skill.id)
}
</script>

<style scoped>
.clickable-notes:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
}

.notes-preview-container {
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.notes-content {
  max-height: 120px;
  overflow: hidden;
  position: relative;
  font-size: 0.75rem;
  line-height: 1.4;
}

/* Deep styling for markdown renderer */
.notes-content :deep(.markdown-base) {
  font-size: inherit;
  max-height: inherit;
  overflow: hidden;
}

.notes-content :deep(.md-editor-preview) {
  font-size: inherit;
  line-height: inherit;
  max-height: inherit;
}

.notes-content :deep(.md-editor-preview-wrapper) {
  max-height: inherit;
  overflow: hidden;
}

.notes-content :deep(.md-editor-preview p) {
  margin-bottom: 0.25rem;
}

.notes-content :deep(.md-editor-preview h1),
.notes-content :deep(.md-editor-preview h2),
.notes-content :deep(.md-editor-preview h3),
.notes-content :deep(.md-editor-preview h4),
.notes-content :deep(.md-editor-preview h5),
.notes-content :deep(.md-editor-preview h6) {
  margin: 0.25rem 0;
  font-size: 0.85rem;
}

.notes-content :deep(.md-editor-preview ul),
.notes-content :deep(.md-editor-preview ol) {
  margin: 0.25rem 0;
  padding-left: 1rem;
}

.notes-content :deep(.md-editor-preview li) {
  margin-bottom: 0.1rem;
}

</style>