import { computed, type Ref } from 'vue'
import type { SkillData } from '@/types/skill'

interface Activity {
  id: string
  type: 'practice' | 'levelup' | 'quicknote'
  skillId: string
  skillName: string
  date: string
  description: string
  data: Record<string, unknown>
  icon: string
  color: string
}

interface Filters {
  timePeriod: string
  activityType: string
  skillId: string
  dateFrom: string
  dateTo: string
  showPractice: boolean
  showLevelup: boolean
  showQuicknote: boolean
}

export function useTrainingLogData(skills: Ref<SkillData[]>, filters: Ref<Filters>) {
  // Activity icon mapping
  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      practice: 'bi-play-circle',
      levelup: 'bi-arrow-up-circle',
      quicknote: 'bi-sticky',
    }
    return icons[type] || 'bi-circle'
  }

  // Activity color mapping
  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      practice: 'bg-success',
      levelup: 'bg-warning',
      quicknote: 'bg-primary',
    }
    return colors[type] || 'bg-secondary'
  }

  // Generate activity log from skill data
  const allActivities = computed(() => {
    const activities: Activity[] = []
    
    skills.value.forEach(skill => {
      
      // Add practice sessions
      if (skill.practiceLog) {
        skill.practiceLog.forEach((session, index) => {
          activities.push({
            id: `${skill.id}-practice-${index}`,
            type: 'practice',
            skillId: skill.id,
            skillName: skill.name,
            date: session.date,
            description: session.note || '',
            data: {
              quality: session.quality,
              qualityText: session.qualityText
            },
            icon: getActivityIcon('practice'),
            color: getActivityColor('practice')
          })
        })
      }
      
      // Add level-ups
      if (skill.progressionHistory) {
        skill.progressionHistory.forEach((levelUp, index) => {
          activities.push({
            id: `${skill.id}-levelup-${index}`,
            type: 'levelup',
            skillId: skill.id,
            skillName: skill.name,
            date: levelUp.date,
            description: levelUp.comment || '',
            data: {
              newLevel: levelUp.level,
              previousLevel: levelUp.previousLevel || levelUp.level - 1
            },
            icon: getActivityIcon('levelup'),
            color: getActivityColor('levelup')
          })
        })
      }
      
      // Add quick notes
      if (skill.quickNotes) {
        skill.quickNotes.forEach((quickNote, index) => {
          activities.push({
            id: `${skill.id}-quicknote-${index}`,
            type: 'quicknote',
            skillId: skill.id,
            skillName: skill.name,
            date: quickNote.date,
            description: quickNote.note || '',
            data: {
              note: quickNote.note,
              transferredToNotes: quickNote.transferredToNotes || false
            },
            icon: getActivityIcon('quicknote'),
            color: getActivityColor('quicknote')
          })
        })
      }
    })

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  // Activity counts for filter display
  const activityCounts = computed(() => {
    const counts = { practice: 0, levelup: 0, quicknote: 0 }
    allActivities.value.forEach(activity => {
      if (activity.type in counts) {
        counts[activity.type as keyof typeof counts]++
      }
    })
    return counts
  })

  // Filtered activities based on current filters
  const filteredActivities = computed(() => {
    return allActivities.value.filter(activity => {
      // Time period filter
      if (filters.value.timePeriod !== 'all') {
        const activityDate = new Date(activity.date)
        const now = new Date()
        
        switch (filters.value.timePeriod) {
          case 'today':
            if (activityDate.toDateString() !== now.toDateString()) return false
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (activityDate < weekAgo) return false
            break
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            if (activityDate < monthAgo) return false
            break
          case 'custom':
            const fromDate = filters.value.dateFrom ? new Date(filters.value.dateFrom) : null
            const toDate = filters.value.dateTo ? new Date(filters.value.dateTo) : null
            if (fromDate && activityDate < fromDate) return false
            if (toDate && activityDate > toDate) return false
            break
        }
      }
      
      // Activity type toggles
      if (activity.type === 'practice' && !filters.value.showPractice) return false
      if (activity.type === 'levelup' && !filters.value.showLevelup) return false
      if (activity.type === 'quicknote' && !filters.value.showQuicknote) return false
      
      // Legacy activity type filter (kept for compatibility)
      if (filters.value.activityType !== 'all' && activity.type !== filters.value.activityType) {
        return false
      }
      
      // Skill filter
      if (filters.value.skillId !== 'all' && activity.skillId !== filters.value.skillId) {
        return false
      }
      
      return true
    })
  })

  return {
    allActivities,
    filteredActivities,
    activityCounts
  }
}