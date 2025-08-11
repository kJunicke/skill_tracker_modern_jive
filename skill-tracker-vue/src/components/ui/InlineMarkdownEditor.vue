<template>
  <div class="markdown-base" ref="containerRef">
    <!-- Display Mode -->
    <MarkdownRenderer
      v-if="!isEditing"
      :content="content"
      :theme="config.theme"
      :max-height="maxHeight"
      :sanitize-html="config.sanitizeHtml"
      :editable="true"
      :placeholder="config.placeholder"
      @edit-clicked="startEditing"
    />
    
    <!-- Edit Mode -->
    <div v-else class="markdown-inline-edit-mode">
      <MarkdownEditor
        v-model="content"
        :theme="config.theme"
        :height="editorHeight"
        :placeholder="config.placeholder"
        :sanitize-html="config.sanitizeHtml"
        :seamless="true"
        @blur="handleBlur"
        @change="handleChange"
        ref="editorRef"
      />
      
      <!-- Save/Cancel buttons for mobile or explicit save -->
      <div v-if="config.showSaveButtons" class="markdown-inline-save-buttons mt-2">
        <button
          type="button"
          class="btn btn-sm btn-info me-2"
          @click="saveChanges"
          :disabled="!hasChanges"
        >
          <i class="bi bi-check-circle me-1"></i>
          Save
        </button>
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="cancelEditing"
        >
          <i class="bi bi-x-circle me-1"></i>
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import MarkdownEditor from './MarkdownEditor.vue'
import '@/styles/markdown.css'
import { useInlineEditor } from '@/composables/useMarkdown'
import type { MarkdownConfig, MarkdownEmits } from '@/composables/useMarkdown'

interface Props extends MarkdownConfig {
  modelValue: string
  maxHeight?: string
  editorHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  maxHeight: 'none',
  editorHeight: '200px',
  placeholder: 'Click to add notes...',
  sanitizeHtml: true,
  showSaveButtons: false,
  autoSave: true
})

const emit = defineEmits<MarkdownEmits>()

const containerRef = ref<HTMLElement>()
const editorRef = ref()

// Use the inline editor composable
const {
  isEditing,
  hasChanges,
  content,
  config,
  startEditing: composableStartEditing,
  saveChanges,
  cancelEditing,
  handleBlur,
  handleChange,
  setContainer
} = useInlineEditor(props.modelValue, props, emit)

// Enhanced start editing with focus
const startEditing = async () => {
  composableStartEditing()
  
  // Focus the editor after it's rendered
  await nextTick()
  if (editorRef.value?.focus) {
    editorRef.value.focus()
  }
}

// Set container reference for click outside detection
watch(containerRef, (newContainer) => {
  setContainer(newContainer || null)
}, { immediate: true })

// Watch for external changes to modelValue (like from add-to-notes)
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
}, { immediate: true })

// Note: Click outside and keyboard handling is now managed by the composable

// Expose methods for parent components
defineExpose({
  startEditing,
  saveChanges,
  cancelEditing,
  isEditing,
  hasChanges
})
</script>

<style scoped>
/* Component-specific styles - shared styles are in @/styles/markdown.css */

.markdown-inline-edit-mode {
  animation: fadeIn 0.2s ease-out;
}

.markdown-inline-save-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.markdown-inline-save-buttons .btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.markdown-inline-save-buttons .btn:hover {
  transform: translateY(-1px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .markdown-inline-save-buttons {
    justify-content: stretch;
  }
  
  .markdown-inline-save-buttons .btn {
    flex: 1;
  }
}
</style>