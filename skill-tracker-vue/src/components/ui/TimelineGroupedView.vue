<template>
  <div class="timeline-grouped-view">
    <!-- Error state when skill cannot be found in store -->
    <div v-if="!currentSkill" class="text-center text-muted py-4">
      <i class="bi bi-exclamation-triangle"></i>
      <p class="mb-0 mt-2">Unable to load skill data</p>
    </div>
    
    <div v-else-if="groupedEvents.length === 0" class="text-center text-muted py-4">
      <i class="bi bi-clock-history"></i>
      <p class="mb-0 mt-2">No activities to show</p>
    </div>
    
    <!-- Grouped Timeline -->
    <div v-else class="timeline-groups">
      <div 
        v-for="group in groupedEvents" 
        :key="group.date"
        class="timeline-group mb-4"
      >
        <!-- Date Header -->
        <div class="date-header mb-3">
          <h6 class="mb-0 date-title">{{ group.displayDate }}</h6>
          <small class="activity-count">{{ group.events.length }} {{ group.events.length === 1 ? 'activity' : 'activities' }}</small>
        </div>
        
        <!-- Events for this date -->
        <div class="timeline-events">
          <!-- Unified Timeline for both Sidebar and Modal -->
          <div class="timeline">
            <TimelineEventCard
              v-for="event in group.events" 
              :key="event.id"
              :event="event"
              :is-modal-view="true"
              :is-transferred="getTransferredToNotes(event)"
              :format-event-date="() => formatEventTime(event.date)"
              :format-event-date-time="formatEventDateTime"
              :get-event-type-info="(type) => getEventTypeInfo(type as TimelineEvent['type'])"
              @edit-practice="(data) => $emit('edit-practice', data)"
              @edit-quicknote="(data) => $emit('edit-quicknote', data)"
              @delete-quicknote="(data) => $emit('delete-quicknote', data)"
              @add-to-notes="addToNotes"
              @toggle-transferred="(event) => $emit('toggle-transferred', event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession, QuickNote } from '@/types/skill'
import { useSkillTimeline, type TimelineEvent, type TimelineFilters } from '@/composables/useSkillTimeline'
import { useSkillStore } from '@/stores/skillStore'
import TimelineEventCard from './TimelineEventCard.vue'

interface Props {
  skill: SkillData
  filters: TimelineFilters
  isModalView?: boolean
}

interface Emits {
  (e: 'edit-levelup', data: ProgressionEntry): void
  (e: 'edit-practice', data: PracticeSession): void
  (e: 'edit-quicknote', data: QuickNote): void
  (e: 'delete-quicknote', data: QuickNote): void
  (e: 'add-to-notes', content: string): void
  (e: 'toggle-transferred', event: TimelineEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const skillStore = useSkillStore()

// Get the current skill from store instead of using the prop copy
const currentSkill = computed(() => {
  if (!props.skill?.id) return null
  return skillStore.skills.find(s => s.id === props.skill!.id) || null
})

// Use unified timeline logic with reactive skill data
const { timelineEvents, getFilteredEvents, groupEventsByDate, formatEventDateTime, getEventTypeInfo } = useSkillTimeline(currentSkill)

// Filter and group events
const filteredEvents = computed(() => {
  const limit = props.isModalView ? 50 : undefined
  return getFilteredEvents(timelineEvents.value, props.filters, limit)
})

const groupedEvents = computed(() => {
  return groupEventsByDate(filteredEvents.value)
})

// Format time only (since date is shown in header)
const formatEventTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Create a computed map for transferred states for better reactivity
const transferredStates = computed(() => {
  const skill = currentSkill.value
  if (!skill) return new Map<string, boolean>()
  
  const states = new Map<string, boolean>()
  
  // Add levelup states
  skill.progressionHistory?.forEach(entry => {
    const key = `levelup-${entry.date}`
    states.set(key, Boolean(entry.transferredToNotes))
  })
  
  // Add practice states  
  skill.practiceLog?.forEach(entry => {
    const key = `practice-${entry.date}`
    states.set(key, Boolean(entry.transferredToNotes))
  })
  
  // Add quicknote states
  skill.quickNotes?.forEach(entry => {
    const key = `quicknote-${entry.date}`
    states.set(key, Boolean(entry.transferredToNotes))
  })
  
  return states
})

// Helper function to get transferred status using computed map
const getTransferredToNotes = (event: TimelineEvent): boolean => {
  const key = `${event.type}-${event.date}`
  const result = transferredStates.value.get(key) || false
  return result
}

// Add entry content to notes
const addToNotes = (entry: { title: string; date: string; description: string }) => {
  const content = `**${entry.title}** (${formatEventTime(entry.date)})\n${entry.description}\n\n`
  emit('add-to-notes', content)
}
</script>

<style scoped>
.timeline-grouped-view {
  height: 100%;
}

.timeline-group {
  position: relative;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 2px solid #dee2e6;
}

.date-title {
  color: #212529;
  font-weight: bold;
}

.activity-count {
  color: #6c757d;
}

.timeline-events {
  position: relative;
}

/* Unified timeline styles */
.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}
</style>