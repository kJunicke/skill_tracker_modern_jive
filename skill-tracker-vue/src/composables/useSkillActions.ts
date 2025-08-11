import { useSkillStore } from '@/stores/skillStore'
import type { SkillData } from '@/types/skill'

export function useSkillActions() {
  const skillStore = useSkillStore()

  const withSkill = (skillId: string, action: (skill: SkillData) => void) => {
    const skill = skillStore.skills.find(s => s.id === skillId)
    if (skill) {
      action(skill)
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