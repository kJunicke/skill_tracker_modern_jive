import type { SkillTag, SkillStatus } from '@/utils/constants'

export interface SkillData {
  id: string
  name: string
  tags: SkillTag[]
  level: number
  status: SkillStatus
  notes: string
  dateCreated: string
  dateModified: string
  
  // Spaced Repetition Mode
  spacedRepetitionMode?: 'daily' | 'weekly'
  
  // SM2 Spaced Repetition Parameters
  easeFactor: number
  interval: number
  repetitions: number
  lastPracticed?: string
  nextReview?: string
  
  // Focus Mode Tracking
  focusData?: FocusData
  
  // Progression History
  progressionHistory: ProgressionEntry[]
  
  // Practice Session Log
  practiceLog: PracticeSession[]
  
  // Quick Notes Log
  quickNotes?: QuickNote[]
}

export interface FocusData {
  consecutiveGoodSessions: number
  totalSessions: number
  currentXP: number
  targetXP: number
  lastQuality: number | null
  readyForLevelUp: boolean
}

export interface ProgressionEntry {
  level: number
  date: string
  comment: string
  previousLevel: number
  transferredToNotes?: boolean
}

export interface PracticeSession {
  date: string
  quality: number
  qualityText: string
  note: string
  transferredToNotes?: boolean
  levelUpInfo?: {
    newLevel: number
    comment: string
  }
}

export interface QuickNote {
  date: string
  note: string
  transferredToNotes?: boolean
}

export interface TrainingLogEntry {
  type: 'creation' | 'practice' | 'levelup' | 'status' | 'quicknote'
  date: string
  skillId: string
  skillName: string
  data: Record<string, unknown>
  icon: string
  color: string
}

