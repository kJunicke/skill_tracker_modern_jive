<template>
  <div class="timeline-item" :class="{ [`timeline-${event.type}`]: !isModalView }">
    <!-- Compact Timeline Item (Sidebar) -->
    <template v-if="!isModalView">
      <div 
        class="timeline-marker"
        :class="getEventTypeInfo(event.type).bgColor"
      ></div>
      <div class="timeline-content-item">
        <div class="d-flex justify-content-between align-items-start">
          <div class="timeline-info">
            <strong class="timeline-title">{{ event.title }}</strong>
            <p class="timeline-description mb-1">
              <template v-if="event.type === 'quicknote'">
                {{ (event.data as QuickNote).note }}
              </template>
              <template v-else>
                {{ event.description }}
              </template>
            </p>
          </div>
          <TimelineEventActions
            :event-type="event.type"
            :has-description="!!event.description"
            :is-modal-view="false"
            :is-transferred="isTransferred"
            @edit-levelup="() => $emit('edit-levelup', event.data as ProgressionEntry)"
            @edit-practice="() => $emit('edit-practice', event.data as PracticeSession)"
            @edit-quicknote="() => $emit('edit-quicknote', event.data as QuickNote)"
            @delete-quicknote="() => $emit('delete-quicknote', event.data as QuickNote)"
            @add-to-notes="() => $emit('add-to-notes', event)"
            @toggle-transferred="() => $emit('toggle-transferred', event)"
          />
        </div>
      </div>
    </template>

    <!-- Full Timeline Item (Modal) -->
    <template v-else>
      <!-- Level Up Event -->
      <template v-if="event.type === 'levelup'">
        <div class="timeline-marker bg-primary">
          <i class="bi bi-arrow-up-circle text-white"></i>
        </div>
        <div class="timeline-content">
          <div class="card border-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">
                  <span class="badge bg-primary me-2">
                    <i class="bi bi-arrow-up-circle me-1"></i>
                    Level {{ (event.data as ProgressionEntry).level }}
                  </span>
                  <small class="text-muted">from Level {{ (event.data as ProgressionEntry).previousLevel || (event.data as ProgressionEntry).level - 1 }}</small>
                </h6>
                <div class="d-flex align-items-center gap-2">
                  <TimelineEventActions
                    event-type="levelup"
                    :is-modal-view="true"
                    :is-transferred="isTransferred"
                    @edit-levelup="() => $emit('edit-levelup', event.data as ProgressionEntry)"
                    @toggle-transferred="() => $emit('toggle-transferred', event)"
                  />
                </div>
              </div>
              <p class="card-text">{{ (event.data as ProgressionEntry).comment }}</p>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Practice Session Event -->
      <template v-else-if="event.type === 'practice'">
        <div :class="[
          'timeline-marker',
          getQualityColor((event.data as PracticeSession).quality)
        ]">
          <i :class="`bi ${getQualityIcon((event.data as PracticeSession).quality)} text-white`"></i>
        </div>
        <div class="timeline-content">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">
                  <span :class="[
                    'badge',
                    `bg-${getQualityColorName((event.data as PracticeSession).quality)}`
                  ]">
                    <i class="bi bi-play-circle me-1"></i>
                    {{ event.title }}
                  </span>
                </h6>
                <div class="d-flex align-items-center gap-2">
                  <TimelineEventActions
                    event-type="practice"
                    :is-modal-view="true"
                    :is-transferred="isTransferred"
                    @edit-practice="() => $emit('edit-practice', event.data as PracticeSession)"
                    @toggle-transferred="() => $emit('toggle-transferred', event)"
                  />
                </div>
              </div>
              <p v-if="(event.data as PracticeSession).note" class="card-text">{{ (event.data as PracticeSession).note }}</p>
              <p v-else class="card-text text-muted fst-italic">No notes</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Quick Note Event -->
      <template v-else-if="event.type === 'quicknote'">
        <div class="timeline-marker bg-info">
          <i class="bi bi-chat-left-text text-white"></i>
        </div>
        <div class="timeline-content">
          <div class="card border-info">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="card-title mb-0">
                  <span class="badge bg-info me-2">
                    <i class="bi bi-chat-left-text me-1"></i>
                    Quick Note
                  </span>
                </h6>
                <div class="d-flex align-items-center gap-2">
                  <TimelineEventActions
                    event-type="quicknote"
                    :is-modal-view="true"
                    :is-transferred="isTransferred"
                    @edit-quicknote="() => $emit('edit-quicknote', event.data as QuickNote)"
                    @delete-quicknote="() => $emit('delete-quicknote', event.data as QuickNote)"
                    @toggle-transferred="() => $emit('toggle-transferred', event)"
                  />
                </div>
              </div>
              <p class="card-text">{{ (event.data as QuickNote).note }}</p>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ProgressionEntry, PracticeSession, QuickNote } from '@/types/skill'
import type { TimelineEvent } from '@/composables/useSkillTimeline'
import TimelineEventActions from './TimelineEventActions.vue'

interface Props {
  event: TimelineEvent
  isModalView?: boolean
  isTransferred: boolean
  formatEventDate: (date: string) => string
  formatEventDateTime: (date: string) => string
  getEventTypeInfo: (type: TimelineEvent['type']) => { bgColor: string }
}

interface Emits {
  (e: 'edit-levelup', data: ProgressionEntry): void
  (e: 'edit-practice', data: PracticeSession): void
  (e: 'edit-quicknote', data: QuickNote): void
  (e: 'delete-quicknote', data: QuickNote): void
  (e: 'add-to-notes', event: TimelineEvent): void
  (e: 'toggle-transferred', event: TimelineEvent): void
}

defineProps<Props>()
defineEmits<Emits>()

// Quality helper functions for practice sessions
const getQualityColor = (quality: number): string => {
  const colors = ['bg-danger', 'bg-warning', 'bg-success', 'bg-primary']
  return colors[quality] || 'bg-secondary'
}

const getQualityColorName = (quality: number): string => {
  const colors = ['danger', 'warning', 'success', 'primary']
  return colors[quality] || 'secondary'
}

const getQualityIcon = (quality: number): string => {
  const icons = ['bi-x-circle', 'bi-exclamation-triangle', 'bi-check-circle', 'bi-star-fill']
  return icons[quality] || 'bi-circle'
}

</script>

<style scoped>
.timeline-item {
  position: relative;
  padding-left: 0 rem;
  margin-bottom: 0.5rem;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0.25rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.timeline-levelup .timeline-marker,
.timeline-practice .timeline-marker,
.timeline-quicknote .timeline-marker {
  border: 2px solid #fff;
}

.timeline-content-item {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease-in-out;
}

.timeline-content-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-title {
  font-size: 0.9rem;
  color: #495057;
}

.timeline-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
}


/* Modal timeline styles */
.timeline-content {
  margin-left: 1rem;
}

.timeline .timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card.border-primary {
  border-left-width: 4px !important;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-1px);
}

.card-body {
  position: relative;
}

</style>