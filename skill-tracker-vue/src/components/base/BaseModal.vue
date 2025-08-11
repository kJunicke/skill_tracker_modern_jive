<template>
  <!-- Base Modal Component with Bootstrap 5 -->
  <div 
    v-show="isVisible"
    :class="modalClasses"
    :id="modalId"
    tabindex="-1" 
    :aria-labelledby="titleId"
    aria-hidden="true"
    :data-testid="dataTestId"
  >
    <div :class="dialogClasses">
      <div class="modal-content">
        <!-- Header -->
        <div v-if="!hideHeader" :class="headerClasses">
          <h5 class="modal-title" :id="titleId">
            <i v-if="icon" :class="`bi ${icon} me-2`"></i>
            <slot name="title">{{ title }}</slot>
          </h5>
          <button 
            v-if="!hideCloseButton"
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="modal" 
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>
        
        <!-- Body -->
        <div class="modal-body" :class="bodyClasses">
          <slot></slot>
        </div>
        
        <!-- Footer -->
        <div v-if="!hideFooter || $slots.footer" class="modal-footer" :class="footerClasses">
          <slot name="footer">
            <!-- Default footer buttons -->
            <button 
              v-if="showCancelButton"
              type="button" 
              class="btn btn-secondary" 
              data-bs-dismiss="modal"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button 
              v-if="showConfirmButton"
              type="button" 
              :class="confirmButtonClasses"
              :disabled="confirmDisabled"
              @click="$emit('confirm')"
            >
              <i v-if="confirmIcon" :class="`bi ${confirmIcon} me-2`"></i>
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // Modal Configuration
  modalId?: string
  title?: string
  icon?: string
  dataTestId?: string
  isVisible?: boolean
  
  // Size and Layout
  size?: 'sm' | 'lg' | 'xl' | 'fullscreen'
  centered?: boolean
  scrollable?: boolean
  
  // Header Configuration
  hideHeader?: boolean
  hideCloseButton?: boolean
  headerVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  
  // Body Configuration
  bodyClass?: string
  
  // Footer Configuration  
  hideFooter?: boolean
  footerClass?: string
  
  // Default Footer Buttons
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  confirmIcon?: string
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
  confirmDisabled?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'baseModal',
  title: '',
  isVisible: false,
  centered: true,
  scrollable: false,
  hideHeader: false,
  hideCloseButton: false,
  headerVariant: 'primary',
  hideFooter: false,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: 'Cancel',
  confirmText: 'Save',
  confirmVariant: 'primary',
  confirmDisabled: false
})

defineEmits<Emits>()

// Computed Classes
const modalClasses = computed(() => [
  'modal', 
  'fade'
])

const dialogClasses = computed(() => [
  'modal-dialog',
  {
    'modal-sm': props.size === 'sm',
    'modal-lg': props.size === 'lg', 
    'modal-xl': props.size === 'xl',
    'modal-fullscreen': props.size === 'fullscreen',
    'modal-dialog-centered': props.centered,
    'modal-dialog-scrollable': props.scrollable
  }
])

const headerClasses = computed(() => [
  'modal-header',
  `bg-${props.headerVariant}`,
  'text-white'
])

const bodyClasses = computed(() => props.bodyClass || '')

const footerClasses = computed(() => props.footerClass || '')

const confirmButtonClasses = computed(() => [
  'btn',
  `btn-${props.confirmVariant}`
])

const titleId = computed(() => `${props.modalId}Label`)
</script>

<style scoped>
.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}

/* Header color variants with proper contrast */
.modal-header.bg-primary {
  background: linear-gradient(135deg, #007bff, #0056b3) !important;
}

.modal-header.bg-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62) !important;
}

.modal-header.bg-success {
  background: linear-gradient(135deg, #28a745, #1e7e34) !important;
}

.modal-header.bg-danger {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
}

.modal-header.bg-warning {
  background: linear-gradient(135deg, #ffc107, #d39e00) !important;
}

.modal-header.bg-info {
  background: linear-gradient(135deg, #17a2b8, #138496) !important;
}

.modal-header.bg-light {
  background: #f8f9fa !important;
  color: #212529 !important;
}

.modal-header.bg-light .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-header.bg-dark {
  background: linear-gradient(135deg, #343a40, #23272b) !important;
}
</style>