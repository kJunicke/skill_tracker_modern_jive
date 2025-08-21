import type { SkillData } from '@/types/skill'
import { calculateTargetXP } from './focusDataHelpers'

export function createTestSkills(): SkillData[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  return [
    // 1. ACQUISITION - Learning a new move
    {
      id: 'skill_texas_tommy',
      name: 'Texas Tommy',
      tags: ['Move', 'Control'],
      level: 3,
      status: 'acquisition',
      notes: 'Classic ceroc move with underarm turn and hook variations. Focus on clear lead and following partner\'s movement.',
      dateCreated: twoWeeksAgo,
      dateModified: yesterday,
      easeFactor: 2.5,
      interval: 2,
      repetitions: 3,
      lastPracticed: yesterday,
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [
        {
          level: 1,
          date: twoWeeksAgo,
          comment: 'First successful execution of basic Texas Tommy',
          previousLevel: 0
        },
        {
          level: 2, 
          date: weekAgo,
          comment: 'Added smooth hook variation',
          previousLevel: 1
        }
      ],
      practiceLog: [
        {
          date: twoWeeksAgo,
          quality: 1,
          qualityText: 'Hard',
          note: 'Struggled with timing and partner connection',
          transferredToNotes: false
        },
        {
          date: weekAgo,
          quality: 2,
          qualityText: 'Good',
          note: 'Better timing, worked on hook variation',
          levelUpInfo: {
            newLevel: 2,
            comment: 'Added smooth hook variation'
          },
          transferredToNotes: false
        },
        {
          date: threeDaysAgo,
          quality: 2,
          qualityText: 'Good',
          note: 'Consistent execution, ready for level 3',
          levelUpInfo: {
            newLevel: 3,
            comment: 'Mastered basic and hook variations'
          },
          transferredToNotes: true
        }
      ],
      quickNotes: [
        {
          note: 'Remember - lead with body, not just arms!',
          date: threeDaysAgo,
          transferredToNotes: false
        }
      ]
    },

    // 2. FOCUS - Active skill with XP progression  
    {
      id: 'skill_windmill_turn',
      name: 'Windmill Turn',
      tags: ['Move', 'Control'],
      level: 8,
      status: 'focus',
      notes: 'Advanced turning technique requiring precise timing and momentum transfer.',
      dateCreated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: now,
      easeFactor: 2.3,
      interval: 14,
      repetitions: 5,
      lastPracticed: threeDaysAgo,
      nextReview: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [],
      focusData: {
        consecutiveGoodSessions: 3,
        totalSessions: 8,
        currentXP: 15,
        targetXP: calculateTargetXP(8), // Uses central XP calculation
        lastQuality: 3,
        readyForLevelUp: false
      },
      practiceLog: [
        {
          date: weekAgo,
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Perfect execution in social dancing',
          transferredToNotes: false
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Good technique, worked on speed variations',
          transferredToNotes: false
        },
        {
          date: threeDaysAgo,
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Solid practice session, maintained good timing',
          transferredToNotes: false
        }
      ],
      quickNotes: [
        {
          note: 'Partner feedback: "Your leading on this move is so clear and confident"',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          transferredToNotes: true
        },
        {
          note: 'Don\'t forget - practice session scheduled for today!',
          date: yesterday,
          transferredToNotes: false
        }
      ]
    },

    // 3. MAINTENANCE - Well-established skill
    {
      id: 'skill_first_move',
      name: 'First Move',
      tags: ['Move', 'Leading'],
      level: 12,
      status: 'maintenance', 
      notes: 'Fundamental ceroc move - foundation of all partner work. Should be effortless by now.',
      dateCreated: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: weekAgo,
      easeFactor: 2.8,
      interval: 21,
      repetitions: 12,
      lastPracticed: weekAgo,
      nextReview: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [],
      practiceLog: [
        {
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Effortless execution, muscle memory fully established',
          transferredToNotes: false
        },
        {
          date: weekAgo,
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Used as warm-up move, perfect as always',
          transferredToNotes: false
        }
      ],
      quickNotes: [
        {
          note: 'Teaching beginners this move - remember to emphasize frame and posture',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          transferredToNotes: false
        }
      ]
    },

    // 4. BACKLOG - Not yet started
    {
      id: 'skill_salsa_cross_training',
      name: 'Salsa Cross-Training',
      tags: ['Musicality', 'Communication'],
      level: 0,
      status: 'backlog',
      notes: 'Explore salsa techniques to improve ceroc musicality and hip movement. Research local salsa classes.',
      dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      progressionHistory: [],
      practiceLog: [],
      quickNotes: [
        {
          note: 'Found good salsa school nearby - "Havana Dance Studio" - check their beginner classes',
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          transferredToNotes: false
        },
        {
          note: 'Watch YouTube videos: "Salsa basics for social dancers"',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
          transferredToNotes: false
        }
      ]
    },

    // 5. ARCHIVED - Skill no longer actively practiced
    {
      id: 'skill_competition_performance',
      name: 'Competition Performance',
      tags: ['Charisma', 'Following'],
      level: 6,
      status: 'archived',
      notes: 'Competition routine development and performance skills. Archived after competition season ended.',
      dateCreated: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      easeFactor: 2.4,
      interval: 7,
      repetitions: 6,
      lastPracticed: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [],
      practiceLog: [
        {
          date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Final competition routine practice - ready for competition!',
          transferredToNotes: true
        },
        {
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Post-competition debrief session',
          transferredToNotes: false
        }
      ],
      quickNotes: [
        {
          note: '🏆 Won 2nd place at Regional Championships! Great experience.',
          date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
          transferredToNotes: true
        },
        {
          note: 'Archive this skill - competition season over, focusing on social dancing again',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          transferredToNotes: false
        }
      ]
    }
  ]
}