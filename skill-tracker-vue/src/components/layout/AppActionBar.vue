<template>
  <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
    <h2 class="card-title mb-0">My Skills</h2>
    <div class="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-start justify-content-md-end">
      <BaseButton
        variant="info"
        icon="bi-journal-text"
        text="Training Log"
        title="Show Training log"
        @click="$emit('show-training-log')"
      />
      <BaseButton
        variant="success"
        icon="bi-download"
        text="Export Data"
        title="Export all skill data as JSON backup"
        @click="$emit('export-data')"
      />
      <BaseButton
        variant="secondary"
        icon="bi-upload"
        text="Import Data"
        title="Import skill data from JSON backup"
        @click="$emit('import-data')"
      />
      <BaseButton
        variant="danger"
        outline
        size="sm"
        icon="bi-trash3"
        text="Delete All"
        title="Delete all skills (cannot be undone)"
        @click="$emit('delete-all-skills')"
      />
      <BaseButton
        variant="warning"
        outline
        size="sm"
        icon="bi-arrow-clockwise"
        text="Reset Test"
        title="Reset to test skills"
        @click="$emit('reset-test-environment')"
      />
      <BaseButton
        variant="primary"
        icon="bi-plus-circle"
        text="Add New Skill"
        @click="$emit('add-skill')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
// Action bar component with all main action buttons

interface Emits {
  (e: 'show-training-log'): void
  (e: 'export-data'): void
  (e: 'import-data'): void
  (e: 'delete-all-skills'): void
  (e: 'reset-test-environment'): void
  (e: 'add-skill'): void
}

defineEmits<Emits>()
</script>

<style scoped>
/* Responsive action bar improvements */
@media (max-width: 575.98px) {
  .d-flex.flex-wrap {
    gap: 0.5rem !important;
  }
  
  /* Ensure buttons don't get too small on mobile */
  .d-flex.flex-wrap > * {
    min-width: fit-content;
    flex-shrink: 0;
  }
}

/* Button hover effects already handled by BaseButton */
</style>