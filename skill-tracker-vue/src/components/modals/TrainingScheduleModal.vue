<template>
  <BaseTeleportModal
    :isVisible="isVisible"
    title="Training Schedule Configuration"
    headerType="training"
    size="lg"
    @close="$emit('close')"
  >
    <template #title>
      <i class="bi bi-calendar-week me-2"></i>
      Training Schedule Configuration
    </template>

    <TrainingScheduleSettings />
    
    <template #footer>
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('close')"
      >
        <i class="bi bi-x-circle me-1"></i>
        Close
      </button>
    </template>
  </BaseTeleportModal>
</template>

<script setup lang="ts">
import BaseTeleportModal from '@/components/base/BaseTeleportModal.vue'
import TrainingScheduleSettings from '@/components/settings/TrainingScheduleSettings.vue'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>