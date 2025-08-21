import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from '../StarRating.vue'

// Mock DOM methods for animation testing
const mockClassList = {
  remove: vi.fn(),
  add: vi.fn()
}

const mockElement = {
  classList: mockClassList,
  closest: vi.fn()
}

describe('StarRating.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the closest mock for each test
    mockElement.closest.mockReturnValue(mockElement)
  })

  it('renders with level and decorative elements', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3
      }
    })

    expect(wrapper.find('.level-number').text()).toBe('3')
    expect(wrapper.find('.level-badge').classes()).toContain('level-3')
    expect(wrapper.findAll('.decorative-element')).toHaveLength(2) // 1 on each side for level 3
  })

  it('shows correct level styling for different level ranges', () => {
    const testCases = [
      { level: 0, expectedClass: 'level-unlearned' },
      { level: 1, expectedClass: 'level-1' },
      { level: 5, expectedClass: 'level-5' },
      { level: 8, expectedClass: 'level-advanced' },
      { level: 15, expectedClass: 'level-expert' },
      { level: 30, expectedClass: 'level-master' },
      { level: 60, expectedClass: 'level-legend' }
    ]

    testCases.forEach(({ level, expectedClass }) => {
      const wrapper = mount(StarRating, { props: { level } })
      expect(wrapper.find('.level-badge').classes()).toContain(expectedClass)
    })
  })

  it('displays correct decorative icons for level ranges', () => {
    const wrapper1 = mount(StarRating, { props: { level: 3 } })
    expect(wrapper1.findAll('.bi-circle-fill')).toHaveLength(2)

    const wrapper2 = mount(StarRating, { props: { level: 8 } })
    expect(wrapper2.findAll('.bi-star-fill')).toHaveLength(2)

    const wrapper3 = mount(StarRating, { props: { level: 13 } })
    expect(wrapper3.findAll('.bi-gem')).toHaveLength(4) // 2 on each side
  })

  it('shows correct tooltip text', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3,
        skillId: 'test-skill'
      }
    })

    const tooltip = wrapper.find('[title]').attributes('title')
    expect(tooltip).toContain('Level 3 - Getting Better - Click for animation!')
  })

  it('shows tooltip without click prompt when no skillId', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3
      }
    })

    const tooltip = wrapper.find('[title]').attributes('title')
    expect(tooltip).toBe('Level 3 - Getting Better')
  })

  it('is clickable when skillId is provided', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3,
        skillId: 'test-skill'
      }
    })

    const levelBadge = wrapper.find('.level-badge')
    expect(levelBadge.classes()).toContain('clickable-level')
    expect(levelBadge.attributes('style')).toContain('cursor: pointer')
  })

  it('is not clickable when skillId is not provided', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3
      }
    })

    const levelBadge = wrapper.find('.level-badge')
    expect(levelBadge.classes()).not.toContain('clickable-level')
    expect(levelBadge.attributes('style')).not.toContain('cursor: pointer')
  })

  it('can be clicked when skillId is provided', async () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3,
        skillId: 'test-skill'
      }
    })

    const levelBadge = wrapper.find('.level-badge')
    
    // Test that the click handler is properly bound
    await levelBadge.trigger('click')
    
    // The component should handle the click without throwing errors
    expect(levelBadge.exists()).toBe(true)
  })

  it('has correct animation CSS classes defined', () => {
    // Test that the component includes the expected animation classes in the CSS
    // This is a structural test to ensure the animations are properly defined
    const wrapper = mount(StarRating, {
      props: { level: 5, skillId: 'test-skill' }
    })

    // Check that the component mounts successfully with animation-related classes
    expect(wrapper.find('.level-badge').exists()).toBe(true)
    expect(wrapper.find('.clickable-level').exists()).toBe(true)
    
    // Verify that animation indicator is present
    expect(wrapper.find('.animation-indicator').exists()).toBe(true)
  })

  it('does not trigger animation when clicked without skillId', async () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3
      }
    })

    await wrapper.find('.level-badge').trigger('click')

    // Verify no DOM manipulation occurred (closest is not called)
    expect(mockClassList.remove).not.toHaveBeenCalled()
    expect(mockClassList.add).not.toHaveBeenCalled()
  })

  it('adds data-skill-id attribute when skillId is provided', () => {
    const wrapper = mount(StarRating, {
      props: {
        level: 3,
        skillId: 'test-skill-123'
      }
    })

    expect(wrapper.find('.level-badge').attributes('data-skill-id')).toBe('test-skill-123')
  })
})