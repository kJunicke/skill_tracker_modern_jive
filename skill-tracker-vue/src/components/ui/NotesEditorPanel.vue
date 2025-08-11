<template>
  <div class="notes-editor-panel">
    <div class="mb-4">
      <label class="form-label">
        <i class="bi bi-journal-text me-2"></i>
        <strong>Skill Notes</strong>
      </label>
      <div class="notes-container" :class="{ 'notes-with-timeline': withTimeline }">
        <InlineMarkdownEditor
          :model-value="notes"
          :placeholder="placeholder"
          :editor-height="editorHeight"
          :show-save-buttons="false"
          :auto-save="true"
          @update:model-value="handleNotesChange"
          @change="handleNotesChange"
          @edit-start="$emit('edit-start')"
          @edit-end="$emit('edit-end')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InlineMarkdownEditor from './InlineMarkdownEditor.vue'

interface Props {
  notes: string
  placeholder?: string
  editorHeight?: string
  withTimeline?: boolean
}

interface Emits {
  (e: 'update:notes', value: string): void
  (e: 'character-count-update', count: number): void
  (e: 'edit-start'): void
  (e: 'edit-end'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  editorHeight: '300px',
  withTimeline: false
})

const emit = defineEmits<Emits>()

const handleNotesChange = (value?: string) => {
  const newValue = value !== undefined ? value : props.notes
  emit('update:notes', newValue)
  emit('character-count-update', newValue.length)
}
</script>

<style scoped>
.notes-container {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #fff;
  min-height: 120px;
  transition: border-color 0.2s ease-in-out;
}

.notes-container:hover {
  border-color: #17a2b8;
}

.notes-with-timeline {
  max-height: 450px;
  overflow: hidden;
}

.notes-with-timeline :deep(.md-editor) {
  max-height: 450px;
  overflow: hidden;
}

.notes-with-timeline :deep(.md-editor-input-wrapper),
.notes-with-timeline :deep(.md-editor-preview-wrapper) {
  max-height: calc(450px - 60px); /* Subtract toolbar height */
  overflow-y: auto;
}

.form-label {
  color: #495057;
  font-weight: 600;
}
</style>