<template>
  <div class="markdown-base markdown-editor-integration" :class="{ 'markdown-seamless': seamless }">
    <!-- Mode Toggle Buttons -->
    <div v-if="!seamless" class="markdown-editor-header mb-3">
      <div class="markdown-mode-toggle">
        <button 
          type="button"
          class="btn markdown-mode-btn"
          :class="{ active: currentMode === 'edit' }"
          @click="setMode('edit')"
        >
          <i class="bi bi-pencil-square me-1"></i>
          Edit
        </button>
        <button 
          type="button"
          class="btn markdown-mode-btn"
          :class="{ active: currentMode === 'preview' }"
          @click="setMode('preview')"
        >
          <i class="bi bi-eye me-1"></i>
          Preview
        </button>
        <button 
          type="button"
          class="btn markdown-mode-btn"
          :class="{ active: currentMode === 'split' }"
          @click="setMode('split')"
        >
          <i class="bi bi-layout-split me-1"></i>
          Split
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="markdown-editor-content" :class="{ 
      'markdown-split-mode': currentMode === 'split',
      'markdown-edit-only': currentMode === 'edit',
      'markdown-preview-only': currentMode === 'preview'
    }">
      <MdEditor
        v-model="content"
        :theme="config.theme"
        preview-theme="github"
        code-theme="github"
        :height="config.height"
        :placeholder="config.placeholder"
        :toolbars="getToolbars()"
        :show-code-row-number="false"
        :sanitize-html="config.sanitizeHtml"
        :no-upload-img="true"
        :editor-id="editorId"
        language="en-US"
        :footer-handlers="{ markdownTotal: false, scrollSwitch: false }"
        @change="handleChange"
        @blur="handleBlur"
      />
    </div>
    
    <!-- Character count and info -->
    <div class="d-flex justify-content-between mt-2">
      <small class="text-muted">
        <i class="bi bi-info-circle me-1"></i>
        Markdown formatting supported
      </small>
      <small class="text-muted">
        {{ characterCount }} characters
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import '@/styles/markdown.css'
import { useMarkdownEditor, useMarkdownKeyboardShortcuts } from '@/composables/useMarkdown'
import type { MarkdownConfig, MarkdownEmits } from '@/composables/useMarkdown'

interface Props extends MarkdownConfig {
  modelValue: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  height: '300px',
  placeholder: 'Enter your notes in markdown...',
  sanitizeHtml: true,
  simplified: false,
  defaultMode: 'edit',
  seamless: false
})

const emit = defineEmits<MarkdownEmits>()

// Use the markdown editor composable
const {
  content,
  currentMode, 
  editorId,
  characterCount,
  config,
  setMode,
  getToolbars,
  handleChange,
  handleBlur
} = useMarkdownEditor(props.modelValue, props, emit)

// Enable keyboard shortcuts
useMarkdownKeyboardShortcuts(setMode, !props.seamless)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// Expose content and methods for parent components
defineExpose({
  focus: () => {
    // Focus method can be implemented if needed
  },
  blur: () => {
    // Blur method can be implemented if needed
  },
  setMode,
  currentMode
})
</script>

<style scoped>
/* Component-specific styles - shared styles are in @/styles/markdown.css */
</style>