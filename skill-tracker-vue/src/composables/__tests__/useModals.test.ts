import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useModals } from '../useModals'
import type { ModalEventHandlers } from '@/types/modals'
import type { SkillData } from '@/types/skill'

// Mock modal utilities
vi.mock('@/utils/modalManager', () => ({
  showModal: vi.fn().mockResolvedValue(undefined),
  hideModal: vi.fn().mockResolvedValue(undefined),
  destroyModal: vi.fn()
}))

// Mock useToasts
vi.mock('../useToasts', () => ({
  useToasts: () => ({
    showSuccess: vi.fn()
  })
}))

describe('useModals', () => {
  let mockHandlers: ModalEventHandlers

  beforeEach(() => {
    // Setup Pinia for each test
    setActivePinia(createPinia())
    
    mockHandlers = {
      onSaveSkill: vi.fn(),
      onPracticeComplete: vi.fn(),
      onStatusChanged: vi.fn(),
      onTagsChanged: vi.fn(),
      onNotesChanged: vi.fn(),
      onStatusTransitionConfirm: vi.fn()
    }
  })

  it('initializes with correct modal states', () => {
    const { modalStates } = useModals(mockHandlers)

    expect(modalStates.skill.isVisible).toBe(false)
    expect(modalStates.skill.selectedSkill).toBe(null)
    expect(modalStates.practice.isVisible).toBe(false)
    expect(modalStates.practice.selectedSkill).toBe(null)
    expect(modalStates.timeline.isVisible).toBe(false)
    expect(modalStates.timeline.selectedSkill).toBe(null)
    expect(modalStates.status.isVisible).toBe(false)
    expect(modalStates.status.selectedSkill).toBe(null)
    expect(modalStates.tags.isVisible).toBe(false)
    expect(modalStates.tags.selectedSkill).toBe(null)
    expect(modalStates.notes.isVisible).toBe(false)
    expect(modalStates.notes.selectedSkill).toBe(null)
    expect(modalStates.trainingLog.isVisible).toBe(false)
  })

  it('handles status changed event correctly', () => {
    const { handleStatusChanged } = useModals(mockHandlers)

    const testData = { skillId: 'test-id', newStatus: 'focus' }
    handleStatusChanged(testData)

    expect(mockHandlers.onStatusChanged).toHaveBeenCalledWith('test-id', 'focus')
  })

  it('handles tags changed event correctly', () => {
    const { handleTagsChanged } = useModals(mockHandlers)

    const testData = { skillId: 'test-id', newTags: ['Move', 'Control'] }
    handleTagsChanged(testData)

    expect(mockHandlers.onTagsChanged).toHaveBeenCalledWith('test-id', ['Move', 'Control'])
  })

  it('handles notes changed event correctly', () => {
    const { handleNotesChanged } = useModals(mockHandlers)

    handleNotesChanged('test-id', 'new notes content')

    expect(mockHandlers.onNotesChanged).toHaveBeenCalledWith('test-id', 'new notes content')
  })

  it('handles save skill event correctly', () => {
    const { handleSaveSkill } = useModals(mockHandlers)

    const skillData = { id: 'test-id', name: 'Test Skill', level: 2 }
    handleSaveSkill(skillData)

    expect(mockHandlers.onSaveSkill).toHaveBeenCalledWith(skillData)
  })

  it('handles practice complete event correctly', () => {
    const { handlePracticeComplete } = useModals(mockHandlers)

    handlePracticeComplete('skill-id', 3, 'practice notes', true)

    expect(mockHandlers.onPracticeComplete).toHaveBeenCalledWith(
      'skill-id', 
      3, 
      'practice notes', 
      true
    )
  })

  it('shows and hides modals correctly', async () => {
    const { showStatusModal, closeStatusModal, modalStates } = useModals(mockHandlers)

    const testSkill: SkillData = {
      id: 'test-skill',
      name: 'Test Skill',
      status: 'acquisition' as const,
      level: 1,
      tags: [],
      notes: '',
      dateCreated: '2025-08-01T00:00:00.000Z',
      dateModified: '2025-08-08T00:00:00.000Z',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      progressionHistory: [],
      practiceLog: [],
      quickNotes: []
    }

    // Show modal
    await showStatusModal(testSkill)
    expect(modalStates.status.isVisible).toBe(true)
    expect(modalStates.status.selectedSkill).toStrictEqual(testSkill)

    // Close modal
    await closeStatusModal()
    expect(modalStates.status.isVisible).toBe(false)
    expect(modalStates.status.selectedSkill).toBe(null)
  })

  it('shows add skill modal correctly', async () => {
    const { showAddSkillModal, modalStates } = useModals(mockHandlers)

    await showAddSkillModal()
    expect(modalStates.skill.isVisible).toBe(true)
    expect(modalStates.skill.selectedSkill).toBe(null)
  })

  it('shows edit skill modal with skill data', async () => {
    const { showEditSkillModal, modalStates } = useModals(mockHandlers)

    const testSkill: SkillData = {
      id: 'test-skill',
      name: 'Test Skill',
      status: 'acquisition' as const,
      level: 1,
      tags: [],
      notes: '',
      dateCreated: '2025-08-01T00:00:00.000Z',
      dateModified: '2025-08-08T00:00:00.000Z',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      progressionHistory: [],
      practiceLog: [],
      quickNotes: []
    }

    await showEditSkillModal(testSkill)
    expect(modalStates.skill.isVisible).toBe(true)
    expect(modalStates.skill.selectedSkill).toStrictEqual(testSkill)
  })
})