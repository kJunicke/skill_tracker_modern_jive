import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ModalManager from '../ModalManager.vue'
import type { SkillData } from '@/types/skill'
import { createMockSkill } from '@/services/__tests__/testHelpers'

// Mock all modal components
vi.mock('@/components/skills/SkillModal.vue', () => ({
  default: {
    name: 'SkillModal',
    template: '<div data-testid="skill-modal-component" :class="{ visible: isVisible }">Skill Modal</div>',
    props: ['skill', 'isVisible'],
    emits: ['save', 'close']
  }
}))

vi.mock('@/components/training/PracticeRating.vue', () => ({
  default: {
    name: 'PracticeRating',
    template: '<div data-testid="practice-rating-component" :class="{ visible: isVisible }">Practice Rating</div>',
    props: ['skill', 'isVisible'],
    emits: ['practice-complete', 'close']
  }
}))

vi.mock('@/components/ui/TimelineModal.vue', () => ({
  default: {
    name: 'TimelineModal',
    template: '<div data-testid="timeline-modal-component" :class="{ visible: isVisible }">Timeline Modal</div>',
    props: ['skill', 'isVisible'],
    emits: ['close', 'edit-notes', 'edit-levelup-comment', 'edit-practice-note', 'edit-quick-note', 'delete-quick-note', 'toggle-transferred-to-notes']
  }
}))

vi.mock('@/components/ui/StatusEditor.vue', () => ({
  default: {
    name: 'StatusEditor',
    template: '<div data-testid="status-editor-component" :class="{ visible: isVisible }">Status Editor</div>',
    props: ['skill', 'isVisible'],
    emits: ['status-changed', 'close']
  }
}))

vi.mock('@/components/ui/TagsEditor.vue', () => ({
  default: {
    name: 'TagsEditor',
    template: '<div data-testid="tags-editor-component" :class="{ visible: isVisible }">Tags Editor</div>',
    props: ['skill', 'isVisible'],
    emits: ['tags-changed', 'close']
  }
}))

vi.mock('@/components/ui/NotesEditor.vue', () => ({
  default: {
    name: 'NotesEditor',
    template: '<div data-testid="notes-editor-component" :class="{ visible: isVisible }">Notes Editor</div>',
    props: ['skill', 'isVisible'],
    emits: ['notes-changed', 'close', 'edit-levelup-comment', 'edit-practice-note', 'edit-quick-note', 'delete-quick-note', 'toggle-transferred-to-notes']
  }
}))

vi.mock('@/components/analytics/TrainingLog.vue', () => ({
  default: {
    name: 'TrainingLog',
    template: '<div data-testid="training-log-component" :class="{ visible: isVisible }">Training Log</div>',
    props: ['skills', 'isVisible'],
    emits: ['close']
  }
}))

