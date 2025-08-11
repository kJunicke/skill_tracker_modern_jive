<template>
  <div id="app" class="bg-light min-vh-100">
    <div class="container-fluid py-4" style="max-width: 1400px; margin: 0 auto;">
      <!-- Header -->
      <AppHeader />

      <!-- Main skill management interface -->
      <MainSkillInterface
        :filtered-skills="filteredSkills"
        :total-skills="skills.length"
        :filters="filters"
        :sorting="sorting"
        @show-training-log="showTrainingLogModal"
        @reset-test-environment="appEventHandlers.resetTestEnvironment"
        @add-skill="showAddSkillModal"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
        @sort-direction-toggle="toggleSortDirection"
        @practice-rating="handlePracticeRating"
        @level-change="handleLevelChangeWrapper"
        @progression-timeline="handleProgressionTimeline"
        @edit-skill="handleEditSkill"
        @delete-skill="handleDeleteSkill"
        @status-edit="handleStatusEdit"
        @tags-edit="handleTagsEdit"
        @notes-edit="handleNotesEdit"
        @level-up="handleLevelUp"
        @move-to-acquisition="handleMoveToAcquisition"
        @quick-note="(event: {skillId: string, note: string}) => handleQuickNote(event.skillId, event.note)"
      />
    </div>

    <!-- All Modals -->
    <ModalManager
      :skills="skills"
      :modal-states="modalStates"
      @save-skill="handleSaveSkill"
      @close-skill-modal="closeSkillModal"
      @practice-complete="handlePracticeComplete"
      @close-practice-modal="closePracticeModal"
      @close-timeline-modal="closeTimelineModal"
      @edit-notes="handleNotesEdit"
      @edit-levelup-comment="appEventHandlers.handleLevelUpCommentEdit"
      @edit-practice-note="appEventHandlers.handlePracticeNoteEdit"
      @edit-quick-note="handleEditQuickNote"
      @delete-quick-note="handleDeleteQuickNote"
      @toggle-transferred-to-notes="handleToggleTransferredToNotes"
      @status-changed="handleStatusChanged"
      @close-status-modal="closeStatusModal"
      @tags-changed="handleTagsChanged"
      @close-tags-modal="closeTagsModal"
      @notes-changed="handleNotesChanged"
      @close-notes-modal="closeNotesModal"
      @close-training-log-modal="closeTrainingLogModal"
      @status-transition-confirm="handleStatusTransitionConfirm"
      @close-status-transition-modal="closeStatusTransitionModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useModals } from '@/composables/useModals'
import { useModalEventHandlers } from '@/composables/useModalEventHandlers'
import { useSkillEventHandlers } from '@/composables/useSkillEventHandlers'
import { useAppEventHandlers } from '@/composables/useAppEventHandlers'

// Components
import AppHeader from '@/components/layout/AppHeader.vue'
import MainSkillInterface from '@/components/layout/MainSkillInterface.vue'
import ModalManager from '@/components/layout/ModalManager.vue'

// Store
const skillStore = useSkillStore()

// Reactive references from store
const skills = computed(() => skillStore.skills)
const filteredSkills = computed(() => skillStore.filteredSkills)
const filters = computed(() => skillStore.filters)
const sorting = computed(() => skillStore.sorting)

// Event handlers
const modalEventHandlers = useModalEventHandlers()
const appEventHandlers = useAppEventHandlers()

// Initialize modals composable
const {
  modalStates,
  showAddSkillModal,
  showEditSkillModal,
  closeSkillModal,
  showPracticeModal,
  closePracticeModal,
  showTimelineModal,
  closeTimelineModal,
  showStatusModal,
  closeStatusModal,
  showTagsModal,  
  closeTagsModal,
  showNotesModal,
  closeNotesModal,
  showTrainingLogModal,
  closeTrainingLogModal,
  showStatusTransitionModal,
  closeStatusTransitionModal,
  handleSaveSkill,
  handlePracticeComplete,
  handleStatusChanged,
  handleTagsChanged,
  handleNotesChanged,
  handleStatusTransitionConfirm
} = useModals(modalEventHandlers)

// Skill event handlers
const skillEventHandlers = useSkillEventHandlers({
  showPracticeModal,
  showTimelineModal,
  showEditSkillModal,
  showStatusModal,
  showTagsModal,
  showNotesModal,
  showStatusTransitionModal
})

const {
  handlePracticeRating,
  handleLevelChange,
  handleProgressionTimeline,
  handleEditSkill,
  handleDeleteSkill,
  handleStatusEdit,
  handleTagsEdit,
  handleNotesEdit,
  handleLevelUp,
  handleMoveToAcquisition,
  handleQuickNote,
  handleEditQuickNote,
  handleDeleteQuickNote,
  handleToggleTransferredToNotes
} = skillEventHandlers

// Store event handlers
const setFilter = skillStore.setFilter
const setSorting = skillStore.setSorting
const toggleSortDirection = skillStore.toggleSortDirection

// Handle filter change event with object parameter
const handleFilterChange = (filter: {key: string, value: string}) => {
  setFilter(filter.key as keyof typeof filters.value, filter.value)
}

// Handle sort change event - receives field only, maintains current direction
const handleSortChange = (field: string) => {
  setSorting(field as "name" | "level" | "reviewDate", sorting.value.direction)
}

// Handle level change event with object parameter (fix for TypeScript error)  
const handleLevelChangeWrapper = (data: {skillId: string, newLevel: number}) => {
  handleLevelChange(data.skillId, data.newLevel)
}
</script>

<style>
/* Global styles */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.text-primary {
  color: #fff !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.bg-light {
  background: transparent !important;
}

/* Button hover effects */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Card hover effects */
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style>