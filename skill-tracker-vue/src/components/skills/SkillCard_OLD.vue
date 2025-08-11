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
    <div class="card-body">
      <!-- Header with name and buttons -->
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="card-title mb-0">{{ skill.name }}</h6>
        
        <div class="d-flex flex-column align-items-end gap-1">
          <!-- Dropdown menu -->
          <div class="dropdown">
            <button 
              class="btn btn-outline-secondary btn-sm" 
              type="button" 
              @click="toggleDropdown"
              :aria-expanded="dropdownOpen"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul :class="['dropdown-menu', 'dropdown-menu-end', { 'show': dropdownOpen }]">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="editSkill">
                  <i class="bi bi-pencil me-2"></i>Edit
                </a>
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="deleteSkill">
                  <i class="bi bi-trash me-2"></i>Delete
                </a>
              </li>
            </ul>
          </div>
          
          <!-- Hourglass timeline button -->
          <button 
            class="btn btn-outline-info btn-sm timeline-btn" 
            type="button" 
            @click="showProgressionTimeline"
            title="View Timeline"
          >
            <i class="bi bi-hourglass-split"></i>
          </button>
        </div>
      </div>

      <!-- Star rating -->
      <div class="mb-2 text-center">
        <StarRating 
          :level="skill.level" 
          :skill-id="skill.id"
          @level-up="showLevelUpModal"
        />
      </div>

      <!-- Status badge -->
      <div class="mb-2">
        <span 
          :class="[
            'badge',
            `bg-${statusConfig[skill.status].color}`,
            'clickable-status'
          ]"
          @click="showStatusEditor"
          style="cursor: pointer;"
          :title="statusConfig[skill.status].description"
        >
          <i :class="`bi ${statusConfig[skill.status].icon} me-1`"></i>
          {{ statusConfig[skill.status].label }}
        </span>
      </div>

      <!-- Tags -->
      <div class="mb-2">
        <div class="clickable-tags" @click="showTagEditor" style="cursor: pointer;">
          <span 
            v-for="tag in skill.tags" 
            :key="tag"
            class="badge bg-secondary me-1 mb-1"
          >
            {{ tag }}
          </span>
          <small v-if="skill.tags.length === 0" class="text-muted">
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
          <i 
            :class="[
              'me-1',
              isDue ? 'bi bi-exclamation-triangle-fill' :
              isAlmostDue ? 'bi bi-clock-fill' :
              'bi bi-calendar3'
            ]"
          ></i>
          <span v-if="isDue">OVERDUE ({{ Math.abs(daysUntilReview) }} days ago)</span>
          <span v-else-if="isAlmostDue">Due tomorrow</span>
          <span v-else>Review in {{ daysUntilReview }} days</span>
        </small>
      </div>

      <!-- Focus mode progress -->
      <div v-if="skill.status === 'focus' && skill.focusData" class="mb-2">
        <div class="progress" style="height: 4px;">
          <div 
            class="progress-bar bg-danger" 
            :style="`width: ${focusProgress}%`"
          ></div>
        </div>
        <small class="text-muted">
          XP: {{ skill.focusData.currentXP }}/{{ skill.focusData.targetXP }}
          <span v-if="skill.focusData.readyForLevelUp" class="text-success ms-1">
            <i class="bi bi-check-circle"></i> Ready!
          </span>
        </small>
      </div>

      <!-- Notes preview -->
      <div v-if="skill.notes" class="mb-2">
        <div 
          class="clickable-notes custom-tooltip-container" 
          @click="showNotesEditor"
          style="cursor: pointer;"
          ref="notesTooltipElement"
          :title="skill.notes.length > 200 ? skill.notes : ''"
        >
          <div class="notes-preview-container">
            <small class="text-muted d-block mb-1">
              <i class="bi bi-sticky me-1"></i>
              Notes:
            </small>
            <div class="notes-content">
              <MarkdownRenderer 
                :content="notesPreview"
                max-height="120px"
              />
            </div>
          </div>
          
          <!-- Custom CSS Tooltip for long notes -->
          <div 
            v-if="skill.notes.length > 200"
            class="custom-tooltip"
          >
            {{ skill.notes }}
          </div>
        </div>
      </div>
      <div v-else class="mb-2">
        <div 
          class="clickable-notes text-muted" 
          @click="showNotesEditor"
          style="cursor: pointer;"
        >
          <small>
            <i class="bi bi-sticky me-1"></i>
            Click to add notes
          </small>
        </div>
      </div>

      <!-- Quick Notes -->
      <div class="mb-2">
        <div v-if="showQuickNotes" class="quick-notes-container">
          <div class="input-group input-group-sm">
            <span class="input-group-text">
              <i class="bi bi-chat-left-text"></i>
            </span>
            <input
              v-model="quickNote"
              type="text"
              class="form-control"
              placeholder="Add a quick note..."
              maxlength="500"
              @keyup.enter="addQuickNote"
              @keyup.escape="cancelQuickNote"
            />
            <button class="btn btn-outline-success" @click="addQuickNote">
              <i class="bi bi-check"></i>
            </button>
            <button class="btn btn-outline-secondary" @click="cancelQuickNote">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div v-else class="quick-notes-trigger">
          <button 
            class="btn btn-outline-secondary btn-sm w-100"
            @click="showQuickNotesInput"
          >
            <i class="bi bi-chat-left-text me-2"></i>
            Quick Note
          </button>
        </div>
      </div>

      <!-- Practice button -->
      <div v-if="skill.status !== 'backlog' && skill.status !== 'archived'" class="mt-3">
        <button 
          class="btn btn-primary btn-sm w-100 practice-btn"
          @click="showPracticeRating"
        >
          <i class="bi bi-play-circle me-2"></i>
          Practice
        </button>
      </div>

      <!-- Move to Acquisition button for backlog skills -->
      <div v-if="skill.status === 'backlog'" class="mt-3">
        <button 
          class="btn btn-warning btn-sm w-100"
          @click="moveToAcquisition"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Start Learning
        </button>
      </div>

      <!-- Level up button for focus mode -->
      <div v-if="skill.status === 'focus' && skill.focusData?.readyForLevelUp" class="mt-2">
        <button 
          class="btn btn-success btn-sm w-100 level-up-btn"
          :class="{ 'ready-pulse': skill.focusData.readyForLevelUp }"
          @click="showLevelUpModal"
        >
          <i class="bi bi-arrow-up-circle me-2"></i>
          Level Up to {{ skill.level + 1 }}!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import type { SkillData } from '@/types/skill'
