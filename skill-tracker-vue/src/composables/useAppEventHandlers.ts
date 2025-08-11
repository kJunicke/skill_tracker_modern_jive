import { useSkillStore } from '@/stores/skillStore'
import type { ProgressionEntry, PracticeSession } from '@/types/skill'

export function useAppEventHandlers() {
  const skillStore = useSkillStore()

  const handleLevelUpCommentEdit = (skillId: string, levelUpData: ProgressionEntry) => {
    const currentComment = levelUpData.comment || ''
    const newComment = prompt('Edit level-up comment:', currentComment)
    
    if (newComment !== null && newComment !== currentComment) {
      skillStore.updateLevelUpComment(skillId, levelUpData.level, newComment)
    }
  }

  const handlePracticeNoteEdit = (skillId: string, practiceData: PracticeSession) => {
    const currentNote = practiceData.note || ''
    const newNote = prompt('Edit practice note:', currentNote)
    
    if (newNote !== null && newNote !== currentNote) {
      skillStore.updatePracticeNote(skillId, practiceData.date, newNote)
    }
  }

  const resetTestEnvironment = () => {
    if (confirm('Reset to test skills? This will replace all current skills with test data.')) {
      skillStore.resetTestEnvironment()
    }
  }

  return {
    handleLevelUpCommentEdit,
    handlePracticeNoteEdit,
    resetTestEnvironment
  }
}