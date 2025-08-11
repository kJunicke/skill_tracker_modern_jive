import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import SkillCard from '../SkillCard.vue'
import type { SkillData } from '@/types/skill'
import { createMockSkill } from '@/services/__tests__/testHelpers'

// Mock child components
vi.mock('../card/SkillCardHeader.vue', () => ({
  default: {
    name: 'SkillCardHeader',
    template: '<div data-testid="skill-card-header">Header</div>',
    props: ['skill'],
    emits: ['edit-skill', 'delete-skill', 'progression-timeline']
  }
}))

vi.mock('../card/SkillCardProgress.vue', () => ({
  default: {
    name: 'SkillCardProgress',
    template: '<div data-testid="skill-card-progress">Progress</div>',
    props: ['skill'],
    emits: ['level-up']
  }
}))

vi.mock('../card/SkillCardStatus.vue', () => ({
  default: {
    name: 'SkillCardStatus',
    template: '<div data-testid="skill-card-status">Status</div>',
    props: ['skill'],
    emits: ['status-edit', 'tags-edit']
  }
}))

vi.mock('../card/SkillCardNotes.vue', () => ({
  default: {
    name: 'SkillCardNotes',
    template: '<div data-testid="skill-card-notes">Notes</div>',
    props: ['skill'],
    emits: ['notes-edit']
  }
}))

vi.mock('../card/SkillCardActions.vue', () => ({
  default: {
    name: 'SkillCardActions',
    template: '<div data-testid="skill-card-actions">Actions</div>',
    props: ['skill'],
    emits: ['practice-rating', 'level-up', 'move-to-acquisition', 'quick-note']
  }
}))

// Mock utility functions
vi.mock('@/utils/spacedRepetition', () => ({
  getDaysUntilReview: vi.fn().mockReturnValue(5)
}))

