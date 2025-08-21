<template>
  <div 
    :class="[
      'card', 
      'h-100',
      'shadow-sm',
      `skill-card-${skill.status}`,
      {
        'skill-due': isDue,
        'skill-almost-due': isAlmostDue && !isDue,
        'skill-card-compact': isCompactView,
        'skill-card-expanded': isExpanded
      }
    ]"
  >
    <!-- Compact mobile view -->
    <div 
      v-if="isCompactView && !isExpanded" 
      class="compact-card-body p-2"
      @click="toggleExpanded"
      role="button"
      tabindex="0"
      @keydown.enter="toggleExpanded"
      @keydown.space.prevent="toggleExpanded"
    >
      <div class="d-flex align-items-center justify-content-between">
        <div class="flex-grow-1 me-2">
          <div class="skill-name text-truncate fw-semibold">{{ skill.name }}</div>
          <div class="skill-meta d-flex align-items-center gap-2 small text-muted">
            <span>Level {{ skill.level }}</span>
            <span v-if="nextReviewDate" class="text-truncate">{{ nextReviewDate }}</span>
            <span v-else>Kein Review</span>
          </div>
        </div>
        <div class="compact-status-indicator">
          <span 
            :class="[
              'badge',
              `badge-${skill.status}`,
              'rounded-pill'
            ]"
          >
            {{ skill.status.charAt(0).toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Full view (default on desktop, expanded on mobile) -->
    <div 
      v-else 
      class="card-body d-flex flex-column"
      :class="{ 'clickable-expanded': isCompactView && isExpanded }"
      @click="handleCardClick"
    >
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
        @move-to-acquisition="handleMoveToAcquisition"
        @quick-note="handleQuickNote"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SkillData } from '@/types/skill'
import { SpacedRepetitionService } from '@/services/core/SpacedRepetitionService'
import { useViewModeStore } from '@/stores/viewModeStore'

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
  (e: 'move-to-acquisition', skillId: string): void
  (e: 'quick-note', skillId: string, note: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// View mode management
const viewModeStore = useViewModeStore()
const isCompactView = computed(() => viewModeStore.viewMode === 'compact')
const isExpanded = ref(false)

// Toggle expanded state for compact view
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Handle card click - only collapse if clicking on safe area
const handleCardClick = (event: MouseEvent) => {
  if (!isCompactView.value || !isExpanded.value) return
  
  const target = event.target as HTMLElement
  
  // Don't collapse if clicking on interactive elements
  const interactiveSelectors = [
    'button',
    'a',
    'input',
    'textarea',
    'select',
    '[role="button"]',
    '.btn',
    '.dropdown-item',
    '.badge',
    '.star-rating',
    '.bi'
  ]
  
  // Check if clicked element or any parent is interactive
  for (const selector of interactiveSelectors) {
    if (target.closest(selector)) {
      return
    }
  }
  
  // Safe to collapse
  toggleExpanded()
}

// Next review date computation
const nextReviewDate = computed(() => {
  if (!props.skill.nextReview) return null
  
  const date = new Date(props.skill.nextReview)
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit',
    year: '2-digit'
  })
})

// Due status computations for card styling
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

// Event handlers - pass through to parent
const handleEditSkill = (skillId: string) => emit('edit-skill', skillId)
const handleDeleteSkill = (skillId: string) => emit('delete-skill', skillId)
const handleProgressionTimeline = (skillId: string) => emit('progression-timeline', skillId)
// Level-up functionality removed - now handled through unified practice/level-up system
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

/* Compact view styling */
.skill-card-compact {
  height: auto !important;
}

.compact-card-body {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.compact-card-body:hover {
  background-color: var(--bs-light);
}

.compact-card-body:focus {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

.skill-name {
  font-size: 0.95rem;
  line-height: 1.2;
}

.skill-meta {
  font-size: 0.8rem;
  line-height: 1.1;
}

.compact-status-indicator {
  flex-shrink: 0;
}

/* Status badge colors */
.badge-backlog {
  background-color: #6c757d;
  color: white;
}

.badge-acquisition {
  background-color: #fd7e14;
  color: white;
}

.badge-maintenance {
  background-color: #20c997;
  color: white;
}

.badge-focus {
  background-color: #dc3545;
  color: white;
}

.badge-archived {
  background-color: #adb5bd;
  color: white;
}

/* Clickable expanded state */
.clickable-expanded {
  cursor: pointer;
  position: relative;
}

.clickable-expanded::after {
  content: "Klicken zum Einklappen";
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  color: var(--bs-secondary);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.clickable-expanded:hover::after {
  opacity: 0.7;
}

/* Dark mode compatibility */
[data-bs-theme="dark"] .compact-card-body:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>