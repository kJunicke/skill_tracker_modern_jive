import { reactive } from 'vue'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'
import type { 
  AllModalStates, 
  ModalEventHandlers
} from '@/types/modals'
import { useToasts } from './useToasts'
import { useSkillStore } from '@/stores/skillStore'

export function useModals(handlers: ModalEventHandlers) {
  const { showSuccess } = useToasts()
  const skillStore = useSkillStore()
  
  // Modal states - reactive for Vue reactivity
  const modalStates = reactive<AllModalStates>({
    skill: {
      isVisible: false,
      selectedSkill: null
    },
    practice: {
      isVisible: false,
      selectedSkill: null
    },
    timeline: {
      isVisible: false,
      selectedSkill: null
    },
    status: {
      isVisible: false,
      selectedSkill: null
    },
    tags: {
      isVisible: false,
      selectedSkill: null
    },
    notes: {
      isVisible: false,
      selectedSkill: null
    },
    trainingLog: {
      isVisible: false
    },
    statusTransition: {
      isVisible: false,
      selectedSkill: null,
      suggestedStatus: undefined,
      reason: ''
    }
  })


  // Specific modal actions
  const modalActions = {
    // Skill Modal (Vue 3 Teleport - no Bootstrap dependency)
    showAddSkillModal: () => {
      modalStates.skill.selectedSkill = null
      modalStates.skill.isVisible = true
    },
    showEditSkillModal: (skill: SkillData) => {
      modalStates.skill.selectedSkill = skill
      modalStates.skill.isVisible = true
    },
    closeSkillModal: () => {
      modalStates.skill.isVisible = false
      modalStates.skill.selectedSkill = null
    },
    
    // Practice Rating Modal (Vue 3 Teleport - no Bootstrap dependency)
    showPracticeModal: (skill: SkillData) => {
      modalStates.practice.selectedSkill = skill
      modalStates.practice.isVisible = true
    },
    closePracticeModal: () => {
      modalStates.practice.isVisible = false
      modalStates.practice.selectedSkill = null
    },
    
    // Timeline Modal (Vue 3 Teleport - no Bootstrap dependency)
    showTimelineModal: (skill: SkillData) => {
      modalStates.timeline.selectedSkill = skill
      modalStates.timeline.isVisible = true
    },
    closeTimelineModal: () => {
      modalStates.timeline.isVisible = false
      modalStates.timeline.selectedSkill = null
    },
    
    // Status Editor Modal (Vue 3 Teleport - no Bootstrap dependency)
    showStatusModal: (skill: SkillData) => {
      modalStates.status.selectedSkill = skill
      modalStates.status.isVisible = true
    },
    closeStatusModal: () => {
      modalStates.status.isVisible = false
      modalStates.status.selectedSkill = null
    },
    
    // Tags Editor Modal (Vue 3 Teleport - no Bootstrap dependency)
    showTagsModal: (skill: SkillData) => {
      modalStates.tags.selectedSkill = skill
      modalStates.tags.isVisible = true
    },
    closeTagsModal: () => {
      modalStates.tags.isVisible = false
      modalStates.tags.selectedSkill = null
    },
    
    // Notes Editor Modal (Vue 3 Teleport - no Bootstrap dependency)
    showNotesModal: (skill: SkillData) => {
      modalStates.notes.selectedSkill = skill
      modalStates.notes.isVisible = true
    },
    closeNotesModal: () => {
      modalStates.notes.isVisible = false
      modalStates.notes.selectedSkill = null
    },
    
    // Training Log Modal (Vue 3 Teleport - no Bootstrap dependency)
    showTrainingLogModal: () => {
      modalStates.trainingLog.isVisible = true
    },
    closeTrainingLogModal: () => {
      modalStates.trainingLog.isVisible = false
    },
    
    // Status Transition Modal
    showStatusTransitionModal: (skill: SkillData, suggestedStatus: SkillStatus, reason: string) => {
      modalStates.statusTransition.selectedSkill = skill
      modalStates.statusTransition.suggestedStatus = suggestedStatus
      modalStates.statusTransition.reason = reason
      modalStates.statusTransition.isVisible = true
    },
    closeStatusTransitionModal: () => closeModal('statusTransition'),
    
  }

  // Event handlers with proper type safety
  const eventHandlers = {
    handleSaveSkill: (skillData: Partial<SkillData>) => {
      handlers.onSaveSkill(skillData)
      modalActions.closeSkillModal()
      showSuccess('Skill Saved', `${skillData.name || 'Skill'} has been saved successfully`)
    },

    handlePracticeComplete: async (skillId: string, quality: number, notes: string, isLevelUp?: boolean) => {
      await handlers.onPracticeComplete(skillId, quality, notes, isLevelUp)
      modalActions.closePracticeModal()
      
      const skill = modalStates.practice.selectedSkill
      if (skill) {
        const qualityText = ['Forgotten', 'Hard', 'Good', 'Very Easy'][quality - 1]
        showSuccess('Practice Complete', `${skill.name} - ${qualityText}${isLevelUp ? ' (Level Up!)' : ''}`)
      }

      // Check if status transition should be suggested after practice session
      const transitionSuggestion = await skillStore.shouldSuggestStatusTransition(skillId)
      
      if (transitionSuggestion.shouldSuggest && transitionSuggestion.suggestedStatus) {
        // Get the updated skill data
        const updatedSkill = skillStore.skills.find(s => s.id === skillId)
        
        if (updatedSkill) {
          modalActions.showStatusTransitionModal(
            updatedSkill, 
            transitionSuggestion.suggestedStatus,
            transitionSuggestion.reason || ''
          )
        }
      }
    },

    handleStatusChanged: (data: {skillId: string, newStatus: string}) => {
      handlers.onStatusChanged(data.skillId, data.newStatus)
      modalActions.closeStatusModal()
    },

    handleTagsChanged: (data: {skillId: string, newTags: string[]}) => {
      handlers.onTagsChanged(data.skillId, data.newTags)
      modalActions.closeTagsModal()
    },

    handleNotesChanged: (skillId: string, newNotes: string) => {
      handlers.onNotesChanged(skillId, newNotes)
      modalActions.closeNotesModal()
    },

    handleStatusTransitionConfirm: (skillId: string, newStatus: SkillStatus) => {
      handlers.onStatusTransitionConfirm(skillId, newStatus)
      modalActions.closeStatusTransitionModal()
    },

  }

  return {
    // State
    modalStates,
    
    // Actions
    ...modalActions,
    
    // Event Handlers
    ...eventHandlers
  }
}