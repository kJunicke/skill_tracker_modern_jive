<template>
  <div 
    :class="[
      'card', 
      'h-100',
      'shadow-sm',
      `skill-card-${skill.status}`,
      {
        'skill-due': isDue,
        'skill-almost-due': isAlmostDue && !isDue
      }
    ]"
  >
    <div class="card-body d-flex flex-column">
      <!-- Header with name, dropdown, and timeline -->
      <SkillCardHeader 
        :skill="skill"
        @edit-skill="handleEditSkill"
        @delete-skill="handleDeleteSkill"
        @progression-timeline="handleProgressionTimeline"
      />

      <!-- Star rating and focus progress -->
      <SkillCardProgress 
        :skill="skill"
        @level-up="handleLevelUp"
      />

      <!-- Status badge, tags, and next review info -->
      <SkillCardStatus 
        :skill="skill"
        @status-edit="handleStatusEdit"
        @tags-edit="handleTagsEdit"
      />

      <!-- Notes preview with tooltip -->
      <SkillCardNotes 
        :skill="skill"
        @notes-edit="handleNotesEdit"
      />

      <!-- Actions: Practice, Quick Notes, Level Up, Move to Acquisition -->
      <SkillCardActions 
        :skill="skill"
        @practice-rating="handlePracticeRating"
        @level-up="handleLevelUp"
        @move-to-acquisition="handleMoveToAcquisition"
        @quick-note="handleQuickNote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import { getDaysUntilReview } from '@/utils/spacedRepetition'

// Import child components
import SkillCardHeader from './card/SkillCardHeader.vue'
import SkillCardProgress from './card/SkillCardProgress.vue'
import SkillCardStatus from './card/SkillCardStatus.vue'
import SkillCardNotes from './card/SkillCardNotes.vue'
import SkillCardActions from './card/SkillCardActions.vue'

interface Props {
  skill: SkillData
}

interface Emits {
  (e: 'practice-rating', skillId: string): void
  (e: 'progression-timeline', skillId: string): void
  (e: 'edit-skill', skillId: string): void
  (e: 'delete-skill', skillId: string): void
  (e: 'status-edit', skillId: string): void
  (e: 'tags-edit', skillId: string): void
  (e: 'notes-edit', skillId: string): void
  (e: 'level-up', skillId: string): void
  (e: 'move-to-acquisition', skillId: string): void
  (e: 'quick-note', skillId: string, note: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Due status computations for card styling
const daysUntilReview = computed(() => {
  if (!props.skill.nextReview) return null
  return getDaysUntilReview(props.skill)
})

const isDue = computed(() => {
  return daysUntilReview.value !== null && daysUntilReview.value <= 0
})

const isAlmostDue = computed(() => {
  return daysUntilReview.value !== null && daysUntilReview.value <= 1 && daysUntilReview.value > 0
})

// Event handlers - pass through to parent
const handleEditSkill = (skillId: string) => emit('edit-skill', skillId)
const handleDeleteSkill = (skillId: string) => emit('delete-skill', skillId)
const handleProgressionTimeline = (skillId: string) => emit('progression-timeline', skillId)
const handleLevelUp = (skillId: string) => emit('level-up', skillId)
const handleStatusEdit = (skillId: string) => emit('status-edit', skillId)
const handleTagsEdit = (skillId: string) => emit('tags-edit', skillId)
const handleNotesEdit = (skillId: string) => emit('notes-edit', skillId)
const handlePracticeRating = (skillId: string) => emit('practice-rating', skillId)
const handleMoveToAcquisition = (skillId: string) => emit('move-to-acquisition', skillId)
const handleQuickNote = (skillId: string, note: string) => emit('quick-note', skillId, note)
</script>

<style scoped>
/* Card styling based on status */
.skill-card-backlog {
  border-left: 4px solid #6c757d;
}

.skill-card-acquisition {
  border-left: 4px solid #fd7e14;
}

.skill-card-maintenance {
  border-left: 4px solid #20c997;
}

.skill-card-focus {
  border-left: 4px solid #dc3545;
}

.skill-card-archived {
  border-left: 4px solid #adb5bd;
  opacity: 0.7;
}

/* Due status styling */
.skill-due {
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.3) !important;
  border: 2px solid #dc3545 !important;
}

.skill-almost-due {
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3) !important;
  border: 2px solid #ffc107 !important;
}

/* Card hover effects */
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style>