import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillCardStatus from '../SkillCardStatus.vue'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'

// Mock constants
vi.mock('@/utils/constants', () => ({
  STATUS_CONFIG: {
    backlog: {
      label: 'Backlog',
      icon: 'bi-bookmark',
      color: 'warning',
      description: 'Want to learn someday'
    },
    acquisition: {
      label: 'Acquisition',
      icon: 'bi-plus-circle',
      color: 'info',
      description: 'Learning now'
    },
    maintenance: {
      label: 'Maintenance',
      icon: 'bi-arrow-clockwise',
      color: 'success',
      description: 'Keep current level'
    }
  }
}))

// Mock spaced repetition utils
vi.mock('@/utils/spacedRepetition', () => ({
  getDaysUntilReview: vi.fn(() => 5)
}))

describe('SkillCardStatus', () => {
  const createSkillMock = (overrides: Partial<SkillData> = {}): SkillData => ({
    id: 'test-skill',
    name: 'Test Skill',
    status: 'acquisition',
    level: 1,
    tags: ['Move'],
    notes: 'Test notes',
    nextReview: '2025-08-15T00:00:00.000Z',
    dateCreated: '2025-08-01T00:00:00.000Z',
    dateModified: '2025-08-08T00:00:00.000Z',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    progressionHistory: [],
    practiceLog: [],
    quickNotes: [],
    ...overrides
  })

  it('renders status badge with safe configuration', () => {
    const skill = createSkillMock()
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const statusBadge = wrapper.find('.badge')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toBe('Acquisition')
    expect(statusBadge.classes()).toContain('bg-info')
  })

  it('handles undefined status gracefully with fallback to backlog', () => {
    const skill = { ...createSkillMock(), status: undefined as unknown as SkillStatus } as SkillData
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const statusBadge = wrapper.find('.badge')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toBe('Backlog')
    expect(statusBadge.classes()).toContain('bg-warning')
  })

  it('handles invalid status gracefully with fallback to backlog', () => {
    const skill = { ...createSkillMock(), status: 'invalid-status' as unknown as SkillStatus } as SkillData
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const statusBadge = wrapper.find('.badge')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toBe('Backlog')
    expect(statusBadge.classes()).toContain('bg-warning')
  })

  it('emits status-edit event when status badge is clicked', async () => {
    const skill = createSkillMock()
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    await wrapper.find('.badge').trigger('click')

    expect(wrapper.emitted('status-edit')).toBeTruthy()
    expect(wrapper.emitted('status-edit')?.[0]).toEqual([skill.id])
  })

  it('emits tags-edit event when tags area is clicked', async () => {
    const skill = createSkillMock({ tags: ['Move', 'Control'] })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    await wrapper.find('.clickable-tags').trigger('click')

    expect(wrapper.emitted('tags-edit')).toBeTruthy()
    expect(wrapper.emitted('tags-edit')?.[0]).toEqual([skill.id])
  })

  it('displays tags correctly', () => {
    const skill = createSkillMock({ tags: ['Move', 'Control'] })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const tagBadges = wrapper.findAll('.clickable-tags .badge')
    expect(tagBadges).toHaveLength(2)
    expect(tagBadges[0].text()).toBe('Move')
    expect(tagBadges[1].text()).toBe('Control')
  })

  it('shows "Click to add tags" message when no tags exist', () => {
    const skill = createSkillMock({ tags: [] })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    expect(wrapper.find('.text-muted').text()).toBe('Click to add tags')
  })

  it('displays review date information correctly', () => {
    const skill = createSkillMock({ 
      nextReview: '2025-08-15T00:00:00.000Z',
      status: 'acquisition'
    })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const reviewInfo = wrapper.find('.mb-2:last-child small')
    expect(reviewInfo.exists()).toBe(true)
    expect(reviewInfo.text()).toContain('Due in 5 days')
  })

  it('does not show review info for archived skills', () => {
    const skill = createSkillMock({ 
      status: 'archived',
      nextReview: '2025-08-15T00:00:00.000Z'
    })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const reviewElements = wrapper.findAll('small')
    const hasReviewInfo = reviewElements.some(el => el.text().includes('Due'))
    expect(hasReviewInfo).toBe(false)
  })

  it('does not show review info for backlog skills', () => {
    const skill = createSkillMock({ 
      status: 'backlog',
      nextReview: '2025-08-15T00:00:00.000Z'
    })
    const wrapper = mount(SkillCardStatus, {
      props: { skill }
    })

    const reviewElements = wrapper.findAll('small')
    const hasReviewInfo = reviewElements.some(el => el.text().includes('Due'))
    expect(hasReviewInfo).toBe(false)
  })
})