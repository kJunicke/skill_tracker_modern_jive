<template>
  <div class="skill-card-status">
    <!-- Status badge -->
    <div class="mb-2">
      <span 
        :class="[
          'badge',
          `bg-${safeStatusConfig.color}`,
          'clickable-status'
        ]"
        @click="handleStatusEdit"
        style="cursor: pointer;"
        :title="safeStatusConfig.description"
      >
        <i :class="`bi ${safeStatusConfig.icon} me-1`"></i>
        {{ safeStatusConfig.label }}
      </span>
    </div>

    <!-- Tags -->
    <div class="mb-2">
      <div class="clickable-tags" @click="handleTagsEdit" style="cursor: pointer;">
        <span 
          v-for="tag in skill.tags || []" 
          :key="tag"
          class="badge bg-secondary me-1 mb-1"
        >
          {{ tag }}
        </span>
        <small v-if="!skill.tags || skill.tags.length === 0" class="text-muted">
          Click to add tags
        </small>
      </div>
    </div>

    <!-- Next review info -->
    <div v-if="skill.nextReview && skill.status !== 'archived' && skill.status !== 'backlog'" class="mb-2">
      <small 
        :class="[
          isDue ? 'text-danger fw-bold' : 
          isAlmostDue ? 'text-warning fw-bold' : 
          'text-muted'
        ]"
      >
        <i class="bi bi-calendar3 me-1"></i>
        {{ reviewText }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import { STATUS_CONFIG } from '@/utils/constants'
import { SpacedRepetitionService } from '@/services/core/SpacedRepetitionService'

interface Props {
  skill: SkillData
}

interface Emits {
  (e: 'status-edit', skillId: string): void
  (e: 'tags-edit', skillId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statusConfig = STATUS_CONFIG

// Computed property to safely get status configuration
const safeStatusConfig = computed(() => {
  if (!props.skill.status || !statusConfig[props.skill.status]) {
    // Default to 'backlog' if status is invalid or undefined
    return statusConfig.backlog
  }
  return statusConfig[props.skill.status]
})

// Review timing computations  
const daysUntilReview = computed(() => {
  if (!props.skill.nextReview) return null
  const service = new SpacedRepetitionService()
  return service.getDaysUntilReview(props.skill)
})

const isDue = computed(() => {
  return daysUntilReview.value !== null && daysUntilReview.value <= 0
})

const isAlmostDue = computed(() => {
  return daysUntilReview.value !== null && daysUntilReview.value <= 1 && daysUntilReview.value > 0
})

const reviewText = computed(() => {
  if (daysUntilReview.value === null) return ''
  
  if (daysUntilReview.value < 0) {
    const overdueDays = Math.abs(daysUntilReview.value)
    return `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`
  } else if (daysUntilReview.value === 0) {
    return 'Due today'
  } else if (daysUntilReview.value === 1) {
    return 'Due tomorrow'
  } else {
    return `Due in ${daysUntilReview.value} days`
  }
})

const handleStatusEdit = () => {
  emit('status-edit', props.skill.id)
}

const handleTagsEdit = () => {
  emit('tags-edit', props.skill.id)
}
</script>

<style scoped>
.clickable-status:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  transition: all 0.2s ease-in-out;
}

.clickable-tags:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}

.badge {
  transition: all 0.2s ease-in-out;
}
</style>