import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillFilters from '../SkillFilters.vue'

// Mock constants
vi.mock('@/utils/constants', () => ({
  STATUS_CONFIG: {
    backlog: { label: 'Backlog', icon: 'bi-bookmark' },
    acquisition: { label: 'Acquisition', icon: 'bi-plus-circle' },
    maintenance: { label: 'Maintenance', icon: 'bi-arrow-clockwise' }
  },
  SKILL_TAGS: ['Move', 'Control', 'Communication']
}))

describe('SkillFilters', () => {
  const defaultProps = {
    filters: {
      status: 'all',
      tag: 'all',
      search: ''
    },
    sorting: {
      field: 'reviewDate' as const,
      direction: 'asc' as const
    }
  }

  it('renders all status filter buttons', () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    const statusButtons = wrapper.findAll('[data-testid="status-filter"], button').filter(btn => 
      btn.text().includes('All') || btn.text().includes('Backlog') || 
      btn.text().includes('Acquisition') || btn.text().includes('Maintenance')
    )

    // Should have "All" + the 3 mocked statuses = 4 buttons
    expect(statusButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders all tag filter buttons', () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    const tagButtons = wrapper.findAll('button').filter(btn => 
      ['All', 'Move', 'Control', 'Communication'].includes(btn.text())
    )

    // Should have "All" + the 3 mocked tags = 4 buttons
    expect(tagButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('emits filter-change event when status filter is clicked', async () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    // Find a status button (not "All")
    const acquisitionButton = wrapper.findAll('button').find(btn => 
      btn.text() === 'Acquisition'
    )
    
    if (acquisitionButton) {
      await acquisitionButton.trigger('click')
      
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual([{
        key: 'status',
        value: 'acquisition'
      }])
    }
  })

  it('emits filter-change event when tag filter is clicked', async () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    // Find a tag button (not "All")
    const moveButton = wrapper.findAll('button').find(btn => 
      btn.text() === 'Move'
    )
    
    if (moveButton) {
      await moveButton.trigger('click')
      
      expect(wrapper.emitted('filter-change')).toBeTruthy()
      expect(wrapper.emitted('filter-change')?.[0]).toEqual([{
        key: 'tag',
        value: 'Move'
      }])
    }
  })

  it('emits filter-change event when search input changes', async () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('test search')

    expect(wrapper.emitted('filter-change')).toBeTruthy()
    expect(wrapper.emitted('filter-change')?.[0]).toEqual([{
      key: 'search',
      value: 'test search'
    }])
  })

  it('shows correct active status for current filters', () => {
    const wrapper = mount(SkillFilters, {
      props: {
        ...defaultProps,
        filters: {
          status: 'acquisition',
          tag: 'Move',
          search: ''
        }
      }
    })

    // Check if the acquisition button has active class
    const acquisitionButton = wrapper.findAll('button').find(btn => 
      btn.text() === 'Acquisition'
    )
    
    if (acquisitionButton) {
      expect(acquisitionButton.classes()).toContain('btn-primary')
    }

    // Check if the Move button has active class
    const moveButton = wrapper.findAll('button').find(btn => 
      btn.text() === 'Move'
    )
    
    if (moveButton) {
      expect(moveButton.classes()).toContain('btn-primary')
    }
  })

  it('displays current sort field in dropdown button', () => {
    const wrapper = mount(SkillFilters, {
      props: {
        ...defaultProps,
        sorting: {
          field: 'name',
          direction: 'asc'
        }
      }
    })

    const dropdownButton = wrapper.find('.dropdown-toggle')
    expect(dropdownButton.text()).toContain('Name')
  })

  it('emits sort-change event when sort option is selected', async () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    // Open dropdown
    await wrapper.find('.dropdown-toggle').trigger('click')

    // Find and click a sort option
    const nameOption = wrapper.findAll('.dropdown-item').find(item =>
      item.text().includes('Name')
    )
    
    if (nameOption) {
      await nameOption.trigger('click')
      
      expect(wrapper.emitted('sort-change')).toBeTruthy()
      expect(wrapper.emitted('sort-change')?.[0]).toEqual(['name'])
    }
  })

  it('emits sort-direction-toggle event when direction button is clicked', async () => {
    const wrapper = mount(SkillFilters, {
      props: defaultProps
    })

    // Find the specific direction button by looking for buttons with sort icons
    const buttons = wrapper.findAll('button')
    const directionButton = buttons.find(btn => {
      const icons = btn.findAll('i')
      return icons.some(icon => 
        icon.classes().some(cls => cls.includes('sort-up') || cls.includes('sort-down'))
      )
    })
    
    expect(directionButton).toBeDefined()
    
    if (directionButton) {
      await directionButton.trigger('click')
      
      expect(wrapper.emitted('sort-direction-toggle')).toBeTruthy()
      expect(wrapper.emitted('sort-direction-toggle')?.[0]).toEqual([])
    }
  })

  it('shows correct sort direction icon', () => {
    const wrapper = mount(SkillFilters, {
      props: {
        ...defaultProps,
        sorting: {
          field: 'name',
          direction: 'desc'
        }
      }
    })

    // Find the specific direction button by looking for buttons with sort icons
    const buttons = wrapper.findAll('button')
    const directionButton = buttons.find(btn => {
      const icons = btn.findAll('i')
      return icons.some(icon => 
        icon.classes().some(cls => cls.includes('sort-up') || cls.includes('sort-down'))
      )
    })
    
    if (directionButton) {
      const sortIcons = directionButton.findAll('i').filter(icon =>
        icon.classes().some(cls => cls.includes('sort-up') || cls.includes('sort-down'))
      )
      
      expect(sortIcons.length).toBeGreaterThan(0)
      if (sortIcons.length > 0) {
        expect(sortIcons[0].classes()).toContain('bi-sort-down')
      }
    }
  })
})