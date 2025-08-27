<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="bi bi-clock-history me-2"></i>
        Activity Timeline ({{ activities.length }} activities)
      </h6>
      <div class="btn-group btn-group-sm" role="group">
        <button 
          :class="['btn', viewMode === 'timeline' ? 'btn-primary' : 'btn-outline-primary']"
          @click="$emit('update:viewMode', 'timeline')"
        >
          <i class="bi bi-list-ul me-1"></i>
          Timeline
        </button>
        <button 
          :class="['btn', viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary']"
          @click="$emit('update:viewMode', 'table')"
        >
          <i class="bi bi-table me-1"></i>
          Table
        </button>
      </div>
    </div>
    <div class="card-body" style="max-height: 500px; overflow-y: auto;">
      <!-- Timeline View -->
      <div v-if="viewMode === 'timeline'" class="timeline">
        <div v-if="activities.length === 0" class="text-center py-4">
          <i class="bi bi-info-circle text-muted" style="font-size: 3rem;"></i>
          <h5 class="text-muted mt-3">No Activities Found</h5>
          <p class="text-muted">Try adjusting your filters to see more activities.</p>
        </div>

        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="timeline-item"
        >
          <div :class="[
            'timeline-marker',
            getActivityColor(activity.type)
          ]">
            <i :class="`bi ${getActivityIcon(activity.type)} text-white`"></i>
          </div>
          <div class="timeline-content">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="card-title mb-1">
                      <span :class="[
                        'badge',
                        `bg-${getActivityColorName(activity.type)}`
                      ]">
                        {{ activity.type }}
                      </span>
                      <span class="ms-2">{{ activity.skillName }}</span>
                    </h6>
                    <small class="text-muted">{{ formatDate(activity.date) }}</small>
                  </div>
                  <small class="text-muted">{{ getRelativeTime(activity.date) }}</small>
                </div>
                
                <!-- Activity-specific content -->
                <div v-if="activity.type === 'practice'" class="mb-2">
                  <span :class="[
                    'badge',
                    `bg-${getQualityColorName(activity.data.quality as number)}`
                  ]">
                    {{ activity.data.qualityText }}
                  </span>
                  <small class="text-muted ms-2">
                    +{{ getQualityXP(activity.data.quality as number) }} XP
                  </small>
                </div>
                
                <div v-if="activity.type === 'levelup'" class="mb-2">
                  <span class="badge bg-success">
                    Level {{ activity.data.newLevel }}
                  </span>
                  <small class="text-muted ms-2">
                    from Level {{ activity.data.previousLevel }}
                  </small>
                </div>

                <div v-if="activity.type === 'quicknote'" class="mb-2">
                  <span class="badge bg-primary">
                    <i class="bi bi-sticky me-1"></i>
                    Quick Note
                  </span>
                  <span v-if="activity.data.transferredToNotes" class="badge bg-success ms-2">
                    <i class="bi bi-check-circle me-1"></i>
                    Transferred
                  </span>
                </div>

                <p v-if="activity.type === 'quicknote' ? (activity.data as { note: string }).note : activity.description" class="card-text mb-0">
                  {{ activity.type === 'quicknote' ? (activity.data as { note: string }).note : activity.description }}
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table'">
        <div v-if="activities.length === 0" class="text-center py-4">
          <i class="bi bi-info-circle text-muted" style="font-size: 3rem;"></i>
          <h5 class="text-muted mt-3">No Activities Found</h5>
          <p class="text-muted">Try adjusting your filters to see more activities.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-sm table-hover">
            <thead class="table-dark">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Skill</th>
                <th>Details</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in activities" :key="activity.id">
                <td class="text-nowrap">
                  <small>{{ formatDate(activity.date) }}</small>
                </td>
                <td>
                  <span :class="[
                    'badge',
                    `bg-${getActivityColorName(activity.type)}`
                  ]">
                    {{ activity.type }}
                  </span>
                </td>
                <td>{{ activity.skillName }}</td>
                <td>
                  <span v-if="activity.type === 'practice'" :class="[
                    'badge',
                    `bg-${getQualityColorName(activity.data.quality as number)}`
                  ]">
                    {{ activity.data.qualityText }}
                  </span>
                  <span v-else-if="activity.type === 'levelup'" class="badge bg-success">
                    Lv {{ activity.data.newLevel }}
                  </span>
                  <span v-else-if="activity.type === 'quicknote'" class="badge bg-primary">
                    <i class="bi bi-sticky me-1"></i>Note
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <small class="text-muted">
                    {{ activity.type === 'quicknote' ? (activity.data as { note: string }).note : activity.description || '-' }}
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
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
  viewMode: 'timeline' | 'table'
}

interface Emits {
  (e: 'update:viewMode', mode: 'timeline' | 'table'): void
}

defineProps<Props>()
defineEmits<Emits>()

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

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const getActivityColor = (type: string): string => {
  const colors: Record<string, string> = {
    practice: 'bg-success',
    levelup: 'bg-warning',
    quicknote: 'bg-primary',
  }
  const color = colors[type]
  if (!color) {
    console.warn(`[FALLBACK] TrainingLogTimeline.getActivityBadgeColor: Unknown activity type "${type}", using 'bg-secondary'. Reason: type not in expected values.`)
  }
  return color || 'bg-secondary'
}

const getActivityColorName = (type: string): string => {
  const colors: Record<string, string> = {
    practice: 'success',
    levelup: 'warning',
    quicknote: 'primary',
  }
  const color = colors[type]
  if (!color) {
    console.warn(`[FALLBACK] TrainingLogTimeline.getActivityColorName: Unknown activity type "${type}", using 'secondary'. Reason: type not in expected values.`)
  }
  return color || 'secondary'
}

const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    practice: 'bi-play-circle',
    levelup: 'bi-arrow-up-circle',
    quicknote: 'bi-sticky',
  }
  const icon = icons[type]
  if (!icon) {
    console.warn(`[FALLBACK] TrainingLogTimeline.getActivityIcon: Unknown activity type "${type}", using 'bi-circle'. Reason: type not in expected values.`)
  }
  return icon || 'bi-circle'
}

const getQualityColorName = (quality: number): string => {
  const colors = ['danger', 'warning', 'success', 'primary']
  const color = colors[quality]
  if (!color) {
    console.warn(`[FALLBACK] TrainingLogTimeline.getQualityColorName: Unknown quality "${quality}", using 'secondary'. Reason: quality index not in expected range.`)
  }
  return color || 'secondary'
}

const getQualityXP = (quality: number): number => {
  const xpValues = [0, 1, 2, 3]
  const xp = xpValues[quality]
  if (xp === undefined) {
    console.warn(`[FALLBACK] TrainingLogTimeline.getQualityXP: Unknown quality "${quality}", using 0. Reason: quality index not in expected range.`)
  }
  return xp || 0
}
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-content {
  margin-left: 1rem;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.table-responsive {
  border-radius: 0.375rem;
}
</style>