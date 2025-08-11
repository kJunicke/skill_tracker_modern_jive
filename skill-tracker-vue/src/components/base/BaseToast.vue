<template>
  <Transition
    name="toast"
    appear
    @enter="onEnter"
    @leave="onLeave"
  >
    <div
      v-if="visible"
      :class="toastClasses"
      class="toast show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-header">
        <i :class="iconClass" class="me-2"></i>
        <strong class="me-auto">{{ title }}</strong>
        <small class="text-muted">{{ timeAgo }}</small>
        <BaseButton
          variant="light"
          size="sm"
          class="btn-close ms-2"
          aria-label="Close"
          @click="$emit('close')"
        >
          <i class="bi bi-x"></i>
        </BaseButton>
      </div>
      <div v-if="message" class="toast-body">
        {{ message }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Props {
  id: string
  title: string
  message?: string
  variant?: ToastVariant
  duration?: number
  visible?: boolean
  createdAt?: Date
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  duration: 5000,
  visible: true,
  createdAt: () => new Date()
})

const emit = defineEmits<Emits>()

const timeAgo = ref('now')

const toastClasses = computed(() => [
  'toast-custom',
  `toast-${props.variant}`,
  {
    'toast-with-message': !!props.message
  }
])

const iconClass = computed(() => {
  const iconMap = {
    success: 'bi bi-check-circle-fill text-success',
    error: 'bi bi-exclamation-triangle-fill text-danger',
    warning: 'bi bi-exclamation-triangle-fill text-warning',
    info: 'bi bi-info-circle-fill text-info'
  }
  return iconMap[props.variant]
})

const updateTimeAgo = () => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - props.createdAt.getTime()) / 1000)
  
  if (diff < 60) {
    timeAgo.value = 'now'
  } else if (diff < 3600) {
    timeAgo.value = `${Math.floor(diff / 60)}m ago`
  } else {
    timeAgo.value = `${Math.floor(diff / 3600)}h ago`
  }
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.transform = 'translateX(100%)'
  element.style.opacity = '0'
  
  requestAnimationFrame(() => {
    element.style.transition = 'all 0.3s ease-out'
    element.style.transform = 'translateX(0)'
    element.style.opacity = '1'
  })
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.transition = 'all 0.3s ease-in'
  element.style.transform = 'translateX(100%)'
  element.style.opacity = '0'
}

onMounted(() => {
  // Update time initially and then every minute
  updateTimeAgo()
  const interval = setInterval(updateTimeAgo, 60000)
  
  // Auto-dismiss toast after duration
  if (props.duration > 0) {
    setTimeout(() => {
      emit('close')
    }, props.duration)
  }
  
  // Cleanup on unmount
  return () => clearInterval(interval)
})
</script>

<style scoped>
.toast-custom {
  min-width: 300px;
  max-width: 400px;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-error {
  border-left: 4px solid #dc3545;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-header {
  background-color: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
}

.toast-body {
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.98);
}

.btn-close {
  border: none;
  background: none;
  padding: 0.25rem;
  margin: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
}

/* Toast transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .toast-custom {
    min-width: 280px;
    max-width: calc(100vw - 2rem);
  }
}
</style>