<template>
  <div class="skill-timeline-content" :class="{ 'timeline-modal-view': isModalView }">
    <!-- Timeline Filters -->
    <TimelineFilters
      :filters="filters"
      :event-counts="eventCounts"
      :is-modal-view="isModalView"
      @update:filters="updateFilters"
    />

    <!-- Timeline Content -->
    <div class="timeline-content">
      <div v-if="filteredEntries.length === 0" class="text-center text-muted py-4">
        <i class="bi bi-clock-history"></i>
        <p class="mb-0 mt-2">No activities to show</p>
      </div>
      
      <!-- Compact Timeline for Sidebar -->
      <div v-else-if="!isModalView" class="timeline-compact">
        <TimelineEventCard
          v-for="entry in filteredEntries" 
          :key="entry.id"
          :event="entry"
          :is-modal-view="false"
          :is-transferred="getTransferredToNotes(entry)"
          :format-event-date="formatEventDate"
          :format-event-date-time="formatEventDateTime"
          :get-event-type-info="(type) => getEventTypeInfo(type as TimelineEvent['type'])"
          @edit-levelup="editLevelUpComment"
          @edit-practice="editPracticeNote"
          @edit-quicknote="editQuickNote"
          @delete-quicknote="deleteQuickNote"
          @add-to-notes="addToNotes"
          @toggle-transferred="toggleTransferredToNotes"
        />
      </div>
      
      <!-- Full Timeline for Modal -->
      <div v-else class="timeline">
        <TimelineEventCard
          v-for="event in filteredEntries" 
          :key="event.id"
          :event="event"
          :is-modal-view="true"
          :is-transferred="getTransferredToNotes(event)"
          :format-event-date="formatEventDate"
          :format-event-date-time="formatEventDateTime"
          :get-event-type-info="(type) => getEventTypeInfo(type as TimelineEvent['type'])"
          @edit-levelup="editLevelUpComment"
          @edit-practice="editPracticeNote"
          @edit-quicknote="editQuickNote"
          @delete-quicknote="deleteQuickNote"
          @toggle-transferred="toggleTransferredToNotes"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession, QuickNote } from '@/types/skill'
import { useSkillTimeline, type TimelineEvent } from '@/composables/useSkillTimeline'
import TimelineFilters from './TimelineFilters.vue'
import TimelineEventCard from './TimelineEventCard.vue'

interface TimelineFilters {
  showLevelUps: boolean
  showPractices: boolean
  showQuickNotes: boolean
}

interface Props {
  skill: SkillData
  isModalView?: boolean
}

interface Emits {
  (e: 'add-to-notes', content: string): void
  (e: 'edit-levelup-comment', skillId: string, levelUpData: ProgressionEntry): void
  (e: 'edit-practice-note', skillId: string, practiceData: PracticeSession): void
  (e: 'edit-quick-note', skillId: string, noteDate: string, currentNote: string): void
  (e: 'delete-quick-note', skillId: string, noteDate: string): void
  (e: 'toggle-transferred-to-notes', skillId: string, entryType: 'levelup' | 'practice' | 'quicknote', entryDate: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filters = ref<TimelineFilters>({
  showLevelUps: true,
  showPractices: true,
  showQuickNotes: props.isModalView ? true : true
})

// Use unified timeline logic
const skillRef = computed(() => props.skill)
const { timelineEvents, getFilteredEvents, eventCounts, formatEventDate, formatEventDateTime, getEventTypeInfo } = useSkillTimeline(skillRef)


// Filter entries based on toggles and view mode
const filteredEntries = computed(() => {
  const limit = props.isModalView ? 50 : undefined
  return getFilteredEvents(timelineEvents.value, filters.value, limit)
})

// Update filters from child component
const updateFilters = (newFilters: TimelineFilters) => {
  filters.value = newFilters
}

// Add entry content to notes
const addToNotes = (entry: { title: string; date: string; description: string }) => {
  const content = `**${entry.title}** (${formatEventDate(entry.date)})\n${entry.description}\n\n`
  emit('add-to-notes', content)
}

// Edit functions for modal view
const editLevelUpComment = (levelUpData: ProgressionEntry) => {
  emit('edit-levelup-comment', props.skill.id, levelUpData)
}

const editPracticeNote = (practiceData: PracticeSession) => {
  emit('edit-practice-note', props.skill.id, practiceData)
}

// Edit and delete functions for quick notes
const editQuickNote = (quickNote: QuickNote) => {
  emit('edit-quick-note', props.skill.id, quickNote.date, quickNote.note)
}

const deleteQuickNote = (quickNote: QuickNote) => {
  emit('delete-quick-note', props.skill.id, quickNote.date)
}

// Toggle transferred to notes checkbox
const toggleTransferredToNotes = (event: TimelineEvent) => {
  const entryType = event.type as 'levelup' | 'practice' | 'quicknote'
  const entryDate = event.date
  emit('toggle-transferred-to-notes', props.skill.id, entryType, entryDate)
}

// Create a computed map for transferred states for better reactivity
const transferredStates = computed(() => {
  const skill = props.skill
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
</script>

<style scoped>
.skill-timeline-content {
  height: 100%;
}

.timeline-compact {
  position: relative;
}

.timeline-compact::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

/* Modal timeline styles */
.timeline-modal-view .timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-modal-view .timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}
</style>