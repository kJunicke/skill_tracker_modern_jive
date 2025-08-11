import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSkillEventHandlers } from '../useSkillEventHandlers'
import type { SkillData } from '@/types/skill'

// Mock dependencies
const mockSkillStore = {
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
  levelUpSkill: vi.fn()
}

const mockWithSkill = vi.fn()

vi.mock('@/stores/skillStore', () => ({
  useSkillStore: () => mockSkillStore
}))

vi.mock('../useSkillActions', () => ({
  useSkillActions: () => ({
    withSkill: mockWithSkill
  })
}))

// Mock global functions
global.confirm = vi.fn()
global.prompt = vi.fn()

describe('useSkillEventHandlers', () => {
  const mockModalActions = {
    showPracticeModal: vi.fn(),
    showTimelineModal: vi.fn(),
    showEditSkillModal: vi.fn(),
    showStatusModal: vi.fn(),
    showTagsModal: vi.fn(),
    showNotesModal: vi.fn(),
    showStatusTransitionModal: vi.fn()
  }

  const mockSkill: SkillData = {
    id: 'test-skill',
    name: 'Test Skill',
    status: 'acquisition',
    level: 2,
    tags: ['Move'],
    notes: 'Test notes',
    dateCreated: '2025-08-01T00:00:00.000Z',
    dateModified: '2025-08-08T00:00:00.000Z',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    quickNotes: [],
    practiceLog: [],
    progressionHistory: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles practice rating by showing practice modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handlePracticeRating('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showPracticeModal)
  })

  it('handles progression timeline by showing timeline modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handleProgressionTimeline('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showTimelineModal)
  })

  it('handles status edit by showing status modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handleStatusEdit('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showStatusModal)
  })

  it('handles tags edit by showing tags modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handleTagsEdit('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showTagsModal)
  })

  it('handles notes edit by showing notes modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handleNotesEdit('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showNotesModal)
  })

  it('handles skill edit by showing edit skill modal', () => {
    const handlers = useSkillEventHandlers(mockModalActions)

    handlers.handleEditSkill('test-skill')

    expect(mockWithSkill).toHaveBeenCalledWith('test-skill', mockModalActions.showEditSkillModal)
  })

  it('handles level change with confirmation', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    // Mock confirm to return true
    vi.mocked(global.confirm).mockReturnValue(true)
    
    // Mock withSkill to call the callback with the skill
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleLevelChange('test-skill', 3)

    expect(global.confirm).toHaveBeenCalledWith('Change "Test Skill" to level 3?')
    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', { level: 3 })
  })

  it('does not change level when confirmation is declined', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    // Mock confirm to return false
    vi.mocked(global.confirm).mockReturnValue(false)
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleLevelChange('test-skill', 3)

    expect(global.confirm).toHaveBeenCalled()
    expect(mockSkillStore.updateSkill).not.toHaveBeenCalled()
  })

  it('handles skill deletion with confirmation', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    vi.mocked(global.confirm).mockReturnValue(true)
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleDeleteSkill('test-skill')

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Skill"?')
    expect(mockSkillStore.deleteSkill).toHaveBeenCalledWith('test-skill')
  })

  it('handles level up with comment', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    vi.mocked(global.prompt).mockReturnValue('Great progress!')
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleLevelUp('test-skill')

    expect(global.prompt).toHaveBeenCalledWith(
      'Level up "Test Skill" from 2 to 3!\n\nPlease add a comment about your progress:'
    )
    expect(mockSkillStore.levelUpSkill).toHaveBeenCalledWith('test-skill', 3, 'Great progress!')
  })

  it('does not level up when no comment is provided', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    vi.mocked(global.prompt).mockReturnValue(null)
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleLevelUp('test-skill')

    expect(mockSkillStore.levelUpSkill).not.toHaveBeenCalled()
  })

  it('handles move to acquisition with confirmation', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    vi.mocked(global.confirm).mockReturnValue(true)
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    handlers.handleMoveToAcquisition('test-skill')

    expect(global.confirm).toHaveBeenCalledWith(
      'Start learning "Test Skill"? This will move it from Backlog to Acquisition status.'
    )
    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', { status: 'acquisition' })
  })

  it('handles quick note creation', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(mockSkill)
    })

    // Mock Date.now to return consistent timestamp
    const mockTimestamp = '2025-08-08T12:00:00.000Z'
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockTimestamp)

    handlers.handleQuickNote('test-skill', 'Test quick note')

    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', {
      quickNotes: [{
        date: mockTimestamp,
        note: 'Test quick note',
        transferredToNotes: false
      }],
      dateModified: mockTimestamp
    })
  })

  it('handles toggle transferred to notes for level-up entries', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    const skillWithHistory = {
      ...mockSkill,
      progressionHistory: [
        { date: '2025-08-01', level: 2, comment: 'Test', transferredToNotes: false }
      ]
    }
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(skillWithHistory)
    })

    handlers.handleToggleTransferredToNotes('test-skill', 'levelup', '2025-08-01')

    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', {
      progressionHistory: [
        { date: '2025-08-01', level: 2, comment: 'Test', transferredToNotes: true }
      ],
      dateModified: expect.any(String)
    })
  })

  it('handles toggle transferred to notes for practice entries', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    const skillWithPractice = {
      ...mockSkill,
      practiceLog: [
        { date: '2025-08-01', quality: 3, qualityText: 'Good', note: 'Test', transferredToNotes: false }
      ]
    }
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(skillWithPractice)
    })

    handlers.handleToggleTransferredToNotes('test-skill', 'practice', '2025-08-01')

    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', {
      practiceLog: [
        { date: '2025-08-01', quality: 3, qualityText: 'Good', note: 'Test', transferredToNotes: true }
      ],
      dateModified: expect.any(String)
    })
  })

  it('handles toggle transferred to notes for quick note entries', () => {
    const handlers = useSkillEventHandlers(mockModalActions)
    
    const skillWithQuickNotes = {
      ...mockSkill,
      quickNotes: [
        { date: '2025-08-01', note: 'Test note', transferredToNotes: false }
      ]
    }
    
    mockWithSkill.mockImplementation((skillId, callback) => {
      callback(skillWithQuickNotes)
    })

    handlers.handleToggleTransferredToNotes('test-skill', 'quicknote', '2025-08-01')

    expect(mockSkillStore.updateSkill).toHaveBeenCalledWith('test-skill', {
      quickNotes: [
        { date: '2025-08-01', note: 'Test note', transferredToNotes: true }
      ],
      dateModified: expect.any(String)
    })
  })
})