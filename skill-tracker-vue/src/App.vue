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
        @export-data="handleExportData"
        @import-data="handleImportData"
        @delete-all-skills="handleDeleteAllSkills"
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

    <!-- Toast Notifications -->
    <ToastManager />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useDarkModeStore } from '@/stores/darkModeStore'
import { useViewModeStore } from '@/stores/viewModeStore'
import { useToasts } from '@/composables/useToasts'
import { useModals } from '@/composables/useModals'
import { useModalEventHandlers } from '@/composables/useModalEventHandlers'
import { useSkillEventHandlers } from '@/composables/useSkillEventHandlers'
import { useAppEventHandlers } from '@/composables/useAppEventHandlers'

// Components
import AppHeader from '@/components/layout/AppHeader.vue'
import MainSkillInterface from '@/components/layout/MainSkillInterface.vue'
import ModalManager from '@/components/layout/ModalManager.vue'
import ToastManager from '@/components/layout/ToastManager.vue'

// Stores
const skillStore = useSkillStore()
const darkModeStore = useDarkModeStore()
const viewModeStore = useViewModeStore()
const { showSuccess, showError } = useToasts()

// Initialize preferences from localStorage
onMounted(() => {
  darkModeStore.loadDarkModePreference()
  viewModeStore.loadViewModePreference()
})

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

// Data export/import handlers
const handleExportData = async () => {
  try {
    const jsonData = await skillStore.exportData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `skill-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSuccess('Export Complete', `Successfully exported ${skills.value.length} skills to JSON backup file.`)
  } catch (error) {
    console.error('Export failed:', error)
    showError('Export Failed', 'Unable to export your skill data. Please try again.')
  }
}

const handleImportData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const result = await skillStore.importData(text)
      
      if (result.success) {
        let message = `Successfully imported ${result.skillsImported} skills.`
        if (result.errors && result.errors.length > 0) {
          message += ` ${result.errors.length} skills had validation errors and were skipped.`
        }
        showSuccess('Import Complete', message)
      }
    } catch (error) {
      console.error('Import failed:', error)
      showError('Import Failed', error instanceof Error ? error.message : 'Unable to import skill data.')
    }
  }
  input.click()
}

const handleDeleteAllSkills = async () => {
  // Confirmation dialog
  if (!confirm('⚠️ WARNING: This will permanently delete ALL skills and cannot be undone!\n\nAre you absolutely sure you want to continue?')) {
    return
  }
  
  // Second confirmation
  if (!confirm('This is your final warning. ALL DATA WILL BE LOST.\n\nClick OK to proceed with deletion.')) {
    return
  }
  
  try {
    await skillStore.deleteAllSkills()
    showSuccess('All Skills Deleted', 'Successfully deleted all skills from storage.')
  } catch (error) {
    console.error('Delete all failed:', error)
    showError('Delete Failed', 'Unable to delete all skills. Please try again.')
  }
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