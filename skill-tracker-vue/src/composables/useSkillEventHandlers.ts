import { useSkillStore } from '@/stores/skillStore'
import { useSkillActions } from './useSkillActions'
import { useToasts } from './useToasts'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'

export function useSkillEventHandlers(modalActions: {
  showPracticeModal: (skill: SkillData) => void
  showTimelineModal: (skill: SkillData) => void
  showEditSkillModal: (skill: SkillData) => void
  showStatusModal: (skill: SkillData) => void
  showTagsModal: (skill: SkillData) => void
  showNotesModal: (skill: SkillData) => void
  showStatusTransitionModal: (skill: SkillData, suggestedStatus: SkillStatus, reason: string) => void
}) {
  const skillStore = useSkillStore()
  const { withSkill } = useSkillActions()
  const { showSuccess } = useToasts()

  return {
    handlePracticeRating: (skillId: string) => {
      withSkill(skillId, modalActions.showPracticeModal)
    },

    handleLevelChange: (skillId: string, newLevel: number) => {
      withSkill(skillId, (skill) => {
        if (confirm(`Change "${skill.name}" to level ${newLevel}?`)) {
          skillStore.updateSkill(skillId, { level: newLevel })
          showSuccess('Level Updated', `${skill.name} is now level ${newLevel}`)
        }
      })
    },

    handleProgressionTimeline: (skillId: string) => {
      withSkill(skillId, modalActions.showTimelineModal)
    },

    handleEditSkill: (skillId: string) => {
      withSkill(skillId, modalActions.showEditSkillModal)
    },

    handleDeleteSkill: (skillId: string) => {
      withSkill(skillId, (skill) => {
        if (confirm(`Are you sure you want to delete "${skill.name}"?`)) {
          skillStore.deleteSkill(skillId)
          showSuccess('Skill Deleted', `${skill.name} has been removed`)
        }
      })
    },

    handleStatusEdit: (skillId: string) => {
      withSkill(skillId, modalActions.showStatusModal)
    },

    handleTagsEdit: (skillId: string) => {
      withSkill(skillId, modalActions.showTagsModal)
    },

    handleNotesEdit: (skillId: string) => {
      withSkill(skillId, modalActions.showNotesModal)
    },

    // handleLevelUp: Removed - level-up functionality now handled through unified practice/level-up system

    handleMoveToAcquisition: (skillId: string) => {
      withSkill(skillId, (skill) => {
        if (confirm(`Start learning "${skill.name}"? This will move it from Backlog to Acquisition status.`)) {
          skillStore.updateSkill(skillId, { status: 'acquisition' })
        }
      })
    },

    handleQuickNote: (skillId: string, note: string) => {
      withSkill(skillId, (skill) => {
        const timestamp = new Date().toISOString()
        
        // Create new quick note entry
        const quickNote = {
          date: timestamp,
          note: note,
          transferredToNotes: false
        }
        
        // Add to existing quick notes
        const updatedQuickNotes = [...(skill.quickNotes || []), quickNote]
        
        skillStore.updateSkill(skillId, { 
          quickNotes: updatedQuickNotes,
          dateModified: timestamp 
        })
        
        // Show success toast
        showSuccess('Quick Note Saved', 'Your note has been added to the timeline')
      })
    },

    handleEditQuickNote: (skillId: string, noteDate: string, currentNote: string) => {
      withSkill(skillId, (skill) => {
        const newNote = prompt('Edit quick note:', currentNote)
        if (newNote !== null && newNote.trim() !== '') {
          const updatedQuickNotes = (skill.quickNotes || []).map(note =>
            note.date === noteDate ? { ...note, note: newNote.trim() } : note
          )
          
          skillStore.updateSkill(skillId, { 
            quickNotes: updatedQuickNotes,
            dateModified: new Date().toISOString()
          })
        }
      })
    },

    handleDeleteQuickNote: (skillId: string, noteDate: string) => {
      withSkill(skillId, (skill) => {
        if (confirm('Are you sure you want to delete this quick note?')) {
          const updatedQuickNotes = (skill.quickNotes || []).filter(note => note.date !== noteDate)
          
          skillStore.updateSkill(skillId, { 
            quickNotes: updatedQuickNotes,
            dateModified: new Date().toISOString()
          })
        }
      })
    },

    handleToggleTransferredToNotes: (skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string) => {
      withSkill(skillId, (skill) => {
        const timestamp = new Date().toISOString()
        
        if (entryType === 'levelup') {
          const updatedHistory = (skill.progressionHistory || []).map(entry =>
            entry.date === entryDate ? { ...entry, transferredToNotes: !entry.transferredToNotes } : entry
          )
          skillStore.updateSkill(skillId, { 
            progressionHistory: updatedHistory,
            dateModified: timestamp 
          })
        } else if (entryType === 'practice') {
          const updatedLog = (skill.practiceLog || []).map(entry =>
            entry.date === entryDate ? { ...entry, transferredToNotes: !entry.transferredToNotes } : entry
          )
          skillStore.updateSkill(skillId, { 
            practiceLog: updatedLog,
            dateModified: timestamp 
          })
        } else if (entryType === 'quicknote') {
          const updatedNotes = (skill.quickNotes || []).map(entry =>
            entry.date === entryDate ? { ...entry, transferredToNotes: !entry.transferredToNotes } : entry
          )
          skillStore.updateSkill(skillId, { 
            quickNotes: updatedNotes,
            dateModified: timestamp 
          })
        }
      })
    }
  }
}