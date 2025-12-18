import { useSkillStore } from '@/stores/skillStore'
import type { SkillData } from '@/types/skill'

export function useSkillActions() {
  const skillStore = useSkillStore()

  const withSkill = (skillId: string, action: (skill: SkillData) => void) => {
    const skill = skillStore.skills.find(s => s.id === skillId)
    if (skill) {
      action(skill)
    } else {
      console.warn(`[FALLBACK] useSkillActions.withSkill: Skill not found for id "${skillId}". Action skipped. Reason: skill may have been deleted or not yet loaded.`)
    }
  }

  const getSkill = (skillId: string): SkillData | undefined => {
    return skillStore.skills.find(s => s.id === skillId)
  }

  return {
    withSkill,
    getSkill
  }
}