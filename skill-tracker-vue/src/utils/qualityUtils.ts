export const QUALITY_COLORS = ['danger', 'warning', 'success', 'primary']
export const QUALITY_LABELS = ['Completely Forgotten', 'Hard', 'Good', 'Very Easy']
export const QUALITY_ICONS = ['bi-x-circle', 'bi-exclamation-triangle', 'bi-check-circle', 'bi-star-fill']

export function getQualityColor(quality: number): string {
  return QUALITY_COLORS[quality] || 'secondary'
}

export function getQualityLabel(quality: number): string {
  return QUALITY_LABELS[quality] || 'Unknown'
}

export function getQualityIcon(quality: number): string {
  return QUALITY_ICONS[quality] || 'bi-question-circle'
}

export function getQualityXP(quality: number): number {
  const xpValues = [0, 1, 2, 3]
  return xpValues[quality] || 0
}

export const QUALITY_OPTIONS = QUALITY_LABELS.map((label, index) => ({
  value: index,
  label,
  color: QUALITY_COLORS[index],
  icon: QUALITY_ICONS[index],
  xp: getQualityXP(index)
}))

export function calculateSessionStats(sessions: Array<{ quality: number }>) {
  if (sessions.length === 0) {
    return {
      total: 0,
      averageQuality: 0,
      distribution: [0, 0, 0, 0]
    }
  }

  const distribution = [0, 0, 0, 0]
  let totalQuality = 0

  sessions.forEach(session => {
    if (session.quality >= 0 && session.quality <= 3) {
      distribution[session.quality]++
      totalQuality += session.quality
    }
  })

  return {
    total: sessions.length,
    averageQuality: totalQuality / sessions.length,
    distribution
  }
}