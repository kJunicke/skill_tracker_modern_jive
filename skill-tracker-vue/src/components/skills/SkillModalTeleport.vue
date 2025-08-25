<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        ref="modalRef"
        class="modal-content modal-lg"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        tabindex="-1"
      >
        <!-- Header -->
        <div class="modal-header modal-header-skill">
          <h5 class="modal-title" :id="titleId">
            <i class="bi bi-plus-circle me-2" v-if="!isEditing"></i>
            <i class="bi bi-pencil me-2" v-else></i>
            {{ isEditing ? 'Edit Skill' : 'Add New Skill' }}
          </h5>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="saveSkill">
            <!-- Skill Name -->
            <div class="mb-3">
              <label for="skillName" class="form-label">
                <i class="bi bi-star me-1"></i>
                Skill Name *
              </label>
              <input
                id="skillName"
                v-model="formData.name"
                type="text"
                :class="[
                  'form-control',
                  validationErrors.name ? 'is-invalid' : formData.name.trim().length >= 2 ? 'is-valid' : ''
                ]"
                placeholder="Enter skill name..."
                required
                maxlength="50"
                @blur="validateName"
              >
              <div class="invalid-feedback" v-if="validationErrors.name">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ validationErrors.name }}
              </div>
              <div class="valid-feedback" v-if="!validationErrors.name && formData.name.trim().length >= 2">
                <i class="bi bi-check-circle me-1"></i>
                Looks good!
              </div>
              <small class="text-muted">
                {{ formData.name.length }}/50 characters
              </small>
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
              <label class="form-label">
                <i class="bi bi-tags me-1"></i>
                Tags ({{ formData.tags.length }} selected)
              </label>
              
              <!-- Selected Tags Display -->
              <div v-if="formData.tags.length > 0" class="mb-2">
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-for="tag in formData.tags"
                    :key="tag"
                    class="badge bg-primary d-flex align-items-center gap-1"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      class="btn-close btn-close-white btn-sm"
                      style="font-size: 0.6em; padding: 0; width: 12px; height: 12px;"
                      @click="removeTag(tag)"
                    ></button>
                  </span>
                </div>
              </div>
              
              <!-- Multi-Select Dropdown -->
              <div class="dropdown">
                <button
                  type="button"
                  class="btn btn-outline-secondary dropdown-toggle w-100 text-start d-flex justify-content-between align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ formData.tags.length > 0 ? `${formData.tags.length} tag(s) selected` : 'Select tags...' }}
                </button>
                <ul class="dropdown-menu w-100 p-2" style="max-height: 200px; overflow-y: auto;">
                  <li v-for="tag in availableTags" :key="tag">
                    <div class="form-check">
                      <input
                        :id="`dropdown_tag_${tag}`"
                        v-model="formData.tags"
                        :value="tag"
                        type="checkbox"
                        class="form-check-input"
                      >
                      <label :for="`dropdown_tag_${tag}`" class="form-check-label w-100">
                        {{ tag }}
                      </label>
                    </div>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <div class="d-flex gap-2">
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-success flex-fill"
                        @click="selectAllTags"
                      >
                        Select All
                      </button>
                      <button 
                        type="button" 
                        class="btn btn-sm btn-outline-secondary flex-fill"
                        @click="clearAllTags"
                      >
                        Clear All
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
              
              <small class="text-muted mt-1">
                <i class="bi bi-info-circle me-1"></i>
                Tags help organize and filter your skills. Select multiple tags that best describe this skill.
              </small>
            </div>

            <!-- Level -->
            <div class="mb-3">
              <label for="skillLevel" class="form-label">
                <i class="bi bi-bar-chart me-1"></i>
                Level (0-50)
              </label>
              <input
                id="skillLevel"
                v-model.number="formData.level"
                type="number"
                :class="[
                  'form-control',
                  validationErrors.level ? 'is-invalid' : formData.level >= 0 && formData.level <= 50 ? 'is-valid' : ''
                ]"
                min="0"
                max="50"
                @blur="validateLevel"
              >
              <div class="invalid-feedback" v-if="validationErrors.level">
                <i class="bi bi-exclamation-circle me-1"></i>
                {{ validationErrors.level }}
              </div>
              <div class="valid-feedback" v-if="!validationErrors.level && formData.level >= 0 && formData.level <= 50">
                <i class="bi bi-check-circle me-1"></i>
                Valid level
              </div>
              <small class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Level represents your current proficiency (0 = Never practiced, 50 = Master level)
              </small>
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
          <button 
            type="button" 
            :class="[
              'btn',
              isFormValid ? 'btn-primary' : 'btn-outline-primary'
            ]"
            :disabled="!isFormValid"
            @click="saveSkill"
          >
            <i :class="isFormValid ? 'bi bi-check-circle me-2' : 'bi bi-exclamation-triangle me-2'"></i>
            {{ isEditing ? 'Update Skill' : 'Add Skill' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRef } from 'vue'
import type { SkillData } from '@/types/skill'
import { SKILL_TAGS, STATUS_CONFIG, type SkillTag, type SkillStatus } from '@/utils/constants'
import { useToasts } from '@/composables/useToasts'
import { useModalKeyboardNavigation } from '@/composables/useModalKeyboardNavigation'

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
const modalRef = ref<HTMLElement | null>(null)

const formData = ref({
  name: '',
  status: 'acquisition' as SkillStatus,
  tags: [] as SkillTag[],
  level: 0,
  notes: ''
})

const isEditing = ref(false)

// Real-time validation
const validationErrors = ref({
  name: '',
  level: ''
})

const isFormValid = computed(() => {
  return !validationErrors.value.name && 
         !validationErrors.value.level &&
         formData.value.name.trim().length >= 2
})

// Initialize keyboard navigation
const { setModalElement, initializeKeyboardNavigation } = useModalKeyboardNavigation({
  isVisible: toRef(props, 'isVisible'),
  onClose: () => emit('close'),
  onConfirm: saveSkill
})

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

// Watch for modal visibility to initialize keyboard navigation
watch(() => props.isVisible, (isVisible) => {
  if (isVisible && modalRef.value) {
    setModalElement(modalRef.value)
    initializeKeyboardNavigation()
  }
})

function resetForm() {
  formData.value = {
    name: '',
    status: 'acquisition',
    tags: [],
    level: 0,
    notes: ''
  }
}

// Tag management functions
function removeTag(tagToRemove: SkillTag) {
  formData.value.tags = formData.value.tags.filter(tag => tag !== tagToRemove)
}

function selectAllTags() {
  formData.value.tags = [...availableTags]
}

function clearAllTags() {
  formData.value.tags = []
}

// Real-time validation functions
function validateName() {
  const name = formData.value.name.trim()
  if (!name) {
    validationErrors.value.name = 'Skill name is required'
  } else if (name.length < 2) {
    validationErrors.value.name = 'Skill name must be at least 2 characters long'
  } else if (name.length > 50) {
    validationErrors.value.name = 'Skill name must be less than 50 characters'
  } else {
    validationErrors.value.name = ''
  }
}

function validateLevel() {
  const level = formData.value.level
  if (level < 0) {
    validationErrors.value.level = 'Level cannot be negative'
  } else if (level > 50) {
    validationErrors.value.level = 'Level cannot exceed 50'
  } else {
    validationErrors.value.level = ''
  }
}

// Watch for form changes to validate in real-time
watch(() => formData.value.name, validateName)
watch(() => formData.value.level, validateLevel)

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
/* Modal styles are now defined in /assets/modal.css using CSS variables */
/* This provides consistent dark mode support and better maintainability */
</style>