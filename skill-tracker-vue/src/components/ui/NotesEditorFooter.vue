<template>
  <div class="modal-footer">
    <button 
      type="button" 
      class="btn btn-secondary" 
      @click="$emit('cancel')"
    >
      Cancel
    </button>
    <button 
      v-if="hasExistingNotes"
      type="button" 
      class="btn btn-outline-danger"
      @click="handleClearNotes"
      title="Clear all notes"
    >
      <i class="bi bi-trash me-2"></i>
      Clear Notes
    </button>
    <button 
      type="button" 
      class="btn btn-info"
      @click="$emit('save')"
      :disabled="!hasChanges"
    >
      <i class="bi bi-check-circle me-2"></i>
      Save Notes
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasChanges: boolean
  hasExistingNotes: boolean
}

interface Emits {
  (e: 'cancel'): void
  (e: 'save'): void
  (e: 'clear'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleClearNotes = () => {
  if (confirm('Are you sure you want to clear all notes for this skill?')) {
    emit('clear')
  }
}
</script>

<style scoped>
.modal-footer {
  border-top: 1px solid #dee2e6;
}

.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>