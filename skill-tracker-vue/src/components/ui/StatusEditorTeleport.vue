<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="modal-content modal-lg"
        @click.stop
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        style="background: var(--modal-bg);"
      >
        <!-- Header -->
        <div class="modal-header modal-header-status">
          <h5 class="modal-title" :id="titleId">
            <i class="bi bi-tag me-2"></i>
            Change Status: {{ skill?.name }}
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

            <!-- Visual Status Transition Diagram -->
            <div class="mt-4 p-3 bg-light rounded">
              <h6 class="mb-3">
                <i class="bi bi-diagram-3 me-2"></i>
                Learning Journey Overview
              </h6>
              <div class="status-flow-diagram">
                <!-- Initial learning path -->
                <div class="learning-path mb-3">
                  <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
                    <!-- Backlog to Acquisition -->
                    <div
                      :class="[
                        'status-node',
                        'backlog' === skill.status ? 'current' : '',
                        'backlog' === selectedStatus ? 'selected' : '',
                        isStatusAccessible('backlog') ? 'accessible' : 'inaccessible'
                      ]"
                    >
                      <div class="status-badge">
                        <i class="bi bi-inbox"></i>
                      </div>
                      <small class="status-label">Backlog</small>
                    </div>
                    <i class="bi bi-arrow-right text-muted status-arrow"></i>
                    
                    <!-- Acquisition -->
                    <div
                      :class="[
                        'status-node',
                        'acquisition' === skill.status ? 'current' : '',
                        'acquisition' === selectedStatus ? 'selected' : '',
                        isStatusAccessible('acquisition') ? 'accessible' : 'inaccessible'
                      ]"
                    >
                      <div class="status-badge">
                        <i class="bi bi-mortarboard"></i>
                      </div>
                      <small class="status-label">Acquisition</small>
                    </div>
                    <i class="bi bi-arrow-right text-muted status-arrow"></i>
                    
                    <!-- Level 5+ threshold indicator -->
                    <div class="level-threshold">
                      <small class="text-muted">Level 5+</small>
                    </div>
                  </div>
                </div>
                
                <!-- Advanced learning cycle -->
                <div class="advanced-cycle">
                  <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
                    <!-- Maintenance <-> Focus bidirectional flow -->
                    <div
                      :class="[
                        'status-node',
                        'maintenance' === skill.status ? 'current' : '',
                        'maintenance' === selectedStatus ? 'selected' : '',
                        isStatusAccessible('maintenance') ? 'accessible' : 'inaccessible'
                      ]"
                    >
                      <div class="status-badge">
                        <i class="bi bi-shield-check"></i>
                      </div>
                      <small class="status-label">Maintenance</small>
                    </div>
                    
                    <!-- Bidirectional arrows -->
                    <div class="bidirectional-arrows">
                      <i class="bi bi-arrow-left-right text-muted"></i>
                      <small class="cycle-label">Cycle</small>
                    </div>
                    
                    <div
                      :class="[
                        'status-node',
                        'focus' === skill.status ? 'current' : '',
                        'focus' === selectedStatus ? 'selected' : '',
                        isStatusAccessible('focus') ? 'accessible' : 'inaccessible'
                      ]"
                    >
                      <div class="status-badge">
                        <i class="bi bi-target"></i>
                      </div>
                      <small class="status-label">Focus</small>
                    </div>
                    
                    <i class="bi bi-arrow-right text-muted status-arrow"></i>
                    
                    <!-- Archived -->
                    <div
                      :class="[
                        'status-node',
                        'archived' === skill.status ? 'current' : '',
                        'archived' === selectedStatus ? 'selected' : '',
                        isStatusAccessible('archived') ? 'accessible' : 'inaccessible'
                      ]"
                    >
                      <div class="status-badge">
                        <i class="bi bi-archive"></i>
                      </div>
                      <small class="status-label">Archived</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-2">
                <small class="text-muted d-flex flex-wrap gap-3 justify-content-center">
                  <span class="status-legend current">
                    <i class="bi bi-circle-fill me-1"></i>Current
                  </span>
                  <span class="status-legend selected">
                    <i class="bi bi-check-circle-fill me-1"></i>Selected
                  </span>
                  <span class="status-legend accessible">
                    <i class="bi bi-unlock me-1"></i>Available
                  </span>
                </small>
                <div class="mt-2 text-center">
                  <small class="text-muted fst-italic">
                    Skills cycle between Maintenance and Focus before being Archived
                  </small>
                </div>
              </div>
            </div>

            <!-- Current Status Info -->
            <div class="mt-3 p-3 bg-light rounded">
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
              <div :class="`alert alert-${getStatusImpact(selectedStatus).color}`">
                <h6 class="d-flex align-items-center mb-3">
                  <i :class="`bi ${getStatusImpact(selectedStatus).icon} me-2`"></i>
                  Status Change Impact
                  <i class="bi bi-arrow-right mx-2 text-muted"></i>
                  <span :class="`badge bg-${getStatusImpact(selectedStatus).color}`">
                    {{ statusOptions[selectedStatus]?.label }}
                  </span>
                </h6>
                
                <div class="impact-items">
                  <div v-if="getStatusImpact(selectedStatus).interval" class="impact-item d-flex align-items-start mb-2">
                    <i class="bi bi-clock-history me-2 mt-1 flex-shrink-0 text-info"></i>
                    <div>
                      <strong>Review Frequency:</strong><br>
                      <small>{{ getStatusImpact(selectedStatus).interval }}</small>
                    </div>
                  </div>
                  
                  <div v-if="getStatusImpact(selectedStatus).focus" class="impact-item d-flex align-items-start mb-2">
                    <i class="bi bi-bullseye me-2 mt-1 flex-shrink-0 text-warning"></i>
                    <div>
                      <strong>Focus Mode:</strong><br>
                      <small>{{ getStatusImpact(selectedStatus).focus }}</small>
                    </div>
                  </div>
                  
                  <div v-if="getStatusImpact(selectedStatus).special" class="impact-item d-flex align-items-start">
                    <i class="bi bi-lightbulb me-2 mt-1 flex-shrink-0 text-success"></i>
                    <div>
                      <strong>Key Benefit:</strong><br>
                      <small>{{ getStatusImpact(selectedStatus).special }}</small>
                    </div>
                  </div>
                </div>
                
                <!-- Requirements Check -->
                <div v-if="!isStatusAccessible(selectedStatus)" class="mt-3 p-2 bg-warning bg-opacity-10 border border-warning rounded">
                  <div class="d-flex align-items-start">
                    <i class="bi bi-exclamation-triangle me-2 mt-1 flex-shrink-0 text-warning"></i>
                    <div>
                      <strong>Requirements Not Met:</strong><br>
                      <small v-if="selectedStatus === 'maintenance' || selectedStatus === 'focus' || selectedStatus === 'archived'">
                        This status requires skill level 5 or higher. Current level: {{ skill.level }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!canSave"
            @click="saveStatus"
          >
            <i class="bi bi-check-circle me-2"></i>
            Update Status
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import { STATUS_CONFIG, type SkillStatus } from '@/utils/constants'
import { useEditorModal } from '@/composables/useEditorModal'

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
const titleId = computed(() => 'statusEditorModal-title')


// Determine if a status is accessible based on current skill state
const isStatusAccessible = (targetStatus: string): boolean => {
  if (!props.skill) return false
  
  const level = props.skill.level
  
  // All skills can go to backlog
  if (targetStatus === 'backlog') return true
  
  // All skills can enter acquisition mode
  if (targetStatus === 'acquisition') return true
  
  // Maintenance requires level 5+
  if (targetStatus === 'maintenance') return level >= 5
  
  // Focus requires maintenance first (level 5+)
  if (targetStatus === 'focus') return level >= 5
  
  // Archived requires level 5+ (mastered skills)
  if (targetStatus === 'archived') return level >= 5
  
  return true
}

const selectStatus = (status: string) => {
  selectedStatus.value = status as SkillStatus
}

const getStatusImpact = (status: string) => {
  const impacts: Record<string, { interval: string; focus: string; special: string; icon: string; color: string }> = {
    backlog: {
      interval: 'No scheduled reviews',
      focus: 'No focus mode tracking',
      special: 'Skill is saved for future learning',
      icon: 'bi-inbox',
      color: 'secondary'
    },
    acquisition: {
      interval: '1-2-3 day intervals for skill building',
      focus: 'No focus mode tracking',
      special: 'Fixed intervals for consistent skill building',
      icon: 'bi-mortarboard',
      color: 'info'
    },
    maintenance: {
      interval: 'Longer review intervals (1.5x)',
      focus: 'No focus mode tracking', 
      special: 'Keeps skills sharp with minimal effort',
      icon: 'bi-shield-check',
      color: 'success'
    },
    focus: {
      interval: 'Shorter, intensive intervals',
      focus: 'XP tracking and level-up system active',
      special: 'Accelerated learning with gamification',
      icon: 'bi-target',
      color: 'warning'
    },
    archived: {
      interval: 'No scheduled reviews',
      focus: 'No focus mode tracking',
      special: 'Skill is considered mastered',
      icon: 'bi-archive',
      color: 'dark'
    }
  }
  return impacts[status] || { interval: '', focus: '', special: '', icon: 'bi-question', color: 'secondary' }
}

const saveStatus = () => {
  if (!props.skill || !selectedStatus.value) return
  emit('status-changed', props.skill.id, selectedStatus.value)
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
/* Modal styles are now defined in /assets/modal.css using CSS variables */

/* Status Editor specific styles */
.status-btn {
  transition: var(--modal-transform-transition);
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

/* Status Flow Diagram Styles */
.status-flow-diagram {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
}

.learning-path {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1rem;
}

.advanced-cycle {
  padding-top: 1rem;
}

.level-threshold {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px dashed #6c757d;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.5);
}

.bidirectional-arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.5rem;
}

.bidirectional-arrows i {
  font-size: 1.5rem;
  color: #007bff;
}

.cycle-label {
  font-size: 0.7rem;
  color: #007bff;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 80px;
}

.status-node.current {
  background: rgba(13, 110, 253, 0.2);
  border: 2px solid #0d6efd;
}

.status-node.selected {
  background: rgba(25, 135, 84, 0.2);
  border: 2px solid #198754;
  transform: scale(1.05);
}

.status-node.accessible {
  opacity: 1;
  cursor: pointer;
}

.status-node.accessible:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-node.inaccessible {
  opacity: 0.4;
  cursor: not-allowed;
}

.status-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108, 117, 125, 0.2);
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.status-node.current .status-badge {
  background: #0d6efd;
  color: white;
}

.status-node.selected .status-badge {
  background: #198754;
  color: white;
}

.status-label {
  font-weight: 500;
  text-align: center;
  font-size: 0.8rem;
}

.status-arrow {
  font-size: 1.2rem;
  margin: 0 0.5rem;
  opacity: 0.6;
}

.status-legend {
  font-size: 0.75rem;
}

.status-legend.current {
  color: #0d6efd;
}

.status-legend.selected {
  color: #198754;
}

.status-legend.accessible {
  color: #6c757d;
}

/* Mobile responsive adjustments */
@media (max-width: 575.98px) {
  .status-flow-diagram .d-flex {
    flex-direction: column;
  }
  
  .status-arrow {
    transform: rotate(90deg);
    margin: 0.5rem 0;
  }
  
  .status-node {
    min-width: 100px;
    width: 100%;
    max-width: 200px;
  }
}
</style>