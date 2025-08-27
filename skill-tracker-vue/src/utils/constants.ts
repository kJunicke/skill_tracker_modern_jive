// Modern Jive skill tags
export const SKILL_TAGS = [
  'Move',
  'Communication', 
  'Musicality',
  'Control',
  'Charisma',
  'Leading',
  'Following'
] as const

export type SkillTag = typeof SKILL_TAGS[number]

// Skill status types
export const SKILL_STATUSES = [
  'backlog',
  'acquisition',
  'maintenance', 
  'focus',
  'archived'
] as const

export type SkillStatus = typeof SKILL_STATUSES[number]

// Practice quality levels (1-4 scale as per LEARNING_SYSTEM.md)
export const PRACTICE_QUALITIES = [
  'Forgotten',    // 1
  'Hard',         // 2
  'Good',         // 3
  'Very Easy'     // 4
] as const

export type PracticeQuality = typeof PRACTICE_QUALITIES[number]

// Spaced Repetition Modes
export const SPACED_REPETITION_MODES = [
  'daily',
  'weekly'
] as const

export type SpacedRepetitionMode = typeof SPACED_REPETITION_MODES[number]

// Status configurations
export const STATUS_CONFIG = {
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
  },
  focus: {
    label: 'Focus',
    icon: 'bi-bullseye', 
    color: 'danger',
    description: 'Actively improve level'
  },
  archived: {
    label: 'Archived',
    icon: 'bi-archive',
    color: 'secondary', 
    description: 'No longer practice'
  }
} as const

// Level descriptions
export const LEVEL_DESCRIPTIONS = {
  0: 'Not learned',
  1: 'Concentration',
  2: 'Flow', 
  3: 'Polish',
  4: 'Perfection',
  5: 'Mastery',
  6: 'Excellence',
  7: 'Expertise',
  8: 'Virtuosity',
  9: 'Artistry',
  10: 'Transcendence'
} as const

// Star colors by level range
export const STAR_COLORS = {
  0: 'text-danger', // Red circle for level 0
  1: 'text-warning', // Yellow stars (1-5)
  6: 'text-success', // Green stars (6-9) 
  10: 'text-info',   // Blue stars (10-19)
  20: 'text-danger', // Red stars (20-49)
  50: 'text-primary' // Purple stars (50+)
} as const