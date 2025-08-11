<template>
  <div v-if="show" style="position: fixed; top: 0; left: 0; z-index: 9999; background: rgba(0,0,0,0.5); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
    <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%;">
      <h4>{{ modalTitle }}</h4>
      <div class="status-transition-content">
        <div class="current-skill-info mb-3">
          <h6 class="text-muted mb-1">Skill</h6>
          <strong>{{ skill?.name }}</strong>
          <span class="badge bg-secondary ms-2">Level {{ skill?.level }}</span>
        </div>

        <div class="transition-info mb-4">
          <div class="status-transition-visual d-flex align-items-center justify-content-center mb-3">
            <span class="badge" :class="getCurrentStatusClass(skill?.status)">
              {{ getStatusDisplayName(skill?.status) }}
            </span>
            <i class="fas fa-arrow-right mx-3 text-muted"></i>
            <span class="badge" :class="getNewStatusClass(suggestedStatus)">
              {{ getStatusDisplayName(suggestedStatus) }}
            </span>
          </div>
          
          <div class="reason-text">
            <p class="mb-0">{{ reason }}</p>
          </div>
        </div>

        <div class="status-explanation">
          <div v-if="suggestedStatus === 'maintenance'" class="alert alert-info mb-0">
            <h6 class="alert-heading mb-2">
              <i class="fas fa-info-circle me-2"></i>
              Was bedeutet Maintenance?
            </h6>
            <ul class="mb-0 small">
              <li>Längere Intervalle zwischen Übungen (Spaced Repetition)</li>
              <li>Fokus auf Beibehaltung der Fähigkeiten</li>
              <li>Level-ups müssen manuell gemacht werden</li>
              <li>Optimal für bereits gut beherrschte Skills</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" @click="handleCancel">
            Nein, bei {{ getStatusDisplayName(skill?.status) }} bleiben
          </button>
          <button class="btn btn-primary" @click="handleConfirm">
            Ja, zu {{ getStatusDisplayName(suggestedStatus) }} wechseln
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import type { SkillStatus } from '@/utils/constants'

interface Props {
  show: boolean
  skill: SkillData | null
  suggestedStatus: SkillStatus | undefined
  reason: string
}

interface Emits {
  (e: 'confirm', skillId: string, newStatus: SkillStatus): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalTitle = computed(() => {
  if (props.suggestedStatus === 'maintenance') {
    return 'Zu Maintenance wechseln?'
  }
  return 'Status wechseln?'
})

function getCurrentStatusClass(status: SkillStatus | undefined): string {
  switch (status) {
    case 'backlog': return 'bg-secondary'
    case 'acquisition': return 'bg-warning text-dark'
    case 'maintenance': return 'bg-success'
    case 'focus': return 'bg-primary'
    case 'archived': return 'bg-dark'
    default: return 'bg-secondary'
  }
}

function getNewStatusClass(status: SkillStatus | undefined): string {
  return getCurrentStatusClass(status)
}

function getStatusDisplayName(status: SkillStatus | undefined): string {
  switch (status) {
    case 'backlog': return 'Backlog'
    case 'acquisition': return 'Acquisition'
    case 'maintenance': return 'Maintenance'
    case 'focus': return 'Focus'
    case 'archived': return 'Archived'
    default: return 'Unknown'
  }
}

function handleConfirm(): void {
  if (props.skill?.id && props.suggestedStatus) {
    emit('confirm', props.skill.id, props.suggestedStatus)
  }
}

function handleCancel(): void {
  emit('cancel')
}
</script>

<style scoped>
.status-transition-content {
  text-align: center;
}

.current-skill-info {
  padding: 1rem;
  background-color: var(--bs-light);
  border-radius: 0.375rem;
}

.status-transition-visual {
  font-size: 1.1rem;
}

.status-transition-visual .fas {
  font-size: 1.5rem;
}

.reason-text {
  font-size: 1.05rem;
  color: var(--bs-dark);
}

.alert {
  text-align: left;
}

.alert ul {
  padding-left: 1.2rem;
}
</style>