import { STATUS_CONFIG } from '@/utils/constants'
import { getDaysUntilReview } from '@/utils/spacedRepetition'
import StarRating from '@/components/ui/StarRating.vue'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer.vue'
// Import Bootstrap directly - no declaration needed since it's globally available

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

const statusConfig = STATUS_CONFIG
const dropdownOpen = ref(false)
const notesTooltipElement = ref<HTMLElement | null>(null)

// Quick notes functionality
const showQuickNotes = ref(false)
const quickNote = ref('')

const daysUntilReview = computed(() => {
  return getDaysUntilReview(props.skill)
})

const isDue = computed(() => {
  if (!props.skill.nextReview) return false
  const now = new Date()
  const reviewDate = new Date(props.skill.nextReview)
  return reviewDate <= now
})

const isAlmostDue = computed(() => {
  if (!props.skill.nextReview || isDue.value) return false
  const now = new Date()
  const reviewDate = new Date(props.skill.nextReview)
  const timeDiff = reviewDate.getTime() - now.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  return daysDiff <= 1 // Due within 1 day
})

const focusProgress = computed(() => {
  if (!props.skill.focusData) return 0
  return Math.min(100, (props.skill.focusData.currentXP / props.skill.focusData.targetXP) * 100)
})

const notesPreview = computed(() => {
  if (!props.skill.notes) return ''
  // For preview, we'll show the first 200 characters to allow for markdown formatting
  return props.skill.notes.length > 200 
    ? props.skill.notes.substring(0, 200) + '...'
    : props.skill.notes
})

// Dropdown functionality
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Event handlers
const showPracticeRating = () => {
  dropdownOpen.value = false
  emit('practice-rating', props.skill.id)
}
const showProgressionTimeline = () => {
  dropdownOpen.value = false
  emit('progression-timeline', props.skill.id)
}
const editSkill = () => {
  dropdownOpen.value = false
  emit('edit-skill', props.skill.id)
}
const deleteSkill = () => {
  dropdownOpen.value = false
  emit('delete-skill', props.skill.id)
}
const showStatusEditor = () => emit('status-edit', props.skill.id)
const showTagEditor = () => emit('tags-edit', props.skill.id)
const showNotesEditor = () => emit('notes-edit', props.skill.id)
const showLevelUpModal = () => emit('level-up', props.skill.id)
const moveToAcquisition = () => emit('move-to-acquisition', props.skill.id)

// Quick notes handlers
const showQuickNotesInput = async () => {
  showQuickNotes.value = true
  await nextTick()
  // Focus on the input field
  const input = document.querySelector('.quick-notes-container input') as HTMLInputElement
  if (input) input.focus()
}

const addQuickNote = () => {
  if (quickNote.value.trim()) {
    emit('quick-note', props.skill.id, quickNote.value.trim())
    quickNote.value = ''
    showQuickNotes.value = false
  }
}

const cancelQuickNote = () => {
  quickNote.value = ''
  showQuickNotes.value = false
}

// Initialize tooltip - using custom CSS tooltip (no Bootstrap needed)
onMounted(async () => {
  if (props.skill.notes && props.skill.notes.length > 200 && notesTooltipElement.value) {
    await nextTick()
    // Remove the title attribute to prevent double tooltips (we use our custom CSS tooltip)
    notesTooltipElement.value.removeAttribute('title')
    console.log('Custom tooltip ready for skill:', props.skill.name)
  }
})
</script>

<style scoped>
.skill-card-backlog {
  border-left: 4px solid var(--bs-warning);
  opacity: 0.85;
}

.skill-card-acquisition {
  border-left: 4px solid var(--bs-info);
}

.skill-card-maintenance {
  border-left: 4px solid var(--bs-success);
}