describe('SkillCard', () => {
  let wrapper: VueWrapper
  let mockSkill: SkillData

  beforeEach(() => {
    mockSkill = createMockSkill({
      id: 'test-skill',
      name: 'Test Skill',
      status: 'acquisition',
      level: 3
    })
  })

  const createWrapper = (skill: SkillData = mockSkill) => {
    return mount(SkillCard, {
      props: { skill }
    })
  }

  describe('Component Structure', () => {
    it('renders all child components', () => {
      wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="skill-card-header"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skill-card-progress"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skill-card-status"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skill-card-notes"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="skill-card-actions"]').exists()).toBe(true)
    })

    it('applies correct CSS classes based on skill status', () => {
      wrapper = createWrapper(createMockSkill({ status: 'focus' }))
      
      expect(wrapper.classes()).toContain('skill-card-focus')
      expect(wrapper.classes()).toContain('card')
      expect(wrapper.classes()).toContain('h-100')
      expect(wrapper.classes()).toContain('shadow-sm')
    })

    it('applies different status classes correctly', () => {
      const statuses = ['backlog', 'acquisition', 'maintenance', 'focus', 'archived'] as const
      
      statuses.forEach(status => {
        wrapper = createWrapper(createMockSkill({ status }))
        expect(wrapper.classes()).toContain(`skill-card-${status}`)
      })
    })
  })

  describe('Due Status Styling', () => {
    beforeEach(() => {
      // Reset the mock
      vi.clearAllMocks()
    })

    it('applies due styling when skill is overdue', async () => {
      const { getDaysUntilReview } = await import('@/utils/spacedRepetition')
      vi.mocked(getDaysUntilReview).mockReturnValue(-2)
      
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      
      expect(wrapper.classes()).toContain('skill-due')
      expect(wrapper.classes()).not.toContain('skill-almost-due')
    })

    it('applies almost-due styling when skill is due soon', async () => {
      const { getDaysUntilReview } = await import('@/utils/spacedRepetition')
      vi.mocked(getDaysUntilReview).mockReturnValue(0.5)
      
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      
      expect(wrapper.classes()).toContain('skill-almost-due')
      expect(wrapper.classes()).not.toContain('skill-due')
    })

    it('does not apply due styling when skill is not due', async () => {
      const { getDaysUntilReview } = await import('@/utils/spacedRepetition')
      vi.mocked(getDaysUntilReview).mockReturnValue(5)
      
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      
      expect(wrapper.classes()).not.toContain('skill-due')
      expect(wrapper.classes()).not.toContain('skill-almost-due')
    })

    it('handles skills without nextReview date', () => {
      wrapper = createWrapper(createMockSkill({ nextReview: undefined }))
      
      expect(wrapper.classes()).not.toContain('skill-due')
      expect(wrapper.classes()).not.toContain('skill-almost-due')
    })
  })

  describe('Event Propagation', () => {
    beforeEach(() => {
      wrapper = createWrapper()
    })

    it('emits edit-skill event from header', async () => {
      const header = wrapper.findComponent({ name: 'SkillCardHeader' })
      await header.vm.$emit('edit-skill', 'test-skill')
      
      expect(wrapper.emitted('edit-skill')).toEqual([['test-skill']])
    })

    it('emits delete-skill event from header', async () => {
      const header = wrapper.findComponent({ name: 'SkillCardHeader' })
      await header.vm.$emit('delete-skill', 'test-skill')
      
      expect(wrapper.emitted('delete-skill')).toEqual([['test-skill']])
    })

    it('emits progression-timeline event from header', async () => {
      const header = wrapper.findComponent({ name: 'SkillCardHeader' })
      await header.vm.$emit('progression-timeline', 'test-skill')
      
      expect(wrapper.emitted('progression-timeline')).toEqual([['test-skill']])
    })

    it('emits level-up event from progress', async () => {
      const progress = wrapper.findComponent({ name: 'SkillCardProgress' })
      await progress.vm.$emit('level-up', 'test-skill')
      
      expect(wrapper.emitted('level-up')).toEqual([['test-skill']])
    })

    it('emits status-edit event from status', async () => {
      const status = wrapper.findComponent({ name: 'SkillCardStatus' })
      await status.vm.$emit('status-edit', 'test-skill')
      
      expect(wrapper.emitted('status-edit')).toEqual([['test-skill']])
    })

    it('emits tags-edit event from status', async () => {
      const status = wrapper.findComponent({ name: 'SkillCardStatus' })
      await status.vm.$emit('tags-edit', 'test-skill')
      
      expect(wrapper.emitted('tags-edit')).toEqual([['test-skill']])
    })

    it('emits notes-edit event from notes', async () => {
      const notes = wrapper.findComponent({ name: 'SkillCardNotes' })
      await notes.vm.$emit('notes-edit', 'test-skill')
      
      expect(wrapper.emitted('notes-edit')).toEqual([['test-skill']])
    })

    it('emits practice-rating event from actions', async () => {
      const actions = wrapper.findComponent({ name: 'SkillCardActions' })
      await actions.vm.$emit('practice-rating', 'test-skill')
      
      expect(wrapper.emitted('practice-rating')).toEqual([['test-skill']])
    })

    it('emits move-to-acquisition event from actions', async () => {
      const actions = wrapper.findComponent({ name: 'SkillCardActions' })
      await actions.vm.$emit('move-to-acquisition', 'test-skill')
      
      expect(wrapper.emitted('move-to-acquisition')).toEqual([['test-skill']])
    })

    it('emits quick-note event from actions with note text', async () => {
      const actions = wrapper.findComponent({ name: 'SkillCardActions' })
      await actions.vm.$emit('quick-note', 'test-skill', 'Test note')
      
      expect(wrapper.emitted('quick-note')).toEqual([['test-skill', 'Test note']])
    })
  })

  describe('Props Passing', () => {
    it('passes skill prop to all child components', () => {
      wrapper = createWrapper()
      
      const childComponents = [
        wrapper.findComponent({ name: 'SkillCardHeader' }),
        wrapper.findComponent({ name: 'SkillCardProgress' }),
        wrapper.findComponent({ name: 'SkillCardStatus' }),
        wrapper.findComponent({ name: 'SkillCardNotes' }),
        wrapper.findComponent({ name: 'SkillCardActions' })
      ]
      
      childComponents.forEach(component => {
        expect(component.props('skill')).toEqual(mockSkill)
      })
    })

    it('updates child components when skill prop changes', async () => {
      wrapper = createWrapper()
      
      const newSkill = createMockSkill({ id: 'new-skill', name: 'New Skill' })
      await wrapper.setProps({ skill: newSkill })
      
      const header = wrapper.findComponent({ name: 'SkillCardHeader' })
      expect(header.props('skill')).toEqual(newSkill)
    })
  })

  describe('Computed Properties', () => {
    it('correctly calculates due status based on days until review', async () => {
      const { getDaysUntilReview } = await import('@/utils/spacedRepetition')
      
      // Test overdue
      vi.mocked(getDaysUntilReview).mockReturnValue(-1)
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      expect(wrapper.classes()).toContain('skill-due')
      
      // Test almost due
      vi.mocked(getDaysUntilReview).mockReturnValue(0.5)
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      expect(wrapper.classes()).toContain('skill-almost-due')
      
      // Test not due
      vi.mocked(getDaysUntilReview).mockReturnValue(5)
      wrapper = createWrapper(createMockSkill({ nextReview: '2023-01-01T00:00:00.000Z' }))
      expect(wrapper.classes()).not.toContain('skill-due')
      expect(wrapper.classes()).not.toContain('skill-almost-due')
    })
  })
})