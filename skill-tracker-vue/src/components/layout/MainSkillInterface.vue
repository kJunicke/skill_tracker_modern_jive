<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <!-- Action buttons -->
      <AppActionBar
        @show-training-log="$emit('show-training-log')"
        @export-data="$emit('export-data')"
        @import-data="$emit('import-data')"
        @delete-all-skills="$emit('delete-all-skills')"
        @reset-test-environment="$emit('reset-test-environment')"
        @add-skill="$emit('add-skill')"
      />

      <!-- Filter controls -->
      <SkillFilters 
        :filters="filters" 
        :sorting="sorting"
        @filter-change="$emit('filter-change', $event)"
        @sort-change="$emit('sort-change', $event)"
        @sort-direction-toggle="$emit('sort-direction-toggle')"
      />

      <!-- Skills grid -->
      <SkillsGrid 
        :skills="filteredSkills"
        :total-skills="totalSkills"
        @practice-rating="$emit('practice-rating', $event)"
        @level-change="$emit('level-change', $event)"
        @progression-timeline="$emit('progression-timeline', $event)"
        @edit-skill="$emit('edit-skill', $event)"
        @delete-skill="$emit('delete-skill', $event)"
        @status-edit="$emit('status-edit', $event)"
        @tags-edit="$emit('tags-edit', $event)"
        @notes-edit="$emit('notes-edit', $event)"
        @move-to-acquisition="$emit('move-to-acquisition', $event)"
        @quick-note="(skillId: string, note: string) => $emit('quick-note', { skillId, note })"
        @add-skill="$emit('add-skill')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillData } from '@/types/skill'
import type { SkillTag, SkillStatus } from '@/utils/constants'

type FilterOptions = {
  status: SkillStatus | 'all'
  tag: SkillTag | 'all'
  search: string
}

type SortingOptions = {
  field: 'reviewDate' | 'name' | 'level'
  direction: 'asc' | 'desc'
}
import AppActionBar from './AppActionBar.vue'
import SkillFilters from '@/components/skills/SkillFilters.vue'
import SkillsGrid from '@/components/skills/SkillsGrid.vue'

interface Props {
  filteredSkills: SkillData[]
  totalSkills: number
  filters: FilterOptions
  sorting: SortingOptions
}

interface Emits {
  (e: 'show-training-log'): void
  (e: 'export-data'): void
  (e: 'import-data'): void
  (e: 'delete-all-skills'): void
  (e: 'reset-test-environment'): void
  (e: 'add-skill'): void
  (e: 'filter-change', value: {key: string, value: string}): void
  (e: 'sort-change', value: string): void
  (e: 'sort-direction-toggle'): void
  (e: 'practice-rating', value: string): void
  (e: 'level-change', value: {skillId: string, newLevel: number}): void
  (e: 'progression-timeline', value: string): void
  (e: 'edit-skill', value: string): void
  (e: 'delete-skill', value: string): void
  (e: 'status-edit', value: string): void
  (e: 'tags-edit', value: string): void
  (e: 'notes-edit', value: string): void
  (e: 'move-to-acquisition', value: string): void
  (e: 'quick-note', value: {skillId: string, note: string}): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* Card hover effects */
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style>