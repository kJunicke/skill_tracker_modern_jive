<template>
  <Teleport to="body">
    <div 
      v-if="toasts.length > 0"
      class="toast-container"
      :class="positionClasses"
    >
      <BaseToast
        v-for="toast in toasts"
        :key="toast.id"
        :id="toast.id"
        :title="toast.title"
        :message="toast.message"
        :variant="toast.variant"
        :duration="toast.duration"
        :created-at="toast.createdAt"
        :visible="toast.visible"
        @close="removeToast(toast.id)"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import BaseToast from '../base/BaseToast.vue'
import { useToastStore } from '@/stores/toastStore'

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

interface Props {
  position?: ToastPosition
  maxToasts?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top-right',
  maxToasts: 5
})

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

const positionClasses = computed(() => [
  'position-fixed',
  {
    'top-0 start-0': props.position === 'top-left',
    'top-0 start-50 translate-middle-x': props.position === 'top-center',
    'top-0 end-0': props.position === 'top-right',
    'bottom-0 start-0': props.position === 'bottom-left',
    'bottom-0 start-50 translate-middle-x': props.position === 'bottom-center',
    'bottom-0 end-0': props.position === 'bottom-right'
  }
])

const removeToast = (id: string) => {
  toastStore.removeToast(id)
}
</script>

<style scoped>
.toast-container {
  z-index: 1055;
  padding: 1rem;
  pointer-events: none;
  max-width: 420px;
}

.toast-container > * {
  pointer-events: auto;
}

/* Position-specific styling */
.toast-container.top-0 {
  padding-top: 1.5rem;
}

.toast-container.bottom-0 {
  padding-bottom: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .toast-container {
    max-width: calc(100vw - 2rem);
    padding: 0.5rem;
  }
  
  .toast-container.top-0 {
    padding-top: 1rem;
  }
  
  .toast-container.bottom-0 {
    padding-bottom: 1rem;
  }
}

/* Ensure toasts stack properly */
.toast-container > .toast-custom:not(:last-child) {
  margin-bottom: 0.5rem;
}
</style>