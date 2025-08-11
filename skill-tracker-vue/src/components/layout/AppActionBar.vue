<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="card-title mb-0">My Skills</h2>
    <div class="d-flex gap-2">
      <BaseButton
        variant="info"
        icon="bi-journal-text"
        text="Training Log"
        title="Show Training log"
        @click="$emit('show-training-log')"
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
  (e: 'reset-test-environment'): void
  (e: 'add-skill'): void
}

defineEmits<Emits>()
</script>

<style scoped>
/* Button hover effects already handled by BaseButton */
</style>