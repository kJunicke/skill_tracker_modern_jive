<template>
  <div 
    class="modal fade" 
    :id="modalId" 
    tabindex="-1" 
    :aria-labelledby="`${modalId}Label`" 
    aria-hidden="true"
  >
    <div class="modal-dialog" :class="dialogClass">
      <div class="modal-content">
        <div class="modal-header" :class="`bg-${headerColor} text-white`">
          <h5 class="modal-title" :id="`${modalId}Label`">
            <i :class="`bi bi-${headerIcon} me-2`"></i>
            {{ headerTitle }}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        
        <div class="modal-body">
          <div v-if="skill">
            <p v-if="description" class="text-muted mb-4">
              {{ description }}
            </p>
            <slot name="content" :skill="skill"></slot>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            :disabled="!canSave"
            @click="handleSave"
          >
            <i class="bi bi-check-circle me-2"></i>
            {{ saveButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillData } from '@/types/skill'

interface Props {
  skill: SkillData | null
  isVisible: boolean
  modalId: string
  headerTitle: string
  headerIcon: string
  headerColor: string
  description?: string
  dialogClass?: string
  saveButtonText?: string
  canSave?: boolean
}

withDefaults(defineProps<Props>(), {
  dialogClass: 'modal-dialog-centered',
  saveButtonText: 'Save Changes',
  canSave: true
})

const emit = defineEmits<{
  save: []
  close: []
}>()

const handleSave = () => {
  emit('save')
}
</script>

<style scoped>
.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: none;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}
</style>