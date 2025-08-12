import type { SkillData, PracticeSession, ProgressionEntry } from '@/types/skill'
import { calculateTargetXP } from '@/utils/focusDataHelpers'

/**
 * Mock skill data factory for consistent testing
 */
export function createMockSkill(overrides: Partial<SkillData> = {}): SkillData {
  const baseSkill: SkillData = {
    id: 'skill_test_123',
    name: 'Test Skill',
    level: 3,
    status: 'acquisition',
    tags: ['Move'],
    notes: 'Test skill notes',
    dateCreated: '2023-01-01T00:00:00.000Z',
    dateModified: '2023-01-01T00:00:00.000Z',
    progressionHistory: [],
    practiceLog: [],
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0
  }

  return { ...baseSkill, ...overrides }
}

/**
 * Create multiple mock skills with different characteristics
 */
export function createMockSkills(): SkillData[] {
  return [
    createMockSkill({
      id: 'skill_backlog',
      name: 'Backlog Skill',
      level: 1,
      status: 'backlog',
      tags: ['Move']
    }),
    createMockSkill({
      id: 'skill_active',
      name: 'Active Skill',
      level: 3,
      status: 'acquisition',
      tags: ['Leading'],
      practiceLog: [
        { date: '2023-01-10T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Good practice' },
        { date: '2023-01-12T00:00:00.000Z', quality: 3, qualityText: 'Very Easy', note: 'Great session' }
      ],
      progressionHistory: [
        { level: 2, date: '2023-01-08T00:00:00.000Z', comment: 'Progress!', previousLevel: 1 },
        { level: 3, date: '2023-01-15T00:00:00.000Z', comment: 'More progress!', previousLevel: 2 }
      ],
      lastPracticed: '2023-01-12T00:00:00.000Z'
    }),
    createMockSkill({
      id: 'skill_focus',
      name: 'Focus Skill',
      level: 4,
      status: 'focus',
      tags: ['Communication'],
      practiceLog: [
        { date: '2023-01-20T00:00:00.000Z', quality: 3, qualityText: 'Very Easy', note: 'Excellent focus' }
      ],
      progressionHistory: [
        { level: 4, date: '2023-01-18T00:00:00.000Z', comment: 'Focused improvement', previousLevel: 3 }
      ],
      focusData: {
        totalSessions: 8,
        consecutiveGoodSessions: 3,
        currentXP: 5,
        targetXP: calculateTargetXP(4),
        lastQuality: 3,
        readyForLevelUp: true
      },
      lastPracticed: '2023-01-20T00:00:00.000Z'
    }),
    createMockSkill({
      id: 'skill_maintenance',
      name: 'Maintenance Skill',
      level: 7,
      status: 'maintenance',
      tags: ['Control'],
      practiceLog: [
        { date: '2023-01-05T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Maintenance practice' }
      ],
      easeFactor: 2.8,
      interval: 14,
      repetitions: 5,
      nextReview: '2023-01-01T00:00:00.000Z', // Past due for testing
      lastPracticed: '2022-12-20T00:00:00.000Z' // Stale for testing
    }),
    createMockSkill({
      id: 'skill_archived',
      name: 'Archived Skill',
      level: 5,
      status: 'archived',
      tags: ['Musicality']
    })
  ]
}

/**
 * Create mock practice session
 */
export function createMockPracticeSession(overrides: Partial<PracticeSession> = {}): PracticeSession {
  const basePractice: PracticeSession = {
    date: '2023-01-15T00:00:00.000Z',
    quality: 2,
    qualityText: 'Good',
    note: 'Test practice session'
  }

  return { ...basePractice, ...overrides }
}

/**
 * Create mock progression entry
 */
export function createMockProgressionEntry(overrides: Partial<ProgressionEntry> = {}): ProgressionEntry {
  const baseProgression: ProgressionEntry = {
    level: 4,
    date: '2023-01-15T00:00:00.000Z',
    comment: 'Test level up',
    previousLevel: 3
  }

  return { ...baseProgression, ...overrides }
}

/**
 * Create skill with comprehensive test data
 */
export function createCompleteTestSkill(): SkillData {
  return createMockSkill({
    id: 'skill_complete_test',
    name: 'Complete Test Skill',
    level: 5,
    status: 'focus',
    tags: ['Charisma', 'Following'],
    notes: 'Complete skill with all data for comprehensive testing',
    practiceLog: [
      createMockPracticeSession({ date: '2023-01-10T00:00:00.000Z', quality: 1, qualityText: 'Hard', note: 'Struggled today' }),
      createMockPracticeSession({ date: '2023-01-12T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Better session' }),
      createMockPracticeSession({ date: '2023-01-14T00:00:00.000Z', quality: 3, qualityText: 'Very Easy', note: 'Excellent work' })
    ],
    progressionHistory: [
      createMockProgressionEntry({ level: 3, date: '2023-01-05T00:00:00.000Z', comment: 'Initial progress', previousLevel: 2 }),
      createMockProgressionEntry({ level: 4, date: '2023-01-10T00:00:00.000Z', comment: 'Steady improvement', previousLevel: 3 }),
      createMockProgressionEntry({ level: 5, date: '2023-01-15T00:00:00.000Z', comment: 'Major breakthrough', previousLevel: 4 })
    ],
    focusData: {
      totalSessions: 12,
      consecutiveGoodSessions: 5,
      currentXP: 6,
      targetXP: calculateTargetXP(5),
      lastQuality: 3,
      readyForLevelUp: true
    },
    easeFactor: 2.7,
    interval: 8,
    repetitions: 3,
    nextReview: '2023-01-20T00:00:00.000Z',
    lastPracticed: '2023-01-14T00:00:00.000Z'
  })
}