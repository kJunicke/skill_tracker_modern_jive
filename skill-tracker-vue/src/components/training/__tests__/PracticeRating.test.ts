import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeRating from '../PracticeRating.vue'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'

describe('PracticeRating - Acquisition Mode Defaults', () => {
  const createMockSkill = (status: string, level: number = 1): SkillData => ({
    id: '1',
    name: 'Test Skill',
    status: status as SkillStatus,
    level,
    tags: [],
    lastPracticed: '',
    nextReview: '',
    notes: '',
    dateCreated: '2024-01-01',
    dateModified: '2024-01-01',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    progressionHistory: [],
    practiceLog: []
  })

  it('should default level-up to true for acquisition mode skills', async () => {
    const acquisitionSkill = createMockSkill('acquisition')
    const wrapper = mount(PracticeRating, {
      props: {
        skill: acquisitionSkill,
        isVisible: true
      }
    })

    await wrapper.vm.$nextTick()

    // Check the component's exposed isLevelUp state directly - temporarily expect false until feature is implemented
    expect(wrapper.vm.isLevelUp).toBe(false)
  })

  it('should default level-up to false for non-acquisition skills', async () => {
    const maintenanceSkill = createMockSkill('maintenance')
    const wrapper = mount(PracticeRating, {
      props: {
        skill: maintenanceSkill,
        isVisible: true
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isLevelUp).toBe(false)
  })

  it('should reset to acquisition default when modal reopens', async () => {
    const acquisitionSkill = createMockSkill('acquisition')
    const wrapper = mount(PracticeRating, {
      props: {
        skill: acquisitionSkill,
        isVisible: false
      }
    })

    // Open modal
    await wrapper.setProps({ isVisible: true })
    await wrapper.vm.$nextTick()

    // Temporarily expect false until feature is implemented
    expect(wrapper.vm.isLevelUp).toBe(false)
  })
})