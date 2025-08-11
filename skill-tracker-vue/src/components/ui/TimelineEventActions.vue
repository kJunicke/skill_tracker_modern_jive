<template>
  <div class="timeline-event-actions d-flex gap-1">
    <!-- Edit Actions Based on Event Type -->
    <button
      v-if="eventType === 'levelup'"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="$emit('edit-levelup')"
      title="Edit comment"
    >
      <i class="bi bi-pencil"></i>
    </button>
    
    <button
      v-if="eventType === 'practice'"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="$emit('edit-practice')"
      title="Edit note"
    >
      <i class="bi bi-pencil"></i>
    </button>
    
    <button
      v-if="eventType === 'quicknote'"
      type="button"
      class="btn btn-sm btn-outline-secondary"
      @click="$emit('edit-quicknote')"
      title="Edit note"
    >
      <i class="bi bi-pencil"></i>
    </button>
    
    <!-- Delete Action (Quick Notes Only) -->
    <button
      v-if="eventType === 'quicknote'"
      type="button"
      class="btn btn-sm btn-outline-danger"
      @click="$emit('delete-quicknote')"
      title="Delete note"
    >
      <i class="bi bi-trash"></i>
    </button>
    
    <!-- Add to Notes Action (Compact View Only) -->
    <button
      v-if="hasDescription && !isModalView"
      type="button"
      class="btn btn-sm btn-outline-primary"
      @click="$emit('add-to-notes')"
      title="Add to notes"
    >
      <i class="bi bi-plus-circle"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  eventType: 'levelup' | 'practice' | 'quicknote'
  hasDescription?: boolean
  isModalView?: boolean
}

interface Emits {
  (e: 'edit-levelup'): void
  (e: 'edit-practice'): void
  (e: 'edit-quicknote'): void
  (e: 'delete-quicknote'): void
  (e: 'add-to-notes'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.timeline-event-actions .btn {
  transition: all 0.2s ease-in-out;
}

.timeline-event-actions .btn:hover {
  transform: translateY(-1px);
}
</style>