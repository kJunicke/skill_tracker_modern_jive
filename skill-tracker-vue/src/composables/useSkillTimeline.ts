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
  markedNotesFilter: 'all' | 'marked' | 'unmarked'
}

export interface TimelineGroup {
  date: string
  displayDate: string
  events: TimelineEvent[]
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
      // First apply main category filters
      if (event.type === 'levelup' && !filters.showLevelUps) return false
      if (event.type === 'practice' && !filters.showPractices) return false
      if (event.type === 'quicknote' && !filters.showQuickNotes) return false
      
      // Then apply marked notes overlay filter to all types
      let isMarked = false
      
      if (event.type === 'levelup') {
        const levelUp = event.data as ProgressionEntry
        isMarked = Boolean(levelUp.transferredToNotes)
      } else if (event.type === 'practice') {
        const practice = event.data as PracticeSession
        isMarked = Boolean(practice.transferredToNotes)
      } else if (event.type === 'quicknote') {
        const quickNote = event.data as QuickNote
        isMarked = Boolean(quickNote.transferredToNotes)
      }
      
      // Apply marked filter to all entry types
      if (filters.markedNotesFilter === 'marked' && !isMarked) return false
      if (filters.markedNotesFilter === 'unmarked' && isMarked) return false
      
      return true
    })

    return limit ? filtered.slice(0, limit) : filtered
  }

  const groupEventsByDate = (events: TimelineEvent[]): TimelineGroup[] => {
    const groups = new Map<string, TimelineEvent[]>()
    
    // Group events by date (YYYY-MM-DD format)
    events.forEach(event => {
      const date = new Date(event.date)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(event)
    })
    
    // Convert to array and sort by date (newest first)
    const groupArray: TimelineGroup[] = Array.from(groups.entries()).map(([dateKey, events]) => {
      return {
        date: dateKey,
        displayDate: formatGroupDate(dateKey),
        events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
    })
    
    return groupArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const formatGroupDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getEventCounts = computed(() => {
    if (!skill.value) return { levelUps: 0, practices: 0, quickNotes: 0, markedNotes: 0, unmarkedNotes: 0, total: 0 }
    
    // Count marked entries across all types
    const markedLevelUps = skill.value.progressionHistory?.filter(entry => entry.transferredToNotes).length || 0
    const markedPractices = skill.value.practiceLog?.filter(entry => entry.transferredToNotes).length || 0
    const markedQuickNotes = skill.value.quickNotes?.filter(note => note.transferredToNotes).length || 0
    const totalMarkedEntries = markedLevelUps + markedPractices + markedQuickNotes
    
    // Count totals
    const totalLevelUps = skill.value.progressionHistory?.length || 0
    const totalPractices = skill.value.practiceLog?.length || 0
    const totalQuickNotes = skill.value.quickNotes?.length || 0
    const totalEntries = totalLevelUps + totalPractices + totalQuickNotes
    const totalUnmarkedEntries = totalEntries - totalMarkedEntries
    
    return {
      levelUps: totalLevelUps,
      practices: totalPractices,
      quickNotes: totalQuickNotes,
      markedNotes: totalMarkedEntries,
      unmarkedNotes: totalUnmarkedEntries,
      total: totalEntries
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
        color: 'primary',
        bgColor: 'bg-primary',
        borderColor: 'border-primary'
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
    groupEventsByDate,
    eventCounts: getEventCounts,
    formatEventDate,
    formatEventDateTime,
    getEventTypeInfo
  }
}