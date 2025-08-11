import type { SkillData } from '@/types/skill'

/**
 * Training statistics interface
 */
export interface TrainingStats {
  totalSkills: number
  activeSkills: number
  totalPracticeSessions: number
  totalLevelUps: number
  averageLevel: number
}

/**
 * Skills grouped by status
 */
export interface SkillsByStatus {
  backlog: SkillData[]
  acquisition: SkillData[]
  maintenance: SkillData[]
  focus: SkillData[]
  archived: SkillData[]
}

/**
 * Service for analytics and statistics calculations
 */
export class AnalyticsService {
  /**
   * Calculate comprehensive training statistics
   */
  calculateTrainingStats(skills: SkillData[]): TrainingStats {
    const totalPracticeSessions = skills.reduce((sum, skill) => 
      sum + (skill.practiceLog?.length || 0), 0
    )
    
    const totalLevelUps = skills.reduce((sum, skill) => 
      sum + (skill.progressionHistory?.length || 0), 0
    )

    const activeSkills = skills.filter(s => 
      s.status !== 'archived' && s.status !== 'backlog'
    ).length

    const averageLevel = skills.length > 0 ? 
      skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length : 0

    return {
      totalSkills: skills.length,
      activeSkills,
      totalPracticeSessions,
      totalLevelUps,
      averageLevel: Math.round(averageLevel * 100) / 100 // Round to 2 decimal places
    }
  }

  /**
   * Group skills by their status
   */
  groupSkillsByStatus(skills: SkillData[]): SkillsByStatus {
    return {
      backlog: skills.filter(s => s.status === 'backlog'),
      acquisition: skills.filter(s => s.status === 'acquisition'),
      maintenance: skills.filter(s => s.status === 'maintenance'),
      focus: skills.filter(s => s.status === 'focus'),
      archived: skills.filter(s => s.status === 'archived')
    }
  }

  /**
   * Calculate progress metrics for a specific skill
   */
  calculateProgressMetrics(skill: SkillData) {
    const practiceCount = skill.practiceLog?.length || 0
    const levelUpCount = skill.progressionHistory?.length || 0
    
    // Calculate average quality from recent practice sessions
    const recentSessions = skill.practiceLog?.slice(-10) || []
    const averageQuality = recentSessions.length > 0 ?
      recentSessions.reduce((sum, session) => sum + session.quality, 0) / recentSessions.length : 0

    // Calculate focus progress if in focus mode
    let focusProgress = 0
    if (skill.status === 'focus' && skill.focusData) {
      focusProgress = (skill.focusData.currentXP / skill.focusData.targetXP) * 100
    }

    return {
      practiceCount,
      levelUpCount,
      averageQuality: Math.round(averageQuality * 100) / 100,
      focusProgress: Math.round(focusProgress * 100) / 100,
      isReadyForLevelUp: skill.focusData?.readyForLevelUp || false
    }
  }

  /**
   * Get skills due for review (next review date is today or past)
   */
  getSkillsDueForReview(skills: SkillData[]): SkillData[] {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    return skills.filter(skill => {
      if (!skill.nextReview || skill.status === 'archived' || skill.status === 'backlog') {
        return false
      }
      
      const reviewDate = new Date(skill.nextReview)
      return reviewDate <= today
    })
  }

  /**
   * Calculate learning velocity (skills improved per week)
   */
  calculateLearningVelocity(skills: SkillData[], weeks: number = 4): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - (weeks * 7))

    const recentLevelUps = skills.reduce((count, skill) => {
      const recentProgressions = skill.progressionHistory?.filter(entry => 
        new Date(entry.date) >= cutoffDate
      ) || []
      return count + recentProgressions.length
    }, 0)

    return Math.round((recentLevelUps / weeks) * 100) / 100
  }

  /**
   * Get skills with longest streak without practice
   */
  getStaleSkills(skills: SkillData[], dayThreshold: number = 14): SkillData[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - dayThreshold)

    return skills.filter(skill => {
      if (skill.status === 'archived' || skill.status === 'backlog') {
        return false
      }

      const lastPracticed = skill.lastPracticed ? new Date(skill.lastPracticed) : null
      return !lastPracticed || lastPracticed < cutoffDate
    }).sort((a, b) => {
      const aDate = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0
      const bDate = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0
      return aDate - bDate // Oldest first
    })
  }
}