describe('ModalManager', () => {
  let wrapper: VueWrapper
  let mockSkill: SkillData
  let mockModalStates: {
    skill: { selectedSkill: SkillData | null; isVisible: boolean }
    practice: { selectedSkill: SkillData | null; isVisible: boolean }
    timeline: { selectedSkill: SkillData | null; isVisible: boolean }
    status: { selectedSkill: SkillData | null; isVisible: boolean }
    tags: { selectedSkill: SkillData | null; isVisible: boolean }
    notes: { selectedSkill: SkillData | null; isVisible: boolean }
    trainingLog: { isVisible: boolean }
    trainingSchedule: { isVisible: boolean }
    statusTransition: { 
      selectedSkill: SkillData | null; 
      isVisible: boolean; 
      suggestedStatus?: 'backlog' | 'acquisition' | 'maintenance' | 'focus' | 'archived'; 
      reason: string 
    }
  }

  beforeEach(() => {
    mockSkill = createMockSkill({
      id: 'test-skill',
      name: 'Test Skill'
    })

    mockModalStates = {
      skill: { selectedSkill: null, isVisible: false },
      practice: { selectedSkill: null, isVisible: false },
      timeline: { selectedSkill: null, isVisible: false },
      status: { selectedSkill: null, isVisible: false },
      tags: { selectedSkill: null, isVisible: false },
      notes: { selectedSkill: null, isVisible: false },
      trainingLog: { isVisible: false },
      trainingSchedule: { isVisible: false },
      statusTransition: { 
        selectedSkill: null, 
        isVisible: false, 
        suggestedStatus: undefined, 
        reason: '' 
      }
    }
  })

  const createWrapper = (modalStates = mockModalStates, skills = [mockSkill]) => {
    return mount(ModalManager, {
      props: {
        skills,
        modalStates,
        modalKey: 0
      },
      global: {
        stubs: {
          SkillModal: true,
          PracticeRating: true,
          TimelineModal: true,
          StatusEditor: true,
          TagsEditor: true,
          NotesEditor: true,
          TrainingLog: true,
          TrainingScheduleModal: true,
          StatusTransitionConfirmation: true
        }
      }
    })
  }

  describe('Modal Visibility', () => {
    it('shows no modals when all are hidden', () => {
      wrapper = createWrapper()
      
      expect(wrapper.findComponent({ name: 'SkillModal' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'PracticeRating' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'TimelineModal' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'StatusEditor' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'TagsEditor' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'NotesEditor' }).props('isVisible')).toBe(false)
      expect(wrapper.findComponent({ name: 'TrainingLog' }).props('isVisible')).toBe(false)
    })

    it('shows skill modal when visible', () => {
      const modalStates = {
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'SkillModal' }).props('isVisible')).toBe(true)
    })

    it('shows practice rating when visible', () => {
      const modalStates = {
        ...mockModalStates,
        practice: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'PracticeRating' }).props('isVisible')).toBe(true)
    })

    it('shows timeline modal when visible', () => {
      const modalStates = {
        ...mockModalStates,
        timeline: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'TimelineModal' }).props('isVisible')).toBe(true)
    })

    it('shows status editor when visible', () => {
      const modalStates = {
        ...mockModalStates,
        status: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'StatusEditor' }).props('isVisible')).toBe(true)
    })

    it('shows tags editor when visible', () => {
      const modalStates = {
        ...mockModalStates,
        tags: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'TagsEditor' }).props('isVisible')).toBe(true)
    })

    it('shows notes editor when visible', () => {
      const modalStates = {
        ...mockModalStates,
        notes: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'NotesEditor' }).props('isVisible')).toBe(true)
    })

    it('shows training log when visible', () => {
      const modalStates = {
        ...mockModalStates,
        trainingLog: { isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'TrainingLog' }).props('isVisible')).toBe(true)
    })
  })

  describe('Props Passing', () => {
    it('passes correct props to SkillModal', () => {
      const modalStates = {
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      const skillModal = wrapper.findComponent({ name: 'SkillModal' })
      expect(skillModal.props('skill')).toStrictEqual(mockSkill)
      expect(skillModal.props('isVisible')).toBe(true)
    })

    it('passes correct props to PracticeRating', () => {
      const modalStates = {
        ...mockModalStates,
        practice: { selectedSkill: mockSkill, isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      const practiceRating = wrapper.findComponent({ name: 'PracticeRating' })
      expect(practiceRating.props('skill')).toStrictEqual(mockSkill)
      expect(practiceRating.props('isVisible')).toBe(true)
    })

    it('passes skills array to TrainingLog', () => {
      const skills = [mockSkill, createMockSkill({ id: 'skill-2' })]
      const modalStates = {
        ...mockModalStates,
        trainingLog: { isVisible: true }
      }
      wrapper = createWrapper(modalStates, skills)
      
      const trainingLog = wrapper.findComponent({ name: 'TrainingLog' })
      expect(trainingLog.props('skills')).toEqual(skills)
      expect(trainingLog.props('isVisible')).toBe(true)
    })
  })

  describe('Event Emission', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true },
        practice: { selectedSkill: mockSkill, isVisible: true },
        timeline: { selectedSkill: mockSkill, isVisible: true },
        status: { selectedSkill: mockSkill, isVisible: true },
        tags: { selectedSkill: mockSkill, isVisible: true },
        notes: { selectedSkill: mockSkill, isVisible: true }
      })
    })

    it('emits save-skill event from SkillModal', async () => {
      const skillModal = wrapper.findComponent({ name: 'SkillModal' })
      await skillModal.vm.$emit('save', mockSkill)
      
      expect(wrapper.emitted('save-skill')).toEqual([[mockSkill]])
    })

    it('emits close-skill-modal event from SkillModal', async () => {
      const skillModal = wrapper.findComponent({ name: 'SkillModal' })
      await skillModal.vm.$emit('close')
      
      expect(wrapper.emitted('close-skill-modal')).toEqual([[]])
    })

    it('emits practice-complete event with all parameters', async () => {
      const practiceRating = wrapper.findComponent({ name: 'PracticeRating' })
      await practiceRating.vm.$emit('practice-complete', 'skill-1', 3, 'Great practice', true)
      
      expect(wrapper.emitted('practice-complete')).toEqual([['skill-1', 3, 'Great practice', true]])
    })

    it('emits status-changed event with correct structure', async () => {
      const statusEditor = wrapper.findComponent({ name: 'StatusEditor' })
      await statusEditor.vm.$emit('status-changed', 'skill-1', 'focus')
      
      expect(wrapper.emitted('status-changed')).toEqual([[{skillId: 'skill-1', newStatus: 'focus'}]])
    })

    it('emits tags-changed event with correct structure', async () => {
      const tagsEditor = wrapper.findComponent({ name: 'TagsEditor' })
      await tagsEditor.vm.$emit('tags-changed', 'skill-1', ['Move', 'Control'])
      
      expect(wrapper.emitted('tags-changed')).toEqual([[{skillId: 'skill-1', newTags: ['Move', 'Control']}]])
    })

    it('emits notes-changed event from NotesEditor', async () => {
      const notesEditor = wrapper.findComponent({ name: 'NotesEditor' })
      await notesEditor.vm.$emit('notes-changed', 'skill-1', 'Updated notes')
      
      expect(wrapper.emitted('notes-changed')).toEqual([['skill-1', 'Updated notes']])
    })

    it('emits timeline-specific events', async () => {
      const timelineModal = wrapper.findComponent({ name: 'TimelineModal' })
      
      // Test edit-levelup-comment
      const levelUpData = { level: 5, date: '2023-01-01', comment: 'Great progress', previousLevel: 4 }
      await timelineModal.vm.$emit('edit-levelup-comment', 'skill-1', levelUpData)
      expect(wrapper.emitted('edit-levelup-comment')).toEqual([['skill-1', levelUpData]])
      
      // Test edit-practice-note
      const practiceData = { date: '2023-01-01', quality: 3, qualityText: 'Very Easy', note: 'Good practice' }
      await timelineModal.vm.$emit('edit-practice-note', 'skill-1', practiceData)
      expect(wrapper.emitted('edit-practice-note')).toEqual([['skill-1', practiceData]])
      
      // Test edit-quick-note
      await timelineModal.vm.$emit('edit-quick-note', 'skill-1', '2023-01-01', 'Quick note')
      expect(wrapper.emitted('edit-quick-note')).toEqual([['skill-1', '2023-01-01', 'Quick note']])
      
      // Test delete-quick-note
      await timelineModal.vm.$emit('delete-quick-note', 'skill-1', '2023-01-01')
      expect(wrapper.emitted('delete-quick-note')).toEqual([['skill-1', '2023-01-01']])
      
      // Test toggle-transferred-to-notes
      await timelineModal.vm.$emit('toggle-transferred-to-notes', 'skill-1', 'levelup', '2023-01-01')
      expect(wrapper.emitted('toggle-transferred-to-notes')).toEqual([['skill-1', 'levelup', '2023-01-01']])
    })
  })

  describe('Multiple Modal States', () => {
    it('can show multiple modals simultaneously', () => {
      const modalStates = {
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true },
        practice: { selectedSkill: mockSkill, isVisible: true },
        trainingLog: { isVisible: true }
      }
      wrapper = createWrapper(modalStates)
      
      expect(wrapper.findComponent({ name: 'SkillModal' }).props('isVisible')).toBe(true)
      expect(wrapper.findComponent({ name: 'PracticeRating' }).props('isVisible')).toBe(true)
      expect(wrapper.findComponent({ name: 'TrainingLog' }).props('isVisible')).toBe(true)
    })

    it('updates modal visibility when modal states change', async () => {
      wrapper = createWrapper()
      
      // Initially no modals visible
      expect(wrapper.findComponent({ name: 'SkillModal' }).props('isVisible')).toBe(false)
      
      // Show skill modal
      const newModalStates = {
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true }
      }
      await wrapper.setProps({ modalStates: newModalStates })
      
      expect(wrapper.findComponent({ name: 'SkillModal' }).props('isVisible')).toBe(true)
    })
  })

  describe('Event Handler Parameter Consistency', () => {
    beforeEach(() => {
      wrapper = createWrapper({
        ...mockModalStates,
        skill: { selectedSkill: mockSkill, isVisible: true },
        practice: { selectedSkill: mockSkill, isVisible: true },
        timeline: { selectedSkill: mockSkill, isVisible: true },
        status: { selectedSkill: mockSkill, isVisible: true },
        tags: { selectedSkill: mockSkill, isVisible: true },
        notes: { selectedSkill: mockSkill, isVisible: true }
      })
    })

    it('maintains parameter consistency for complex events', async () => {
      // Test that events with multiple parameters are handled correctly
      const notesEditor = wrapper.findComponent({ name: 'NotesEditor' })
      
      // Test complex event with multiple parameters
      const levelUpData = { level: 5, date: '2023-01-01', comment: 'Great!', previousLevel: 4 }
      await notesEditor.vm.$emit('edit-levelup-comment', 'skill-1', levelUpData)
      
      const emitted = wrapper.emitted('edit-levelup-comment')
      expect(emitted).toBeDefined()
      expect(emitted![0]).toEqual(['skill-1', levelUpData])
    })

    it('handles object parameter events correctly', async () => {
      const statusEditor = wrapper.findComponent({ name: 'StatusEditor' })
      await statusEditor.vm.$emit('status-changed', 'skill-1', 'focus')
      
      const emitted = wrapper.emitted('status-changed')
      expect(emitted).toBeDefined()
      expect(emitted![0]).toEqual([{skillId: 'skill-1', newStatus: 'focus'}])
    })
  })
})