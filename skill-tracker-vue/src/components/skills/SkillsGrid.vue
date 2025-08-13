<template>
  <div>
    <!-- Skills grid -->
    <div class="row g-2">
      <div 
        v-for="skill in skills" 
        :key="skill.id"
        class="col-12 col-sm-6 col-md-4 col-lg-4 col-xl-3"
      >
        <SkillCard 
          :skill="skill"
          @practice-rating="(skillId: string) => $emit('practice-rating', skillId)"
          @level-change="(skillId: string, newLevel: number) => $emit('level-change', skillId, newLevel)"
          @progression-timeline="(skillId: string) => $emit('progression-timeline', skillId)"
          @edit-skill="(skillId: string) => $emit('edit-skill', skillId)"
          @delete-skill="(skillId: string) => $emit('delete-skill', skillId)"
          @status-edit="(skillId: string) => $emit('status-edit', skillId)"
          @tags-edit="(skillId: string) => $emit('tags-edit', skillId)"
          @notes-edit="(skillId: string) => $emit('notes-edit', skillId)"
          @level-up="(skillId: string) => $emit('level-up', skillId)"
          @move-to-acquisition="(skillId: string) => $emit('move-to-acquisition', skillId)"
          @quick-note="(skillId: string, note: string) => $emit('quick-note', skillId, note)"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="skills.length === 0" class="text-center py-5">
      <i class="bi bi-music-note-beamed text-muted" style="font-size: 4rem;"></i>
      <h4 class="text-muted mt-3">No skills found</h4>
      <p class="text-muted">
        <span v-if="totalSkills === 0">
          Start your dance journey by adding your first skill!
        </span>
        <span v-else>
          Try adjusting your filters or search terms.
        </span>
      </p>
      <button 
        v-if="totalSkills === 0"
        class="btn btn-primary"
        @click="$emit('add-skill')"
      >
        <i class="bi bi-plus-circle me-2"></i>Add Your First Skill
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillData } from '@/types/skill'
import SkillCard from './SkillCard.vue'

interface Props {
  skills: SkillData[]
  totalSkills: number
}

defineProps<Props>()

defineEmits<{
  'practice-rating': [skillId: string]
  'level-change': [skillId: string, newLevel: number]
  'progression-timeline': [skillId: string]
  'edit-skill': [skillId: string]
  'delete-skill': [skillId: string]
  'status-edit': [skillId: string]
  'tags-edit': [skillId: string]
  'notes-edit': [skillId: string]
  'level-up': [skillId: string]
  'move-to-acquisition': [skillId: string]
  'quick-note': [skillId: string, note: string]
  'add-skill': []
}>()
</script>