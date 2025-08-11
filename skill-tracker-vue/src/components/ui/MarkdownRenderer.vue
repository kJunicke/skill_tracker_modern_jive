<template>
  <div 
    class="markdown-base markdown-preview" 
    :class="{ 
      'markdown-renderer-clickable': editable, 
      'markdown-scrollable': maxHeight !== 'none' 
    }"
    :style="{ maxHeight: maxHeight }"
    @click="handleClick"
  >
    <MdPreview 
      v-if="!isEmpty"
      :model-value="processedContent"
      :theme="theme"
      preview-theme="github"
      code-theme="github"
      :show-code-row-number="false"
      :sanitize-html="sanitizeHtml"
    />
    <div v-else class="markdown-empty-placeholder">
      {{ placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import '@/styles/markdown.css'

interface Props {
  content: string
  theme?: 'light' | 'dark'
  maxHeight?: string
  sanitizeHtml?: boolean
  editable?: boolean
  placeholder?: string
}

interface Emits {
  (e: 'edit-clicked'): void
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  maxHeight: 'none',
  sanitizeHtml: true,
  editable: false,
  placeholder: 'Click to add content...'
})

const emit = defineEmits<Emits>()

const processedContent = computed(() => {
  if (!props.content || props.content.trim() === '') {
    return ''
  }
  return props.content
})

const isEmpty = computed(() => {
  return !props.content || props.content.trim() === ''
})

const handleClick = () => {
  if (props.editable) {
    emit('edit-clicked')
  }
}
</script>

<style scoped>
/* Component-specific styles - shared styles are in @/styles/markdown.css */

/* Override max-height binding */
.markdown-preview :deep(.md-editor-preview-wrapper) {
  max-height: v-bind(maxHeight);
}
</style>