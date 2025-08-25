<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="modal-content"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
      >
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" :id="titleId">
            {{ isEditing ? 'Edit Skill' : 'Add New Skill' }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
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

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" @click="saveSkill">
            {{ isEditing ? 'Update Skill' : 'Add Skill' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { SkillData } from '@/types/skill'
import { SKILL_TAGS, STATUS_CONFIG, type SkillTag, type SkillStatus } from '@/utils/constants'
import { useToasts } from '@/composables/useToasts'

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

const { showError, showWarning } = useToasts()
const availableTags = SKILL_TAGS
const titleId = computed(() => 'skillModal-title')

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
  // Validation
  if (!formData.value.name.trim()) {
    showError('Skill Name Required', 'Please enter a skill name before saving.')
    return
  }

  if (formData.value.name.trim().length < 2) {
    showError('Invalid Skill Name', 'Skill name must be at least 2 characters long.')
    return
  }

  if (formData.value.level < 0) {
    showError('Invalid Level', 'Skill level cannot be negative.')
    return
  }

  // Status transition warnings for existing skills
  if (isEditing.value && props.skill) {
    const currentStatus = props.skill.status
    const newStatus = formData.value.status
    
    if (currentStatus === 'focus' && newStatus !== 'focus') {
      showWarning('Focus Mode Exit', 'Changing from Focus status will reset focus progress.')
    }
    
    if ((currentStatus === 'maintenance' || currentStatus === 'focus') && 
        (newStatus === 'acquisition' || newStatus === 'backlog')) {
      showWarning('Status Downgrade', 'This change may reset spaced repetition progress.')
    }
  }

  emit('save', {
    ...formData.value,
    id: props.skill?.id
  })
  
  resetForm()
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1055;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: none;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  opacity: 0.8;
  cursor: pointer;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>