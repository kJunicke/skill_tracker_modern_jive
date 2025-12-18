export const dateUtils = {
  now: (): string => new Date().toISOString(),
  
  addDays: (date: string, days: number): string => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result.toISOString()
  },

  formatRelative: (date: string): string => {
    const now = new Date()
    const target = new Date(date)
    const diffMs = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  },

  formatDate: (date: string): string => {
    return new Date(date).toLocaleDateString()
  },

  formatDateTime: (date: string): string => {
    return new Date(date).toLocaleString()
  },

  isToday: (date: string): boolean => {
    const today = new Date()
    const target = new Date(date)
    return today.toDateString() === target.toDateString()
  },

  daysBetween: (date1: string, date2: string): number => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = d2.getTime() - d1.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  formatDaysAsWeeksAndDays: (days: number): string => {
    if (days < 7) {
      return days === 1 ? '1 day' : `${days} days`
    }
    
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7
    
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`
    }
    
    const weekText = weeks === 1 ? '1 week' : `${weeks} weeks`
    const dayText = remainingDays === 1 ? '1 day' : `${remainingDays} days`
    
    return `${weekText} and ${dayText}`
  }
}