.skill-card-focus {
  border-left: 4px solid var(--bs-danger);
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.2);
}

.skill-card-archived {
  border-left: 4px solid var(--bs-secondary);
  opacity: 0.7;
}

.card {
  transition: transform 0.2s ease-in-out;
  position: relative;
}

.card:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.dropdown-menu {
  z-index: 1050;
}

.clickable-status:hover,
.clickable-tags:hover,
.clickable-notes:hover {
  opacity: 0.8;
  transform: scale(1.02);
  transition: all 0.2s ease-in-out;
}

.clickable-tags:hover,
.clickable-notes:hover {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 2px 4px;
}

.level-up-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  border: none;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
  transition: all 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.level-up-btn:hover {
  background: linear-gradient(135deg, #218838, #1a9880);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
}

.level-up-btn.ready-pulse {
  animation: readyPulse 2s infinite;
}

@keyframes readyPulse {
  0% {
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.6), 0 0 0 4px rgba(40, 167, 69, 0.2);
    transform: translateY(-1px);
  }
  100% {
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
  }
}

/* Notes tooltip styling */
:global(.skill-notes-tooltip) {
  max-width: 400px !important;
  font-size: 0.875rem;
  line-height: 1.4;
}

:global(.skill-notes-tooltip .tooltip-inner) {
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.75rem;
}

/* Custom CSS Tooltip */
.custom-tooltip-container {
  position: relative;
}

.custom-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.4;
  max-width: 400px;
  width: max-content;
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out 0.5s, visibility 0.3s ease-in-out 0.5s;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #333;
}

.custom-tooltip-container:hover .custom-tooltip {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease-in-out 0.5s, visibility 0.3s ease-in-out 0.5s;
}

/* Fast fade-out when not hovering */
.custom-tooltip-container:not(:hover) .custom-tooltip {
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.practice-btn {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
  transition: all 0.2s ease-out;
}

.practice-btn:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);
}

.timeline-btn {
  transition: all 0.2s ease-out;
}

.timeline-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
}

/* Notes preview styling */
.notes-preview-container {
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease-in-out;
}

.notes-preview-container:hover {
  background-color: #e9ecef;
}

.notes-content {
  font-size: 0.75rem;
  line-height: 1.4;
}

.notes-content {
  max-height: 120px;
  overflow: hidden;
}

.notes-content :deep(.markdown-base) {
  font-size: inherit;
  max-height: inherit;
  overflow: hidden;
}

.notes-content :deep(.md-editor-preview) {
  font-size: inherit;
  line-height: inherit;
  max-height: inherit;
}

.notes-content :deep(.md-editor-preview-wrapper) {
  max-height: inherit;
  overflow: hidden;
}

.notes-content :deep(.md-editor-preview p) {
  margin-bottom: 0.25rem;
}

.notes-content :deep(.md-editor-preview h1),
.notes-content :deep(.md-editor-preview h2),
.notes-content :deep(.md-editor-preview h3),
.notes-content :deep(.md-editor-preview h4),
.notes-content :deep(.md-editor-preview h5),
.notes-content :deep(.md-editor-preview h6) {
  margin: 0.25rem 0;
  font-size: 0.85rem;
}

.notes-content :deep(.md-editor-preview ul),
.notes-content :deep(.md-editor-preview ol) {
  margin: 0.25rem 0;
  padding-left: 1rem;
}

.notes-content :deep(.md-editor-preview li) {
  margin-bottom: 0.1rem;
}

/* Due and almost due skill styling */
.skill-due {
  border: 2px solid #dc3545 !important;
  box-shadow: 0 0 15px rgba(220, 53, 69, 0.4), 0 0 30px rgba(220, 53, 69, 0.2) !important;
  animation: dueGlow 2s infinite;
}

.skill-almost-due {
  border: 2px solid #ffc107 !important;
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.3), 0 0 24px rgba(255, 193, 7, 0.15) !important;
  animation: almostDueGlow 3s infinite;
}

@keyframes dueGlow {
  0% {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.4), 0 0 30px rgba(220, 53, 69, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(220, 53, 69, 0.6), 0 0 40px rgba(220, 53, 69, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.4), 0 0 30px rgba(220, 53, 69, 0.2);
  }
}

@keyframes almostDueGlow {
  0% {
    box-shadow: 0 0 12px rgba(255, 193, 7, 0.3), 0 0 24px rgba(255, 193, 7, 0.15);
  }
  50% {
    box-shadow: 0 0 16px rgba(255, 193, 7, 0.5), 0 0 32px rgba(255, 193, 7, 0.25);
  }
  100% {
    box-shadow: 0 0 12px rgba(255, 193, 7, 0.3), 0 0 24px rgba(255, 193, 7, 0.15);
  }
}

/* Quick Notes Styling */
.quick-notes-container {
  animation: slideIn 0.2s ease-out;
}

.quick-notes-trigger .btn {
  transition: all 0.2s ease-in-out;
}

.quick-notes-trigger .btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.quick-notes-container .input-group-text {
  border-color: #ced4da;
  background-color: #f8f9fa;
}

.quick-notes-container .form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>