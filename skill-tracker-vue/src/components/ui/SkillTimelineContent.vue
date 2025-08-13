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
      <TimelineGroupedView
        :skill="skill"
        :filters="filters"
        :is-modal-view="isModalView"
        @edit-levelup="editLevelUpComment"
        @edit-practice="editPracticeNote"
        @edit-quicknote="editQuickNote"
        @delete-quicknote="deleteQuickNote"
        @add-to-notes="addToNotes"
        @toggle-transferred="toggleTransferredToNotes"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SkillData, ProgressionEntry, PracticeSession, QuickNote } from '@/types/skill'
import { useSkillTimeline, type TimelineEvent } from '@/composables/useSkillTimeline'
import { useSkillStore } from '@/stores/skillStore'
import TimelineFilters from './TimelineFilters.vue'
import TimelineGroupedView from './TimelineGroupedView.vue'

interface TimelineFilters {
  showLevelUps: boolean
  showPractices: boolean
  showQuickNotes: boolean
  markedNotesFilter: 'all' | 'marked' | 'unmarked'
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

const skillStore = useSkillStore()

// Get the current skill from store instead of using the prop copy
// Never use the static prop as fallback to prevent stale data issues
const currentSkill = computed(() => {
  if (!props.skill?.id) return null
  return skillStore.skills.find(s => s.id === props.skill!.id) || null
})

const filters = ref<TimelineFilters>({
  showLevelUps: true,
  showPractices: true,
  showQuickNotes: props.isModalView ? true : true,
  markedNotesFilter: 'all'
})

// Use unified timeline logic for event counts only
const { eventCounts } = useSkillTimeline(currentSkill)

// Update filters from child component
const updateFilters = (newFilters: TimelineFilters) => {
  filters.value = newFilters
}

// Add entry content to notes
const addToNotes = (content: string) => {
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
</script>

<style scoped>
.skill-timeline-content {
  height: 100%;
}
</style>