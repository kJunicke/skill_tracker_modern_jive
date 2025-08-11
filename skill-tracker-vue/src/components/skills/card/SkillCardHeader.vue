<template>
  <div class="d-flex justify-content-between align-items-start mb-2">
    <h6 class="card-title mb-0">{{ skill.name }}</h6>
    
    <div class="d-flex flex-column align-items-end gap-1">
      <!-- Dropdown menu -->
      <div class="dropdown">
        <button 
          class="btn btn-outline-secondary btn-sm" 
          type="button" 
          @click="toggleDropdown"
          :aria-expanded="dropdownOpen"
        >
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <ul :class="['dropdown-menu', 'dropdown-menu-end', { 'show': dropdownOpen }]">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleEdit">
              <i class="bi bi-pencil me-2"></i>Edit
            </a>
          </li>
          <li>
            <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete">
              <i class="bi bi-trash me-2"></i>Delete
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Timeline button -->
      <button 
        class="btn btn-outline-info btn-sm timeline-btn" 
        type="button" 
        @click="handleShowTimeline"
        title="View Timeline"
      >
        <i class="bi bi-hourglass-split"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillData } from '@/types/skill'
import { useSkillCardDropdown } from '@/composables/useSkillCardDropdown'

interface Props {
  skill: SkillData
}

interface Emits {
  (e: 'edit-skill', skillId: string): void
  (e: 'delete-skill', skillId: string): void
  (e: 'progression-timeline', skillId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use the dropdown composable
const { dropdownOpen, toggleDropdown } = useSkillCardDropdown()

const handleEdit = () => {
  emit('edit-skill', props.skill.id)
}

const handleDelete = () => {
  emit('delete-skill', props.skill.id)
}

const handleShowTimeline = () => {
  emit('progression-timeline', props.skill.id)
}
</script>

<style scoped>
.timeline-btn {
  transition: all 0.2s ease-in-out;
}

.timeline-btn:hover {
  transform: translateY(-1px);
}

.dropdown-menu {
  z-index: 1000;
}
</style>