<template>
  <!-- Status Editor Modal -->
  <BaseModal
    modal-id="statusEditorModal"
    :title="`Change Status: ${skill?.name}`"
    icon="bi-tag"
    header-variant="secondary"
    centered
    size="lg"
    confirm-text="Update Status"
    confirm-icon="bi-check-circle"
    :confirm-disabled="!canSave"
    data-testid="status-editor"
    :is-visible="isVisible"
    @close="$emit('close')"
    @cancel="$emit('close')"
    @confirm="saveStatus"
  >
    <div v-if="skill">
      <p class="text-muted mb-4">
        Select the new status for this skill. Each status affects how the skill is scheduled for practice.
      </p>

            <!-- Status Options -->
            <div class="d-grid gap-3">
              <button
                v-for="(statusConfig, statusKey) in statusOptions"
                :key="statusKey"
                :class="[
                  'btn', 'btn-lg', 'status-btn', 'text-start',
                  selectedStatus === statusKey ? `btn-${statusConfig.color}` : `btn-outline-${statusConfig.color}`
                ]"
                @click="selectStatus(statusKey)"
              >
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <i :class="`bi ${statusConfig.icon}`" style="font-size: 1.5rem;"></i>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold">{{ statusConfig.label }}</div>
                    <small class="text-muted">{{ statusConfig.description }}</small>
                  </div>
                  <div v-if="selectedStatus === statusKey" class="ms-2">
                    <i class="bi bi-check-circle text-success"></i>
                  </div>
                </div>
              </button>
            </div>

            <!-- Current Status Info -->
            <div class="mt-4 p-3 bg-light rounded">
              <h6 class="mb-2">
                <i class="bi bi-info-circle me-2"></i>
                Current Status: 
                <span :class="`badge bg-${statusOptions[skill.status]?.color || 'secondary'} ms-2`">
                  {{ statusOptions[skill.status]?.label || 'Unknown' }}
                </span>
              </h6>
              <small class="text-muted">
                {{ statusOptions[skill.status]?.description || 'No description available' }}
              </small>
            </div>

            <!-- Status Change Impact -->
            <div v-if="selectedStatus && selectedStatus !== skill.status" class="mt-3">
              <div class="alert alert-info">
                <h6><i class="bi bi-arrow-right me-2"></i>Status Change Impact</h6>
                <ul class="mb-0 small">
                  <li v-if="getStatusImpact(selectedStatus).interval">
                    Review frequency: {{ getStatusImpact(selectedStatus).interval }}
                  </li>
                  <li v-if="getStatusImpact(selectedStatus).focus">
                    Focus mode: {{ getStatusImpact(selectedStatus).focus }}
                  </li>
                  <li v-if="getStatusImpact(selectedStatus).special">
                    {{ getStatusImpact(selectedStatus).special }}
                  </li>
                </ul>
              </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { SkillData } from '@/types/skill'
import { STATUS_CONFIG, type SkillStatus } from '@/utils/constants'
import { useEditorModal } from '@/composables/useEditorModal'
import BaseModal from '@/components/base/BaseModal.vue'

interface Props {
  skill: SkillData | null
  isVisible: boolean
}

interface Emits {
  (e: 'status-changed', skillId: string, newStatus: string): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { editedValue: selectedStatus, canSave } = useEditorModal(
  props,
  (skill) => skill.status,
  (value, skill) => !!value && value !== skill.status
)

const statusOptions = STATUS_CONFIG

const selectStatus = (status: string) => {
  selectedStatus.value = status as SkillStatus
}

const getStatusImpact = (status: string) => {
  const impacts: Record<string, { interval: string; focus: string; special: string }> = {
    backlog: {
      interval: 'No scheduled reviews',
      focus: 'No focus mode tracking',
      special: 'Skill is saved for future learning'
    },
    acquisition: {
      interval: 'Normal review intervals',
      focus: 'No focus mode tracking',
      special: 'Best for learning new skills'
    },
    maintenance: {
      interval: 'Longer review intervals (1.5x)',
      focus: 'No focus mode tracking', 
      special: 'Keeps skills sharp with minimal effort'
    },
    focus: {
      interval: 'Shorter, intensive intervals',
      focus: 'XP tracking and level-up system active',
      special: 'Accelerated learning with gamification'
    },
    archived: {
      interval: 'No scheduled reviews',
      focus: 'No focus mode tracking',
      special: 'Skill is considered mastered'
    }
  }
  return impacts[status] || { interval: '', focus: '', special: '' }
}

const saveStatus = () => {
  if (!props.skill || !selectedStatus.value) return
  emit('status-changed', props.skill.id, selectedStatus.value)
}


</script>

<style scoped>
.status-btn {
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.status-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-btn.btn-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  border: none;
}

.status-btn.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border: none;
}

.status-btn.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
}

.status-btn.btn-warning {
  background: linear-gradient(135deg, #ffc107, #d39e00);
  border: none;
}

.status-btn.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  border: none;
}

.btn-outline-info:hover,
.btn-outline-success:hover,
.btn-outline-danger:hover,
.btn-outline-warning:hover,
.btn-outline-secondary:hover {
  color: white;
}
</style>