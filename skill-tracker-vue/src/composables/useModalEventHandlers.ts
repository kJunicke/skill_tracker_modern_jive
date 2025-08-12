// import { computed } from 'vue'
import { useSkillStore } from '@/stores/skillStore'
import { useSkillActions } from './useSkillActions'
import { updateSM2Parameters, handleFocusProgression } from '@/utils/spacedRepetition'
import { dateUtils } from '@/utils/dateHelpers'
import { initializeFocusData, calculateTargetXP } from '@/utils/focusDataHelpers'
import type { SkillData } from '@/types/skill'
import type { ModalEventHandlers } from '@/types/modals'
import type { SkillStatus, SkillTag } from '@/utils/constants'

export function useModalEventHandlers(): ModalEventHandlers {
  const skillStore = useSkillStore()
  const { withSkill } = useSkillActions()

  return {
    onSaveSkill: (skillData: Partial<SkillData>) => {
      if (skillData.id) {
        skillStore.updateSkill(skillData.id, skillData)
      } else {
        skillStore.addSkill(skillData as Omit<SkillData, 'id'>)
      }
    },

    onPracticeComplete: (skillId: string, quality: number, notes: string, isLevelUp?: boolean, levelUpComment?: string) => {
      withSkill(skillId, (skill) => {
        // Always record the practice session first
        const sm2Updates = updateSM2Parameters(skill, quality)
        const focusUpdates = skill.status === 'focus' 
          ? handleFocusProgression(skill, quality) 
          : {}

        const practiceEntry = {
          date: dateUtils.now(),
          quality,
          qualityText: ['Completely Forgotten', 'Hard', 'Good', 'Very Easy'][quality],
          note: notes
        }

        const updates = {
          ...sm2Updates,
          ...focusUpdates,
          lastPracticed: dateUtils.now(),
          practiceLog: [...(skill.practiceLog || []), practiceEntry],
          dateModified: dateUtils.now()
        }

        skillStore.updateSkill(skillId, updates)

        // If this is also a level-up, record that separately
        if (isLevelUp && levelUpComment) {
          skillStore.levelUpSkill(skillId, skill.level + 1, levelUpComment)
        }
      })
    },

    onStatusChanged: (skillId: string, newStatus: string) => {
      withSkill(skillId, (skill) => {
        const updates: Partial<SkillData> = {
          status: newStatus as SkillStatus,
          dateModified: dateUtils.now()
        }

        if (newStatus === 'focus' && skill.status !== 'focus') {
          updates.focusData = initializeFocusData({
            targetXP: calculateTargetXP(skill.level)
          }, skill.level)
        }

        if (skill.status === 'focus' && newStatus !== 'focus') {
          updates.focusData = undefined
        }

        if (newStatus === 'archived') {
          updates.nextReview = dateUtils.addDays(dateUtils.now(), 3650)
        }

        skillStore.updateSkill(skillId, updates)
      })
    },

    onTagsChanged: (skillId: string, newTags: string[]) => {
      const updates = {
        tags: newTags as SkillTag[],
        dateModified: dateUtils.now()
      }
      skillStore.updateSkill(skillId, updates)
    },

    onNotesChanged: (skillId: string, newNotes: string) => {
      const updates = {
        notes: newNotes,
        dateModified: dateUtils.now()
      }
      skillStore.updateSkill(skillId, updates)
    },

    onStatusTransitionConfirm: (skillId: string, newStatus: SkillStatus) => {
      const updates = {
        status: newStatus,
        dateModified: dateUtils.now()
      }
      skillStore.updateSkill(skillId, updates)
    },

  }
}