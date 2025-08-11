import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AnalyticsService } from '../core/AnalyticsService'
import type { SkillData } from '@/types/skill'

describe('AnalyticsService', () => {
  let service: AnalyticsService
  let mockSkills: SkillData[]

  beforeEach(() => {
    // Mock the current date to January 30, 2023 for consistent test results
    vi.setSystemTime(new Date('2023-01-30T00:00:00.000Z'))
    service = new AnalyticsService()
    
    // Create comprehensive mock data for testing
    mockSkills = [
      {
        id: 'skill_1',
        name: 'Backlog Skill',
        level: 1,
        status: 'backlog',
        tags: ['Move'],
        notes: 'Backlog skill',
        dateCreated: '2023-01-01T00:00:00.000Z',
        dateModified: '2023-01-01T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [],
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      },
      {
        id: 'skill_2',
        name: 'Active Skill',
        level: 3,
        status: 'acquisition',
        tags: ['Move'],
        notes: 'Active skill',
        dateCreated: '2023-01-02T00:00:00.000Z',
        dateModified: '2023-01-02T00:00:00.000Z',
        progressionHistory: [
          { level: 2, date: '2023-01-15T00:00:00.000Z', comment: 'Progress!', previousLevel: 1 },
          { level: 3, date: '2023-01-20T00:00:00.000Z', comment: 'More progress!', previousLevel: 2 }
        ],
        practiceLog: [
          { date: '2023-01-10T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Good session' },
          { date: '2023-01-12T00:00:00.000Z', quality: 3, qualityText: 'Very Easy', note: 'Great session' },
          { date: '2023-01-14T00:00:00.000Z', quality: 1, qualityText: 'Hard', note: 'Difficult session' }
        ],
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        lastPracticed: '2023-01-14T00:00:00.000Z'
      },
      {
        id: 'skill_3',
        name: 'Focus Skill',
        level: 5,
        status: 'focus',
        tags: ['Communication'],
        notes: 'Focus skill',
        dateCreated: '2023-01-03T00:00:00.000Z',
        dateModified: '2023-01-03T00:00:00.000Z',
        progressionHistory: [
          { level: 5, date: '2023-01-25T00:00:00.000Z', comment: 'Focused improvement', previousLevel: 4 }
        ],
        practiceLog: [
          { date: '2023-01-22T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Focus practice' },
          { date: '2023-01-23T00:00:00.000Z', quality: 3, qualityText: 'Very Easy', note: 'Excellent focus' }
        ],
        easeFactor: 2.7,
        interval: 6,
        repetitions: 2,
        focusData: {
          totalSessions: 10,
          consecutiveGoodSessions: 5,
          currentXP: 45,
          targetXP: 60,
          lastQuality: 3,
          readyForLevelUp: true
        },
        lastPracticed: '2023-01-23T00:00:00.000Z'
      },
      {
        id: 'skill_4',
        name: 'Maintenance Skill',
        level: 7,
        status: 'maintenance',
        tags: ['Control'],
        notes: 'Maintenance skill',
        dateCreated: '2023-01-04T00:00:00.000Z',
        dateModified: '2023-01-04T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [
          { date: '2023-01-05T00:00:00.000Z', quality: 2, qualityText: 'Good', note: 'Maintenance practice' }
        ],
        easeFactor: 2.8,
        interval: 10,
        repetitions: 5,
        nextReview: '2023-01-01T00:00:00.000Z', // Past due
        lastPracticed: '2022-12-15T00:00:00.000Z' // Old practice - stale
      },
      {
        id: 'skill_5',
        name: 'Archived Skill',
        level: 4,
        status: 'archived',
        tags: ['Move'],
        notes: 'Archived skill',
        dateCreated: '2023-01-05T00:00:00.000Z',
        dateModified: '2023-01-05T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [],
        easeFactor: 2.3,
        interval: 1,
        repetitions: 0
      }
    ]
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('calculateTrainingStats', () => {
    it('should calculate correct training statistics', () => {
      const stats = service.calculateTrainingStats(mockSkills)

      expect(stats).toEqual({
        totalSkills: 5,
        activeSkills: 3, // acquisition, focus, maintenance (excludes backlog, archived)
        totalPracticeSessions: 6, // 0+3+2+1+0
        totalLevelUps: 3, // 0+2+1+0+0
        averageLevel: 4 // (1+3+5+7+4)/5 = 4
      })
    })

    it('should handle empty skills array', () => {
      const stats = service.calculateTrainingStats([])

      expect(stats).toEqual({
        totalSkills: 0,
        activeSkills: 0,
        totalPracticeSessions: 0,
        totalLevelUps: 0,
        averageLevel: 0
      })
    })

    it('should handle skills without practice logs or progression history', () => {
      const minimalSkills: SkillData[] = [{
        id: 'skill_minimal',
        name: 'Minimal Skill',
        level: 2,
        status: 'acquisition',
        tags: [],
        notes: '',
        dateCreated: '2023-01-01T00:00:00.000Z',
        dateModified: '2023-01-01T00:00:00.000Z',
        progressionHistory: [],
        practiceLog: [],
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      }]

      const stats = service.calculateTrainingStats(minimalSkills)

      expect(stats).toEqual({
        totalSkills: 1,
        activeSkills: 1,
        totalPracticeSessions: 0,
        totalLevelUps: 0,
        averageLevel: 2
      })
    })
  })

  describe('groupSkillsByStatus', () => {
    it('should group skills correctly by status', () => {
      const grouped = service.groupSkillsByStatus(mockSkills)

      expect(grouped.backlog).toHaveLength(1)
      expect(grouped.backlog[0].name).toBe('Backlog Skill')
      
      expect(grouped.acquisition).toHaveLength(1)
      expect(grouped.acquisition[0].name).toBe('Active Skill')
      
      expect(grouped.focus).toHaveLength(1)
      expect(grouped.focus[0].name).toBe('Focus Skill')
      
      expect(grouped.maintenance).toHaveLength(1)
      expect(grouped.maintenance[0].name).toBe('Maintenance Skill')
      
      expect(grouped.archived).toHaveLength(1)
      expect(grouped.archived[0].name).toBe('Archived Skill')
    })

    it('should handle empty arrays for missing statuses', () => {
      const singleSkill = [mockSkills[1]] // Only acquisition skill
      const grouped = service.groupSkillsByStatus(singleSkill)

      expect(grouped.backlog).toHaveLength(0)
      expect(grouped.acquisition).toHaveLength(1)
      expect(grouped.focus).toHaveLength(0)
      expect(grouped.maintenance).toHaveLength(0)
      expect(grouped.archived).toHaveLength(0)
    })
  })

  describe('calculateProgressMetrics', () => {
    it('should calculate metrics for skill with practice and progression history', () => {
      const metrics = service.calculateProgressMetrics(mockSkills[1]) // Active Skill

      expect(metrics.practiceCount).toBe(3)
      expect(metrics.levelUpCount).toBe(2)
      expect(metrics.averageQuality).toBe(2) // (2+3+1)/3 = 2
      expect(metrics.focusProgress).toBe(0) // Not a focus skill
      expect(metrics.isReadyForLevelUp).toBe(false)
    })

    it('should calculate focus progress for focus skills', () => {
      const metrics = service.calculateProgressMetrics(mockSkills[2]) // Focus Skill

      expect(metrics.practiceCount).toBe(2)
      expect(metrics.levelUpCount).toBe(1)
      expect(metrics.averageQuality).toBe(2.5) // (2+3)/2 = 2.5
      expect(metrics.focusProgress).toBe(75) // 45/60 * 100 = 75
      expect(metrics.isReadyForLevelUp).toBe(true)
    })

    it('should handle skills without practice history', () => {
      const metrics = service.calculateProgressMetrics(mockSkills[0]) // Backlog Skill

      expect(metrics.practiceCount).toBe(0)
      expect(metrics.levelUpCount).toBe(0)
      expect(metrics.averageQuality).toBe(0)
      expect(metrics.focusProgress).toBe(0)
      expect(metrics.isReadyForLevelUp).toBe(false)
    })

    it('should handle skills with less than 10 recent sessions', () => {
      const skillWith2Sessions = mockSkills[2] // Focus Skill has 2 sessions
      const metrics = service.calculateProgressMetrics(skillWith2Sessions)

      expect(metrics.averageQuality).toBe(2.5) // Uses all available sessions
    })
  })

  describe('getSkillsDueForReview', () => {
    it('should return skills due for review', () => {
      const skillsDue = service.getSkillsDueForReview(mockSkills)

      expect(skillsDue).toHaveLength(1)
      expect(skillsDue[0].name).toBe('Maintenance Skill') // Has past due date
    })

    it('should exclude archived and backlog skills', () => {
      const skillsWithDueDates = mockSkills.map(skill => ({
        ...skill,
        nextReview: '2023-01-01T00:00:00.000Z' // All past due
      }))

      const skillsDue = service.getSkillsDueForReview(skillsWithDueDates)

      // Should only include acquisition, focus, maintenance (3 skills)
      expect(skillsDue).toHaveLength(3)
      expect(skillsDue.map(s => s.status)).toEqual(['acquisition', 'focus', 'maintenance'])
    })

    it('should exclude skills without next review date', () => {
      const skillsWithoutReview = mockSkills.map(skill => {
        const { nextReview, ...rest } = skill
        // Unused variable for destructuring
        void nextReview
        return rest as SkillData
      })

      const skillsDue = service.getSkillsDueForReview(skillsWithoutReview)
      expect(skillsDue).toHaveLength(0)
    })
  })

  describe('calculateLearningVelocity', () => {
    it('should calculate learning velocity for recent weeks', () => {
      // Mock recent dates for progression history
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 10) // 10 days ago

      const skillsWithRecentProgress = mockSkills.map(skill => ({
        ...skill,
        progressionHistory: skill.progressionHistory.map(entry => ({
          ...entry,
          date: recentDate.toISOString()
        }))
      }))

      const velocity = service.calculateLearningVelocity(skillsWithRecentProgress, 4)

      expect(velocity).toBe(0.75) // 3 recent level-ups / 4 weeks = 0.75
    })

    it('should return 0 for no recent progressions', () => {
      // Set all progressions to old dates
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 60) // 60 days ago (outside 4 week window)

      const skillsWithOldProgress = mockSkills.map(skill => ({
        ...skill,
        progressionHistory: skill.progressionHistory.map(entry => ({
          ...entry,
          date: oldDate.toISOString()
        }))
      }))

      const velocity = service.calculateLearningVelocity(skillsWithOldProgress, 4)
      expect(velocity).toBe(0)
    })
  })

  describe('getStaleSkills', () => {
    it('should return skills not practiced recently', () => {
      const staleSkills = service.getStaleSkills(mockSkills, 30) // 30 days threshold

      expect(staleSkills).toHaveLength(1)
      expect(staleSkills[0].name).toBe('Maintenance Skill') // Practiced on 2022-12-15
    })

    it('should exclude archived and backlog skills', () => {
      const allStaleSkills = mockSkills.map(skill => ({
        ...skill,
        lastPracticed: '2022-01-01T00:00:00.000Z' // Very old date
      }))

      const staleSkills = service.getStaleSkills(allStaleSkills, 30)

      // Should exclude backlog and archived skills
      expect(staleSkills).toHaveLength(3) // acquisition, focus, maintenance
      expect(staleSkills.map(s => s.status)).toEqual(['acquisition', 'focus', 'maintenance'])
    })

    it('should sort skills by oldest practice date first', () => {
      const skillsWithDifferentDates = [
        { ...mockSkills[1], lastPracticed: '2022-06-01T00:00:00.000Z' }, // Mid-old
        { ...mockSkills[2], lastPracticed: '2022-01-01T00:00:00.000Z' }, // Oldest
        { ...mockSkills[3], lastPracticed: '2022-12-01T00:00:00.000Z' }  // Newest of old
      ]

      const staleSkills = service.getStaleSkills(skillsWithDifferentDates, 30)

      expect(staleSkills[0].lastPracticed).toBe('2022-01-01T00:00:00.000Z') // Oldest first
      expect(staleSkills[1].lastPracticed).toBe('2022-06-01T00:00:00.000Z')
      expect(staleSkills[2].lastPracticed).toBe('2022-12-01T00:00:00.000Z')
    })

    it('should include skills that were never practiced', () => {
      const neverPracticedSkill = {
        ...mockSkills[1],
        lastPracticed: undefined
      } as SkillData

      const staleSkills = service.getStaleSkills([neverPracticedSkill], 30)

      expect(staleSkills).toHaveLength(1)
      expect(staleSkills[0].lastPracticed).toBeUndefined()
    })
  })
})