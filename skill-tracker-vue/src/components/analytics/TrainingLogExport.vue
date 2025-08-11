<template>
  <button type="button" class="btn btn-primary" @click="exportData">
    <i class="bi bi-download me-2"></i>
    Export CSV
  </button>
</template>

<script setup lang="ts">
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

interface Props {
  activities: Activity[]
}

const props = defineProps<Props>()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const exportData = () => {
  const data = props.activities.map(activity => ({
    Date: formatDate(activity.date),
    Type: activity.type,
    Skill: activity.skillName,
    Details: activity.type === 'practice' ? activity.data.qualityText as string : 
             activity.type === 'levelup' ? `Level ${activity.data.newLevel}` :
             activity.type === 'quicknote' ? 'Quick Note' :
             activity.type === 'quicknote' ? 'Quick Note' : '',
    Notes: activity.type === 'quicknote' ? (activity.data as { note: string }).note : activity.description || ''
  }))
  
  const csv = convertToCSV(data)
  downloadCSV(csv, 'training-log.csv')
}

const convertToCSV = (data: Record<string, string>[]): string => {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\\n')
  
  return csvContent
}

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>