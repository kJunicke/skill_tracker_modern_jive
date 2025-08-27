import type { SkillData, PracticeSession, ProgressionEntry } from '@/types/skill'
import type { SkillTag, SkillStatus } from '@/utils/constants'
import type { StorageService } from './StorageService'
import type { SpacedRepetitionService } from './SpacedRepetitionService'
import type { AnalyticsService } from './AnalyticsService'
import { QualityHelpers } from '@/utils/qualityUtils'

/**
 * DTO for creating new skills
 */
export interface CreateSkillDto {
  name: string
  level: number
  status: SkillStatus
  spacedRepetitionMode?: 'daily' | 'weekly'
  tags: SkillTag[]
  notes: string
}

/**
 * DTO for updating existing skills
 */
export interface UpdateSkillDto {
  name?: string
  level?: number
  status?: SkillStatus
  spacedRepetitionMode?: 'daily' | 'weekly'
  tags?: SkillTag[]
  notes?: string
  nextReview?: string
  lastPracticed?: string
  easeFactor?: number
  interval?: number
  repetitions?: number
  focusData?: SkillData['focusData']
  progressionHistory?: ProgressionEntry[]
  practiceLog?: PracticeSession[]
}

/**
 * DTO for practice sessions
 */
export interface PracticeSessionDto {
  quality: number
  note: string
  levelUpInfo?: {
    newLevel: number
    comment: string
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Main service for skill management business logic
 */
export class SkillService {
  constructor(
    private storage: StorageService,
    private spacedRepetition: SpacedRepetitionService,
    private analytics: AnalyticsService
  ) {}

  /**
   * Create a new skill
   */
  async createSkill(data: CreateSkillDto): Promise<SkillData> {
    // Validate input
    const validation = this.validateSkillData(data)
    if (!validation.isValid) {
      throw new Error(`Invalid skill data: ${validation.errors.join(', ')}`)
    }

    const now = new Date().toISOString()
    const newSkill: SkillData = {
      ...data,
      id: this.generateSkillId(),
      spacedRepetitionMode: data.spacedRepetitionMode || 'daily', // Default to daily mode
      dateCreated: now,
      dateModified: now,
      progressionHistory: [],
      practiceLog: [],
      // SM2 defaults
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0
    }

    // Initialize focus data if status is focus
    if (newSkill.status === 'focus') {
      newSkill.focusData = {
        totalSessions: 0,
        consecutiveGoodSessions: 0,
        currentXP: 0,
        targetXP: this.spacedRepetition.calculateTargetXP(newSkill.level),
        lastQuality: null,
        readyForLevelUp: false
      }
    }

    // Load existing skills, add new one, and save
    const skills = await this.storage.loadSkills()
    skills.push(newSkill)
    await this.storage.saveSkills(skills)

    return newSkill
  }

  /**
   * Update an existing skill
   */
  async updateSkill(id: string, updates: UpdateSkillDto): Promise<SkillData> {
    const skills = await this.storage.loadSkills()
    const skillIndex = skills.findIndex(s => s.id === id)
    
    if (skillIndex === -1) {
      throw new Error(`Skill with id ${id} not found`)
    }

    const skill = skills[skillIndex]
    const updatedSkill: SkillData = {
      ...skill,
      ...updates,
      dateModified: new Date().toISOString()
    }

    skills[skillIndex] = updatedSkill
    await this.storage.saveSkills(skills)

    return updatedSkill
  }

  /**
   * Delete a skill
   */
  async deleteSkill(id: string): Promise<boolean> {
    const skills = await this.storage.loadSkills()
    const initialLength = skills.length
    const filteredSkills = skills.filter(s => s.id !== id)
    
    if (filteredSkills.length === initialLength) {
      return false // Skill not found
    }

    await this.storage.saveSkills(filteredSkills)
    return true
  }

  /**
   * Record a practice session with optional level-up in unified system
   */
  async recordPracticeSession(skillId: string, session: PracticeSessionDto): Promise<SkillData> {
    const skills = await this.storage.loadSkills()
    const skill = skills.find(s => s.id === skillId)
    
    if (!skill) {
      throw new Error(`Skill with id ${skillId} not found`)
    }

    const now = new Date().toISOString()
    
    // Add practice session to log
    const practiceSession: PracticeSession = {
      date: now,
      quality: session.quality,
      qualityText: QualityHelpers.getText(session.quality),
      note: session.note,
      levelUpInfo: session.levelUpInfo
    }

    if (!skill.practiceLog) {
      skill.practiceLog = []
    }
    skill.practiceLog.push(practiceSession)

    // Handle level-up if provided
    let levelUpUpdates = {}
    if (session.levelUpInfo) {
      // Add progression entry for level-up
      const progressionEntry: ProgressionEntry = {
        level: session.levelUpInfo.newLevel,
        date: now,
        comment: session.levelUpInfo.comment,
        previousLevel: skill.level
      }

      if (!skill.progressionHistory) {
        skill.progressionHistory = []
      }
      skill.progressionHistory.push(progressionEntry)

      // Reset focus data if leveling up from focus mode
      const focusDataUpdate = this.spacedRepetition.resetFocusDataForLevelUp(skill, session.levelUpInfo.newLevel)

      levelUpUpdates = {
        level: session.levelUpInfo.newLevel,
        progressionHistory: skill.progressionHistory,
        ...focusDataUpdate
      }
    }

    // Check for automatic status transitions
    const automaticTransitions = this.spacedRepetition.checkAutomaticStatusTransitions({
      ...skill,
      ...levelUpUpdates // Apply level changes before checking transitions
    })
    
    // Filter out user-facing transitions (acquisition → maintenance at level 5)
    // These should be suggested to user rather than applied automatically
    const currentLevel = ('level' in levelUpUpdates ? levelUpUpdates.level : skill.level) as number
    const shouldApplyTransition = !(
      skill.status === 'acquisition' && 
      automaticTransitions.status === 'maintenance' &&
      currentLevel >= 5
    )
    
    const transitionsToApply = shouldApplyTransition ? automaticTransitions : {}
    
    // Update SM2 parameters (respects status-specific logic)
    const sm2Updates = this.spacedRepetition.updateSM2Parameters({
      ...skill,
      ...levelUpUpdates, // Apply level changes
      ...transitionsToApply // Apply only non-user-facing transitions before SM2 calculation
    }, session.quality)
    
    // Handle focus progression if in focus mode
    let focusUpdates = {}
    if (skill.status === 'focus' || automaticTransitions.status === 'focus') {
      focusUpdates = this.spacedRepetition.handleFocusProgression(skill, session.quality)
    }

    // Update skill with all changes
    const updates: UpdateSkillDto = {
      ...levelUpUpdates, // Apply level-up changes first
      ...transitionsToApply, // Apply only non-user-facing status transitions
      ...sm2Updates,
      ...focusUpdates,
      lastPracticed: now,
      practiceLog: skill.practiceLog
    }

    return await this.updateSkill(skillId, updates)
  }

  /**
   * Level up a skill
   */
  async levelUpSkill(skillId: string, newLevel: number, comment: string): Promise<SkillData> {
    const skills = await this.storage.loadSkills()
    const skill = skills.find(s => s.id === skillId)
    
    if (!skill) {
      throw new Error(`Skill with id ${skillId} not found`)
    }

    const now = new Date().toISOString()
    
    // Add progression entry
    const progressionEntry: ProgressionEntry = {
      level: newLevel,
      date: now,
      comment,
      previousLevel: skill.level
    }

    if (!skill.progressionHistory) {
      skill.progressionHistory = []
    }
    skill.progressionHistory.push(progressionEntry)

    // Reset focus data if leveling up from focus mode
    const focusDataUpdate = this.spacedRepetition.resetFocusDataForLevelUp(skill, newLevel)

    const updates: UpdateSkillDto = {
      level: newLevel,
      progressionHistory: skill.progressionHistory,
      ...focusDataUpdate
    }

    return await this.updateSkill(skillId, updates)
  }

  /**
   * Update a level-up comment
   */
  async updateLevelUpComment(skillId: string, level: number, newComment: string): Promise<void> {
    const skills = await this.storage.loadSkills()
    const skill = skills.find(s => s.id === skillId)
    
    if (!skill) {
      throw new Error(`Skill with id ${skillId} not found`)
    }
    
    const progressionEntry = skill.progressionHistory.find(p => p.level === level)
    if (progressionEntry) {
      progressionEntry.comment = newComment
      await this.storage.saveSkills(skills)
    }
  }

  /**
   * Update a practice session note
   */
  async updatePracticeNote(skillId: string, date: string, newNote: string): Promise<void> {
    const skills = await this.storage.loadSkills()
    const skill = skills.find(s => s.id === skillId)
    
    if (!skill) {
      throw new Error(`Skill with id ${skillId} not found`)
    }
    
    const practiceSession = skill.practiceLog.find(p => p.date === date)
    if (practiceSession) {
      practiceSession.note = newNote
      await this.storage.saveSkills(skills)
    }
  }

  /**
   * Load all skills
   */
  async loadAllSkills(): Promise<SkillData[]> {
    const skills = await this.storage.loadSkills()
    
    // Migration: Add spacedRepetitionMode to existing skills
    let needsMigration = false
    const migratedSkills = skills.map(skill => {
      if (!skill.spacedRepetitionMode) {
        needsMigration = true
        return {
          ...skill,
          spacedRepetitionMode: 'daily' as const // Default existing skills to daily mode
        }
      }
      return skill
    })
    
    // Save migrated skills back to storage if migration was needed
    if (needsMigration) {
      await this.storage.saveSkills(migratedSkills)
      console.log(`Migrated ${migratedSkills.filter(s => !skills.find(orig => orig.id === s.id && orig.spacedRepetitionMode)).length} skills to include spacedRepetitionMode`)
    }
    
    return migratedSkills
  }

  /**
   * Initialize test data
   */
  async initializeTestData(): Promise<SkillData[]> {
    const { createTestSkills } = await import('@/utils/testData')
    const testSkills = createTestSkills()
    await this.storage.saveSkills(testSkills)
    return testSkills
  }

  /**
   * Validate skill creation data
   */
  private validateSkillData(data: CreateSkillDto): ValidationResult {
    const errors: string[] = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Skill name is required')
    }

    if (data.name && data.name.length > 100) {
      errors.push('Skill name must be 100 characters or less')
    }

    if (data.level < 0) {
      errors.push('Skill level must be 0 or higher')
    }

    if (!data.status) {
      errors.push('Skill status is required')
    }

    if (!Array.isArray(data.tags)) {
      errors.push('Tags must be an array')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if a skill should suggest level-up after practice session
   */
  shouldSuggestLevelUp(skillId: string, practiceQuality: number): Promise<boolean> {
    return this.storage.loadSkills().then(skills => {
      const skill = skills.find(s => s.id === skillId)
      if (!skill) return false
      
      return this.spacedRepetition.shouldSuggestLevelUp(skill, practiceQuality)
    })
  }

  /**
   * Check if a skill should suggest status transition after level-up
   */
  async shouldSuggestStatusTransition(skillId: string): Promise<{ shouldSuggest: boolean; suggestedStatus?: SkillStatus; reason?: string }> {
    const skills = await this.storage.loadSkills()
    const skill = skills.find(s => s.id === skillId)
    
    if (!skill) {
      return { shouldSuggest: false }
    }

    const transitions = this.spacedRepetition.checkAutomaticStatusTransitions(skill)
    
    if (transitions.status && transitions.status !== skill.status) {
      let reason = ''
      if (skill.status === 'acquisition' && transitions.status === 'maintenance') {
        reason = 'Du hast Level 5 erreicht! In der Maintenance-Phase übst du seltener und behältst deine Fähigkeiten bei.'
      } else if (skill.status === 'focus' && transitions.status === 'maintenance') {
        reason = '7 Tage ohne Übung - zurück zur normalen Spaced Repetition?'
      }
      
      return { 
        shouldSuggest: true, 
        suggestedStatus: transitions.status as SkillStatus,
        reason 
      }
    }

    return { shouldSuggest: false }
  }

  /**
   * Apply status transition to a skill
   */
  async applyStatusTransition(skillId: string, newStatus: SkillStatus): Promise<SkillData> {
    return await this.updateSkill(skillId, { status: newStatus })
  }

  /**
   * Check if any skills need automatic status transitions
   */
  async checkAndApplyStatusTransitions(): Promise<SkillData[]> {
    const skills = await this.storage.loadSkills()
    const updatedSkills: SkillData[] = []
    
    for (const skill of skills) {
      const transitions = this.spacedRepetition.checkAutomaticStatusTransitions(skill)
      
      if (Object.keys(transitions).length > 0) {
        const updatedSkill = await this.updateSkill(skill.id, transitions)
        updatedSkills.push(updatedSkill)
      }
    }
    
    return updatedSkills
  }

  /**
   * Get skills that are due for review (excluding backlog and archived)
   */
  async getSkillsDueForReview(): Promise<SkillData[]> {
    const skills = await this.storage.loadSkills()
    const now = new Date().toISOString()
    
    return skills.filter(skill => {
      // Exclude non-learning statuses
      if (skill.status === 'backlog' || skill.status === 'archived') {
        return false
      }
      
      // Focus mode skills are always suggested
      if (skill.status === 'focus') {
        return true
      }
      
      // Check if due for review
      if (!skill.nextReview) {
        return true // No next review set, should be reviewed
      }
      
      return skill.nextReview <= now
    })
  }

  /**
   * Generate unique skill ID
   */
  private generateSkillId(): string {
    return `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}