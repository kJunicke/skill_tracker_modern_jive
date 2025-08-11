<template>
  <!-- Tags Editor Modal -->
  <BaseModal
    modal-id="tagsEditorModal"
    :title="`Edit Tags: ${skill?.name}`"
    icon="bi-tags"
    header-variant="success"
    centered
    confirm-text="Update Tags"
    confirm-icon="bi-check-circle"
    confirm-variant="success"
    :confirm-disabled="!hasChanges"
    data-testid="tags-editor"
    :is-visible="isVisible"
    @close="$emit('close')"
    @cancel="$emit('close')"
    @confirm="saveTags"
  >
    <div v-if="skill">
      <p class="text-muted mb-4">
        Select the tags that best describe this skill. Tags help organize and filter your skills.
      </p>

            <!-- Tags Selection -->
            <div class="mb-4">
              <h6 class="mb-3">
                <i class="bi bi-tag me-2"></i>
                Select Tags ({{ selectedTags.length }} selected)
              </h6>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  :class="[
                    'btn', 'btn-sm',
                    selectedTags.includes(tag) ? 'btn-success' : 'btn-outline-secondary'
                  ]"
                  @click="toggleTag(tag)"
                >
                  <i v-if="selectedTags.includes(tag)" class="bi bi-check-circle-fill me-1"></i>
                  <i v-else class="bi bi-circle me-1"></i>
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Tag Descriptions -->
            <div class="card bg-light">
              <div class="card-header">
                <h6 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  Tag Descriptions
                </h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <small class="d-block mb-1">
                      <strong>Move:</strong> Physical movements and techniques
                    </small>
                    <small class="d-block mb-1">
                      <strong>Communication:</strong> Partner connection and signals
                    </small>
                    <small class="d-block mb-1">
                      <strong>Control:</strong> Body control and precision
                    </small>
                    <small class="d-block">
                      <strong>Leading:</strong> Lead-specific skills
                    </small>
                  </div>
                  <div class="col-md-6">
                    <small class="d-block mb-1">
                      <strong>Following:</strong> Follow-specific skills
                    </small>
                    <small class="d-block mb-1">
                      <strong>Charisma:</strong> Style and expression
                    </small>
                    <small class="d-block">
                      <strong>Musicality:</strong> Rhythm and musical interpretation
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Tags Info -->
            <div class="mt-3 p-3 rounded" style="background-color: #f8f9fa;">
              <h6 class="mb-2">
                <i class="bi bi-arrow-left-right me-2"></i>
                Changes Preview
              </h6>
              <div class="row">
                <div class="col-6">
                  <small class="text-muted d-block">Current tags:</small>
                  <div v-if="!Array.isArray(skill.tags) || skill.tags.length === 0" class="text-muted fst-italic">
                    None
                  </div>
                  <div v-else>
                    <span 
                      v-for="tag in skill.tags" 
                      :key="tag"
                      class="badge bg-secondary me-1 mb-1"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">New tags:</small>
                  <div v-if="selectedTags.length === 0" class="text-muted fst-italic">
                    None
                  </div>
                  <div v-else>
                    <span 
                      v-for="tag in selectedTags" 
                      :key="tag"
                      class="badge bg-success me-1 mb-1"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SkillData } from '@/types/skill'
import { SKILL_TAGS } from '@/utils/constants'
import BaseModal from '@/components/base/BaseModal.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'tags-changed', skillId: string, newTags: string[]): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedTags = ref<string[]>([])

const availableTags = SKILL_TAGS

const hasChanges = computed(() => {
  if (!props.skill) return false
  // Safely handle tags property
  const skillTags = Array.isArray(props.skill.tags) ? props.skill.tags : []
  const originalTags = [...skillTags].sort()
  const newTags = [...selectedTags.value].sort()
  return JSON.stringify(originalTags) !== JSON.stringify(newTags)
})

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    removeTag(tag)
  } else {
    addTag(tag)
  }
}

const addTag = (tag: string) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
  }
}

const removeTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const saveTags = () => {
  if (!props.skill || !hasChanges.value) return
  
  emit('tags-changed', props.skill.id, [...selectedTags.value])
  
  // Don't reset form here - let parent handle it
}

const resetForm = () => {
  // Ensure tags property is always an array - handle undefined/null cases
  const skillTags = props.skill?.tags
  if (Array.isArray(skillTags)) {
    selectedTags.value = [...skillTags]
  } else {
    selectedTags.value = []
  }
}

// Watch for skill changes to reset form
watch(() => props.skill, () => {
  if (props.skill) {
    resetForm()
  }
}, { immediate: true })

// Expose resetForm for parent components
defineExpose({
  resetForm
})
</script>

<style scoped>
.badge {
  transition: all 0.2s ease-in-out;
}

.badge:hover {
  transform: scale(1.05);
}

.btn-sm {
  transition: all 0.2s ease-in-out;
}

.btn-sm:hover {
  transform: translateY(-1px);
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>