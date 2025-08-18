import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SkillData } from '@/types/skill'
import type { SkillTag, SkillStatus } from '@/utils/constants'
import { 
  getServiceContainer, 
  SERVICE_TOKENS, 
  type CreateSkillDto, 
  type PracticeSessionDto,
  SkillService,
  AnalyticsService,
  StorageService
} from '@/services'
import { useToasts } from '@/composables/useToasts'

export const useSkillStore = defineStore('skills', () => {
  // Get services from container
  const services = getServiceContainer()
  const skillService = services[SERVICE_TOKENS.SKILL_SERVICE] as SkillService
  const analyticsService = services[SERVICE_TOKENS.ANALYTICS_SERVICE] as AnalyticsService
  const storageService = services[SERVICE_TOKENS.STORAGE_SERVICE] as StorageService
  
  // Toast notifications
  const { showError } = useToasts()

  // UI State (reactive data for components)
  const skills = ref<SkillData[]>([])
  const selectedSkill = ref<SkillData | null>(null)
  const filters = ref({
    status: 'all' as SkillStatus | 'all',
    tag: 'all' as SkillTag | 'all', 
    search: ''
  })

  const sorting = ref({
    field: 'reviewDate' as 'reviewDate' | 'name' | 'level',
    direction: 'asc' as 'asc' | 'desc'
  })

  // Computed Properties (UI logic only)
  const filteredSkills = computed(() => {
    let filtered = [...skills.value]

    // Status filter
    if (filters.value.status !== 'all') {
      filtered = filtered.filter(skill => skill.status === filters.value.status)
    }

    // Tag filter
    if (filters.value.tag !== 'all') {
      filtered = filtered.filter(skill => skill.tags.includes(filters.value.tag as SkillTag))
    }

    // Search filter
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(search) ||
        skill.notes.toLowerCase().includes(search) ||
        skill.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    // Dynamic sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sorting.value.field) {
        case 'reviewDate':
          const aReview = a.nextReview ? new Date(a.nextReview) : null
          const bReview = b.nextReview ? new Date(b.nextReview) : null
          
          // Skills without nextReview go to the end for ascending, beginning for descending
          if (!aReview && !bReview) comparison = 0
          else if (!aReview) comparison = sorting.value.direction === 'asc' ? 1 : -1
          else if (!bReview) comparison = sorting.value.direction === 'asc' ? -1 : 1
          else comparison = aReview.getTime() - bReview.getTime()
          break
          
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
          
        case 'level':
          comparison = a.level - b.level
          break
      }
      
      return sorting.value.direction === 'desc' ? -comparison : comparison
    })

    return filtered
  })

  const skillsByStatus = computed(() => {
    return analyticsService.groupSkillsByStatus(skills.value)
  })

  const trainingStats = computed(() => {
    return analyticsService.calculateTrainingStats(skills.value)
  })

  // Actions (delegate to service layer)
  async function addSkill(skillData: Omit<CreateSkillDto, 'id' | 'dateCreated' | 'dateModified'>): Promise<SkillData> {
    try {
      const newSkill = await skillService.createSkill(skillData as CreateSkillDto)
      skills.value.push(newSkill)
      return newSkill
    } catch (error) {
      console.error('Error adding skill:', error)
      throw error
    }
  }

  async function updateSkill(id: string, updates: Partial<SkillData>): Promise<SkillData | null> {
    try {
      const updatedSkill = await skillService.updateSkill(id, updates)
      const index = skills.value.findIndex(s => s.id === id)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      return updatedSkill
    } catch (error) {
      console.error('Error updating skill:', error)
      return null
    }
  }

  async function deleteSkill(id: string): Promise<boolean> {
    try {
      const success = await skillService.deleteSkill(id)
      if (success) {
        const index = skills.value.findIndex(s => s.id === id)
        if (index !== -1) {
          skills.value.splice(index, 1)
        }
      }
      return success
    } catch (error) {
      console.error('Error deleting skill:', error)
      return false
    }
  }

  async function recordPracticeSession(skillId: string, quality: number, note: string = ''): Promise<SkillData | null> {
    try {
      const session: PracticeSessionDto = { quality, note }
      const updatedSkill = await skillService.recordPracticeSession(skillId, session)
      
      const index = skills.value.findIndex(s => s.id === skillId)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      
      return updatedSkill
    } catch (error) {
      console.error('Error recording practice session:', error)
      return null
    }
  }

  async function recordPracticeSessionWithLevelUp(skillId: string, quality: number, note: string, levelUpInfo?: { newLevel: number; comment: string }): Promise<SkillData | null> {
    try {
      const session: PracticeSessionDto = { quality, note, levelUpInfo }
      const updatedSkill = await skillService.recordPracticeSession(skillId, session)
      
      const index = skills.value.findIndex(s => s.id === skillId)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      
      return updatedSkill
    } catch (error) {
      console.error('Error recording practice session with level-up:', error)
      return null
    }
  }

  async function levelUpSkill(skillId: string, newLevel: number, comment: string): Promise<SkillData | null> {
    try {
      const updatedSkill = await skillService.levelUpSkill(skillId, newLevel, comment)
      
      const index = skills.value.findIndex(s => s.id === skillId)
      if (index !== -1) {
        skills.value[index] = updatedSkill
      }
      
      return updatedSkill
    } catch (error) {
      console.error('Error leveling up skill:', error)
      return null
    }
  }

  async function shouldSuggestStatusTransition(skillId: string): Promise<{ shouldSuggest: boolean; suggestedStatus?: SkillStatus; reason?: string }> {
    try {
      return await skillService.shouldSuggestStatusTransition(skillId)
    } catch (error) {
      console.error('Error checking status transition:', error)
      return { shouldSuggest: false }
    }
  }

  async function loadSkills(): Promise<void> {
    try {
      const loadedSkills = await skillService.loadAllSkills()
      
      if (loadedSkills.length === 0) {
        // Initialize with test data if no skills exist
        const testSkills = await skillService.initializeTestData()
        skills.value = testSkills
      } else {
        skills.value = loadedSkills
      }
    } catch (error) {
      console.error('Error loading skills:', error)
      showError('Data Load Failed', 'Unable to load your skills from storage. Please refresh the page.')
      skills.value = []
    }
  }

  async function deleteAllSkills(): Promise<void> {
    try {
      await storageService.clearSkills()
      skills.value = []
    } catch (error) {
      console.error('Error deleting all skills:', error)
      showError('Clear Data Failed', 'Unable to clear your skills from storage.')
    }
  }

  async function resetTestEnvironment(): Promise<void> {
    try {
      const testSkills = await skillService.initializeTestData()
      skills.value = testSkills
    } catch (error) {
      console.error('Error resetting test environment:', error)
      showError('Reset Failed', 'Unable to reset the test environment.')
    }
  }

  async function updateLevelUpComment(skillId: string, level: number, newComment: string): Promise<void> {
    try {
      await skillService.updateLevelUpComment(skillId, level, newComment)
      // Reload skills to reflect changes
      await loadSkills()
    } catch (error) {
      console.error('Error updating level-up comment:', error)
      showError('Update Failed', 'Unable to save the comment changes.')
    }
  }

  async function updatePracticeNote(skillId: string, date: string, newNote: string): Promise<void> {
    try {
      await skillService.updatePracticeNote(skillId, date, newNote)
      // Reload skills to reflect changes
      await loadSkills()
    } catch (error) {
      console.error('Error updating practice note:', error)
      showError('Update Failed', 'Unable to save the practice note changes.')
    }
  }

  async function exportData(): Promise<string> {
    try {
      return await storageService.exportAllData()
    } catch (error) {
      console.error('Error exporting data:', error)
      showError('Export Failed', 'Unable to export your skill data.')
      throw error
    }
  }

  async function importData(jsonData: string): Promise<{ success: boolean; skillsImported: number; errors?: string[] }> {
    try {
      const result = await storageService.importAllData(jsonData)
      // Reload skills to reflect changes
      await loadSkills()
      return result
    } catch (error) {
      console.error('Error importing data:', error)
      showError('Import Failed', error instanceof Error ? error.message : 'Unable to import skill data.')
      throw error
    }
  }

  // UI-specific actions
  function setFilter(key: keyof typeof filters.value, value: SkillStatus | SkillTag | 'all' | string): void {
    (filters.value as Record<string, unknown>)[key] = value
  }

  function resetFilters(): void {
    filters.value = {
      status: 'all',
      tag: 'all',
      search: ''
    }
  }

  function setSorting(field: typeof sorting.value.field, direction: typeof sorting.value.direction): void {
    sorting.value.field = field
    sorting.value.direction = direction
  }

  function toggleSortDirection(): void {
    sorting.value.direction = sorting.value.direction === 'asc' ? 'desc' : 'asc'
  }

  // Initialize store
  loadSkills()

  return {
    // State
    skills,
    selectedSkill,
    filters,
    sorting,
    
    // Computed Properties
    filteredSkills,
    skillsByStatus,
    trainingStats,
    
    // Actions
    addSkill,
    updateSkill,
    deleteSkill,
    recordPracticeSession,
    recordPracticeSessionWithLevelUp,
    levelUpSkill,
    shouldSuggestStatusTransition,
    loadSkills,
    deleteAllSkills,
    resetTestEnvironment,
    updateLevelUpComment,
    updatePracticeNote,
    exportData,
    importData,
    setFilter,
    resetFilters,
    setSorting,
    toggleSortDirection
  }
})