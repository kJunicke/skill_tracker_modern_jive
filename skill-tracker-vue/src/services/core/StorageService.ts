import type { SkillData } from '@/types/skill'

/**
 * Storage interface for abstracting data persistence
 */
export interface StorageAdapter {
  load<T>(key: string): Promise<T | null>
  save<T>(key: string, data: T): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Service for handling skill data persistence
 */
export class StorageService {
  private static readonly SKILLS_KEY = 'modernJiveSkills'

  constructor(private adapter: StorageAdapter) {}

  async loadSkills(): Promise<SkillData[]> {
    try {
      const skills = await this.adapter.load<SkillData[]>(StorageService.SKILLS_KEY)
      return Array.isArray(skills) ? skills : []
    } catch (error) {
      console.error('Error loading skills:', error)
      return []
    }
  }

  async saveSkills(skills: SkillData[]): Promise<void> {
    try {
      await this.adapter.save(StorageService.SKILLS_KEY, skills)
    } catch (error) {
      console.error('Error saving skills:', error)
      throw new Error('Failed to save skills')
    }
  }

  async clearSkills(): Promise<void> {
    try {
      await this.adapter.remove(StorageService.SKILLS_KEY)
    } catch (error) {
      console.error('Error clearing skills:', error)
      throw new Error('Failed to clear skills')
    }
  }

  async backupSkills(): Promise<SkillData[]> {
    const skills = await this.loadSkills()
    const backupKey = `${StorageService.SKILLS_KEY}_backup_${Date.now()}`
    await this.adapter.save(backupKey, skills)
    return skills
  }

  async exportAllData(): Promise<string> {
    try {
      const skills = await this.loadSkills()
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        skills: skills,
        metadata: {
          skillCount: skills.length,
          exportedBy: 'Modern Jive Skill Tracker'
        }
      }
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Error exporting data:', error)
      throw new Error('Failed to export data')
    }
  }

  async importAllData(jsonData: string): Promise<{ success: boolean; skillsImported: number; errors?: string[] }> {
    try {
      const data = JSON.parse(jsonData)
      const errors: string[] = []

      // Validate data structure
      if (!data.skills || !Array.isArray(data.skills)) {
        throw new Error('Invalid export file: skills array not found')
      }

      // Validate each skill
      const validSkills: SkillData[] = []
      for (const [index, skill] of data.skills.entries()) {
        try {
          this.validateSkillData(skill)
          validSkills.push(skill)
        } catch (error) {
          errors.push(`Skill ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`)
        }
      }

      if (validSkills.length === 0) {
        throw new Error('No valid skills found in import file')
      }

      // Create backup before import
      await this.backupSkills()

      // Save imported skills
      await this.saveSkills(validSkills)

      return {
        success: true,
        skillsImported: validSkills.length,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private validateSkillData(skill: unknown): void {
    if (!skill || typeof skill !== 'object') {
      throw new Error('Skill data must be an object')
    }

    const skillObj = skill as Record<string, unknown>
    const requiredFields = ['id', 'name', 'tags', 'level', 'status', 'notes', 'dateCreated', 'dateModified']
    const requiredNumberFields = ['easeFactor', 'interval', 'repetitions']
    const requiredArrayFields = ['progressionHistory', 'practiceLog']

    for (const field of requiredFields) {
      if (skillObj[field] === undefined || skillObj[field] === null) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    for (const field of requiredNumberFields) {
      if (typeof skillObj[field] !== 'number') {
        throw new Error(`Field ${field} must be a number`)
      }
    }

    for (const field of requiredArrayFields) {
      if (!Array.isArray(skillObj[field])) {
        throw new Error(`Field ${field} must be an array`)
      }
    }

    if (typeof skillObj.level !== 'number' || skillObj.level < 0) {
      throw new Error('Level must be a non-negative number')
    }

    if (!Array.isArray(skillObj.tags)) {
      throw new Error('Tags must be an array')
    }

    // Validate status
    const validStatuses = ['backlog', 'acquisition', 'maintenance', 'focus', 'archived']
    if (!validStatuses.includes(skillObj.status as string)) {
      throw new Error(`Invalid status: ${skillObj.status}`)
    }
  }
}