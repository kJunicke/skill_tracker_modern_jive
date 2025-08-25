<template>
  <div class="modal-header modal-header-notes">
    <h5 class="modal-title" id="notesEditorModalLabel">
      <i class="bi bi-sticky me-2"></i>
      Edit Notes: {{ skillName }}
    </h5>
    <div class="d-flex align-items-center">
      <button
        v-if="showTimelineToggle"
        type="button"
        class="btn btn-outline-light btn-sm me-2"
        @click="$emit('toggle-timeline')"
        :title="timelineVisible ? 'Hide timeline' : 'Show timeline'"
      >
        <i class="bi bi-hourglass-split" :class="{ 'text-warning': timelineVisible }"></i>
      </button>
      <button 
        type="button" 
        class="btn-close" 
        data-bs-dismiss="modal" 
        aria-label="Close"
        @click="$emit('close')"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  skillName?: string
  showTimelineToggle?: boolean
  timelineVisible?: boolean
}

interface Emits {
  (e: 'toggle-timeline'): void
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.modal-header {
  border-bottom: none;
}

.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}
</style>