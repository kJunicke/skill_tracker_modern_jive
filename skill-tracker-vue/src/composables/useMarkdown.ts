import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ToolbarNames } from 'md-editor-v3'
import { useToasts } from './useToasts'

export type EditorMode = 'edit' | 'preview' | 'split'

export interface MarkdownConfig {
  theme?: 'light' | 'dark'
  height?: string
  placeholder?: string
  sanitizeHtml?: boolean
  simplified?: boolean
  defaultMode?: EditorMode
  seamless?: boolean
  autoSave?: boolean
  showSaveButtons?: boolean
}

export interface MarkdownEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'blur', value: string): void
  (e: 'mode-changed', mode: EditorMode): void
  (e: 'edit-start'): void
  (e: 'edit-end'): void
  (e: 'edit-clicked'): void
}

export const DEFAULT_CONFIG: Required<MarkdownConfig> = {
  theme: 'light',
  height: '300px',
  placeholder: 'Enter your notes in markdown...',
  sanitizeHtml: true,
  simplified: false,
  defaultMode: 'edit',
  seamless: false,
  autoSave: true,
  showSaveButtons: false
}

export function useMarkdownEditor(
  initialValue: string = '',
  config: MarkdownConfig = {},
  emit?: MarkdownEmits
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  const content = ref(initialValue)
  const currentMode = ref<EditorMode>(mergedConfig.defaultMode)
  const editorId = ref(`editor-${Math.random().toString(36).substr(2, 9)}`)
  const characterCount = computed(() => content.value.length)
  const isEmpty = computed(() => !content.value || content.value.trim() === '')
  
  const setMode = (mode: EditorMode) => {
    currentMode.value = mode
    emit?.('mode-changed', mode)
  }

  const getToolbars = (): ToolbarNames[] => {
    if (mergedConfig.seamless || currentMode.value === 'preview') {
      return []
    }
    
    if (mergedConfig.simplified) {
      return [
        'bold', 'italic', 'strikeThrough', '-',
        'unorderedList', 'orderedList', '-',
        'quote', 'code'
      ]
    }
    
    return [
      'bold', 'italic', 'strikeThrough', '-',
      'title', 'sub', 'sup', 'quote',
      'unorderedList', 'orderedList', 'task', '-',
      'code', 'codeRow', 'link', 'table'
    ]
  }

  const handleChange = (value: string) => {
    content.value = value
    emit?.('update:modelValue', value)
    emit?.('change', value)
  }

  const handleBlur = () => {
    emit?.('blur', content.value)
  }

  return {
    content,
    currentMode,
    editorId,
    characterCount,
    isEmpty,
    config: mergedConfig,
    setMode,
    getToolbars,
    handleChange,
    handleBlur
  }
}

export function useMarkdownKeyboardShortcuts(
  setMode: (mode: EditorMode) => void,
  enabled = true
) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (!enabled || !(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return

    switch (event.key.toLowerCase()) {
      case 'e':
        event.preventDefault()
        setMode('edit')
        break
      case 'p':
        event.preventDefault()
        setMode('preview')
        break
      case 'd':
        event.preventDefault()
        setMode('split')
        break
    }
  }

  onMounted(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeydown)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return { handleKeydown }
}

export function useInlineEditor(
  initialValue: string = '',
  config: MarkdownConfig = {},
  emit?: MarkdownEmits
) {
  const isEditing = ref(false)
  const originalContent = ref(initialValue)
  const { content, ...editorUtils } = useMarkdownEditor(initialValue, config, emit)
  const { showSuccess } = useToasts()
  
  const hasChanges = computed(() => content.value !== originalContent.value)

  const startEditing = () => {
    isEditing.value = true
    originalContent.value = content.value
    emit?.('edit-start')
  }

  const saveChanges = () => {
    if (hasChanges.value || !config.autoSave) {
      emit?.('update:modelValue', content.value)
      emit?.('change', content.value)
      
      // Show auto-save confirmation only if there were changes
      if (hasChanges.value && config.autoSave) {
        showSuccess('Auto-saved', 'Notes saved successfully')
      }
    }
    isEditing.value = false
    emit?.('edit-end')
  }

  const cancelEditing = () => {
    content.value = originalContent.value
    isEditing.value = false
    emit?.('edit-end')
  }

  const handleBlur = () => {
    if (config.autoSave && !config.showSaveButtons) {
      setTimeout(() => {
        if (isEditing.value && containerElement && document.activeElement && 
            !containerElement.contains(document.activeElement)) {
          saveChanges()
        }
      }, 100)
    }
    emit?.('blur', content.value)
  }

  // Click outside handling
  let containerElement: HTMLElement | null = null
  
  const setContainer = (element: HTMLElement | null) => {
    containerElement = element
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!isEditing.value || !containerElement) return
    
    const target = event.target as Element
    if (!containerElement.contains(target)) {
      if (!target.closest('.modal-backdrop') && 
          !target.closest('.btn-close') &&
          !target.closest('.modal-header') &&
          target.closest('.modal-content')) {
        if (config.autoSave && !config.showSaveButtons) {
          saveChanges()
        }
      }
    }
  }

  // Escape key handling
  const handleKeydown = (event: KeyboardEvent) => {
    if (isEditing.value && event.key === 'Escape') {
      cancelEditing()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    isEditing,
    hasChanges,
    content,
    originalContent,
    ...editorUtils,
    startEditing,
    saveChanges,
    cancelEditing,
    handleBlur: handleBlur,
    setContainer
  }
}

export const SKILL_NOTES_PLACEHOLDER = `Add your notes about this skill...

Ideas for notes:
- **Key technique points** to remember
- *Common mistakes* to avoid
- Personal insights and breakthroughs
- Partner feedback and observations
- Variations or styling notes
- Areas for improvement
- Connection to other skills`