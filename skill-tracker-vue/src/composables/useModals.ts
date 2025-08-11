import { reactive, nextTick } from 'vue'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'
import type { 
  AllModalStates, 
  ModalEventHandlers, 
  ModalId 
} from '@/types/modals'
import { showModal, hideModal } from '@/utils/modalManager'
import { useToasts } from './useToasts'

export function useModals(handlers: ModalEventHandlers) {
  const { showSuccess } = useToasts()
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

  // Generic modal show function
  async function openModal(modalType: keyof AllModalStates, skill?: SkillData | null) {
    // Set modal state
    modalStates[modalType].isVisible = true
    if ('selectedSkill' in modalStates[modalType] && skill !== undefined) {
      const modal = modalStates[modalType] as { selectedSkill?: SkillData | null }
      modal.selectedSkill = skill
    }

    // Show Bootstrap modal
    const modalId = getModalId(modalType)
    await nextTick()
    await showModal(modalId)
  }

  // Generic modal close function
  async function closeModal(modalType: keyof AllModalStates) {
    // Hide Bootstrap modal first
    const modalId = getModalId(modalType)
    await hideModal(modalId)

    // Clear modal state
    modalStates[modalType].isVisible = false
    if ('selectedSkill' in modalStates[modalType]) {
      const modal = modalStates[modalType] as { selectedSkill?: SkillData | null }
      modal.selectedSkill = null
    }
  }

  // Map modal types to DOM element IDs
  function getModalId(modalType: keyof AllModalStates): ModalId {
    const modalIdMap: Record<keyof AllModalStates, ModalId> = {
      skill: 'skillModal',
      practice: 'practiceRatingModal',
      timeline: 'progressionTimelineModal',
      status: 'statusEditorModal',
      tags: 'tagsEditorModal',
      notes: 'notesEditorModal',
      trainingLog: 'trainingLogModal',
      statusTransition: 'statusTransitionModal',
    }
    return modalIdMap[modalType]
  }

  // Specific modal actions
  const modalActions = {
    // Skill Modal
    showAddSkillModal: () => openModal('skill', null),
    showEditSkillModal: (skill: SkillData) => openModal('skill', skill),
    closeSkillModal: () => closeModal('skill'),
    
    // Practice Rating Modal
    showPracticeModal: (skill: SkillData) => openModal('practice', skill),
    closePracticeModal: () => closeModal('practice'),
    
    // Timeline Modal
    showTimelineModal: (skill: SkillData) => openModal('timeline', skill),
    closeTimelineModal: () => closeModal('timeline'),
    
    // Status Editor Modal
    showStatusModal: (skill: SkillData) => openModal('status', skill),
    closeStatusModal: () => closeModal('status'),
    
    // Tags Editor Modal
    showTagsModal: (skill: SkillData) => openModal('tags', skill),
    closeTagsModal: () => closeModal('tags'),
    
    // Notes Editor Modal
    showNotesModal: (skill: SkillData) => openModal('notes', skill),
    closeNotesModal: () => closeModal('notes'),
    
    // Training Log Modal
    showTrainingLogModal: () => openModal('trainingLog'),
    closeTrainingLogModal: () => closeModal('trainingLog'),
    
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

    handlePracticeComplete: (skillId: string, quality: number, notes: string, isLevelUp?: boolean, levelUpComment?: string) => {
      handlers.onPracticeComplete(skillId, quality, notes, isLevelUp, levelUpComment)
      modalActions.closePracticeModal()
      
      const skill = modalStates.practice.selectedSkill
      if (skill) {
        const qualityText = ['Forgotten', 'Hard', 'Good', 'Very Easy'][quality - 1]
        showSuccess('Practice Complete', `${skill.name} - ${qualityText}${isLevelUp ? ' (Level Up!)' : ''}`)
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