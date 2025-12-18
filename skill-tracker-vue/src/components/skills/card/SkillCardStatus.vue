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
import { dateUtils } from '@/utils/dateHelpers'

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
  
  // Use display-friendly date that respects training schedules for weekly skills
  const displayDate = service.getDisplayNextReview(props.skill)
  return dateUtils.daysBetween(dateUtils.now(), displayDate)
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
    const formattedOverdue = dateUtils.formatDaysAsWeeksAndDays(overdueDays)
    return `Overdue by ${formattedOverdue}`
  } else if (daysUntilReview.value === 0) {
    return 'Due today'
  } else if (daysUntilReview.value === 1) {
    return 'Due tomorrow'
  } else {
    const formattedDays = dateUtils.formatDaysAsWeeksAndDays(daysUntilReview.value)
    return `Due in ${formattedDays}`
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
.clickable-status {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0.375rem 0.75rem;
}

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

/* Mobile touch-friendly targets */
@media (max-width: 575.98px) {
  .clickable-status {
    min-height: 44px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .clickable-tags .badge {
    min-height: 36px;
    padding: 0.5rem 0.75rem;
    display: inline-flex;
    align-items: center;
  }
}
</style>