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
}