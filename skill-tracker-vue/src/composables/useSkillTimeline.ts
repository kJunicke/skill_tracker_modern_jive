import { computed, type Ref } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession, QuickNote } from '@/types/skill'

export interface TimelineEvent {
  id: string
  type: 'levelup' | 'practice' | 'quicknote'
  date: string
  title: string
  description: string
  data: ProgressionEntry | PracticeSession | QuickNote
}

export interface TimelineFilters {
  showLevelUps: boolean
  showPractices: boolean
  showQuickNotes: boolean
}

export function useSkillTimeline(skill: Ref<SkillData | null>) {
  
  const createTimelineEvents = computed((): TimelineEvent[] => {
    if (!skill.value) return []
    
    const events: TimelineEvent[] = []
    
    // Add level-up events from progression history
    skill.value.progressionHistory?.forEach((progression) => {
      events.push({
        id: `levelup-${progression.level}-${progression.date}`,
        type: 'levelup',
        date: progression.date,
        title: `Level ${progression.level}`,
        description: progression.comment || `Reached level ${progression.level}`,
        data: { ...progression } // Spread to create fresh object reference
      })
    })

    // Add practice sessions
    skill.value.practiceLog?.forEach((session, index) => {
      const qualityLabels = {
        0: 'Completely Forgotten',
        1: 'Hard',
        2: 'Good', 
        3: 'Very Easy'
      }
      
      events.push({
        id: `practice-${index}-${session.date}`,
        type: 'practice',
        date: session.date,
        title: 'Practice Session',
        description: `Quality: ${qualityLabels[session.quality as keyof typeof qualityLabels] || 'Unknown'}${session.note ? ` - ${session.note}` : ''}`,
        data: { ...session } // Spread to create fresh object reference
      })
    })

    // Add quick notes
    skill.value.quickNotes?.forEach((note) => {
      events.push({
        id: `quicknote-${note.date}`,
        type: 'quicknote',
        date: note.date,
        title: 'Quick Note',
        description: note.note,
        data: { ...note } // Spread to create fresh object reference
      })
    })

    // Sort by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const getFilteredEvents = (events: TimelineEvent[], filters: TimelineFilters, limit?: number): TimelineEvent[] => {
    const filtered = events.filter(event => {
      if (event.type === 'levelup' && !filters.showLevelUps) return false
      if (event.type === 'practice' && !filters.showPractices) return false
      if (event.type === 'quicknote' && !filters.showQuickNotes) return false
      return true
    })

    return limit ? filtered.slice(0, limit) : filtered
  }

  const getEventCounts = computed(() => {
    if (!skill.value) return { levelUps: 0, practices: 0, quickNotes: 0, total: 0 }
    
    return {
      levelUps: skill.value.progressionHistory?.length || 0,
      practices: skill.value.practiceLog?.length || 0,
      quickNotes: skill.value.quickNotes?.length || 0,
      total: (skill.value.progressionHistory?.length || 0) + 
             (skill.value.practiceLog?.length || 0) + 
             (skill.value.quickNotes?.length || 0)
    }
  })

  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    
    return date.toLocaleDateString()
  }

  const formatEventDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventTypeInfo = (type: TimelineEvent['type']) => {
    const typeMapping = {
      levelup: {
        icon: 'bi-arrow-up-circle',
        color: 'warning',
        bgColor: 'bg-warning',
        borderColor: 'border-warning'
      },
      practice: {
        icon: 'bi-play-circle',
        color: 'info',
        bgColor: 'bg-info',
        borderColor: 'border-info'
      },
      quicknote: {
        icon: 'bi-chat-left-text',
        color: 'info',
        bgColor: 'bg-info',
        borderColor: 'border-info'
      }
    }
    
    return typeMapping[type] || typeMapping.practice
  }

  return {
    timelineEvents: createTimelineEvents,
    getFilteredEvents,
    eventCounts: getEventCounts,
    formatEventDate,
    formatEventDateTime,
    getEventTypeInfo
  }
}