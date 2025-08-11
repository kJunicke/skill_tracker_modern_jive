<template>
  <div class="modal fade" id="skillModal" tabindex="-1" aria-labelledby="skillModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="skillModalLabel">
            {{ isEditing ? 'Edit Skill' : 'Add New Skill' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSkill">
            <!-- Skill Name -->
            <div class="mb-3">
              <label for="skillName" class="form-label">Skill Name *</label>
              <input
                id="skillName"
                v-model="formData.name"
                type="text"
                class="form-control"
                placeholder="Enter skill name..."
                required
              >
            </div>

            <!-- Status -->
            <div class="mb-3">
              <label for="skillStatus" class="form-label">Status *</label>
              <select
                id="skillStatus"
                v-model="formData.status"
                class="form-select"
                required
              >
                <option 
                  v-for="(config, statusKey) in STATUS_CONFIG" 
                  :key="statusKey" 
                  :value="statusKey"
                >
                  {{ config.label }} ({{ config.description }})
                </option>
              </select>
            </div>

            <!-- Tags -->
            <div class="mb-3">
              <label class="form-label">Tags</label>
              <div class="d-flex flex-wrap gap-2">
                <div
                  v-for="tag in availableTags"
                  :key="tag"
                  class="form-check"
                >
                  <input
                    :id="`tag_${tag}`"
                    v-model="formData.tags"
                    :value="tag"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label :for="`tag_${tag}`" class="form-check-label">
                    {{ tag }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Level -->
            <div class="mb-3">
              <label for="skillLevel" class="form-label">Level (0-10+)</label>
              <input
                id="skillLevel"
                v-model.number="formData.level"
                type="number"
                class="form-control"
                min="0"
                max="50"
              >
            </div>

            <!-- Notes -->
            <div class="mb-3">
              <label for="skillNotes" class="form-label">Notes</label>
              <textarea
                id="skillNotes"
                v-model="formData.notes"
                class="form-control"
                rows="3"
                placeholder="Add notes about this skill... (Markdown supported)"
              ></textarea>
              <small class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Use markdown formatting. Click the notes section on skill cards for full editor.
              </small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="saveSkill">
            {{ isEditing ? 'Update Skill' : 'Add Skill' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SkillData } from '@/types/skill'
import { SKILL_TAGS, STATUS_CONFIG, type SkillTag, type SkillStatus } from '@/utils/constants'

interface Props {
  skill?: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'save', skillData: Partial<SkillData>): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const availableTags = SKILL_TAGS

const formData = ref({
  name: '',
  status: 'acquisition' as SkillStatus,
  tags: [] as SkillTag[],
  level: 0,
  notes: ''
})

const isEditing = ref(false)

// Watch for skill changes to populate form
watch(() => props.skill, (newSkill) => {
  if (newSkill) {
    isEditing.value = true
    formData.value = {
      name: newSkill.name,
      status: newSkill.status,
      tags: [...newSkill.tags],
      level: newSkill.level,
      notes: newSkill.notes
    }
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    name: '',
    status: 'acquisition',
    tags: [],
    level: 0,
    notes: ''
  }
}

function saveSkill() {
  if (!formData.value.name.trim()) {
    alert('Please enter a skill name')
    return
  }

  emit('save', {
    ...formData.value,
    id: props.skill?.id
  })
  
  resetForm()
  emit('close')
}
</script>