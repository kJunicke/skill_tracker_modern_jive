<!--
  Base Teleport Modal Component
  Provides standardized modal functionality with:
  - CSS Variables system for consistent dark mode
  - Keyboard navigation (Tab, Escape, Enter)
  - Responsive mobile design
  - Accessibility features
  - Focus management
-->

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        ref="modalRef"
        :class="[
          'modal-content',
          size && `modal-${size}`
        ]"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        tabindex="-1"
      >
        <!-- Header -->
        <div :class="['modal-header', headerClass]">
          <h5 class="modal-title" :id="titleId">
            <slot name="title">{{ title }}</slot>
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <slot />
        </div>

        <!-- Footer -->
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef } from 'vue'
import { useModalKeyboardNavigation } from '@/composables/useModalKeyboardNavigation'

interface Props {
  isVisible: boolean
  title?: string
  size?: 'sm' | 'lg' | 'xl'
  headerType?: 'skill' | 'practice' | 'status' | 'tags' | 'notes' | 'timeline' | 'training' | 'transition'
  closeOnOverlayClick?: boolean
  onConfirm?: () => void
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Modal',
  size: undefined,
  headerType: 'skill',
  closeOnOverlayClick: true
})

const emit = defineEmits<Emits>()

const modalRef = ref<HTMLElement | null>(null)
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)

const headerClass = computed(() => {
  return props.headerType ? `modal-header-${props.headerType}` : 'modal-header-skill'
})

// Initialize keyboard navigation
const { setModalElement, initializeKeyboardNavigation } = useModalKeyboardNavigation({
  isVisible: toRef(props, 'isVisible'),
  onClose: () => emit('close'),
  onConfirm: props.onConfirm
})

// Watch for modal visibility to initialize keyboard navigation
watch(() => props.isVisible, (isVisible) => {
  if (isVisible && modalRef.value) {
    setModalElement(modalRef.value)
    initializeKeyboardNavigation()
  }
})

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    emit('close')
  }
}
</script>

<style scoped>
/* Modal styles are defined in /assets/modal.css using CSS variables */
/* This component provides the consistent structure and behavior */
</style>