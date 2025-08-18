import { useSkillStore } from '@/stores/skillStore'
import { useSkillActions } from './useSkillActions'
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

    onPracticeComplete: async (skillId: string, quality: number, notes: string, isLevelUp?: boolean) => {
      // Find current skill to get level for level-up calculation
      const currentSkill = skillStore.skills.find(s => s.id === skillId)
      if (!currentSkill) return

      // Prepare level-up info if this is a level-up session
      const levelUpInfo = isLevelUp ? {
        newLevel: currentSkill.level + 1,
        comment: notes // Use the same notes for level-up comment
      } : undefined

      // Use unified practice session recording with optional level-up
      await skillStore.recordPracticeSessionWithLevelUp(skillId, quality, notes, levelUpInfo)
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