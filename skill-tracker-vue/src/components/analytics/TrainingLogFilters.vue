<template>
  <div class="card mb-4">
    <div class="card-header">
      <h6 class="mb-0">
        <i class="bi bi-funnel me-2"></i>
        Filters
      </h6>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-3">
          <label class="form-label">Time Period:</label>
          <select v-model="localFilters.timePeriod" class="form-select form-select-sm">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div class="col-md-5">
          <label class="form-label">Activity Types:</label>
          <div class="d-flex gap-2 flex-wrap">
            <button 
              @click="localFilters.showPractice = !localFilters.showPractice"
              :class="['btn btn-sm', localFilters.showPractice ? 'btn-success' : 'btn-outline-success']"
              type="button"
            >
              <i class="bi bi-play-circle me-1"></i>
              Practice ({{ activityCounts.practice }})
            </button>
            <button 
              @click="localFilters.showLevelup = !localFilters.showLevelup"
              :class="['btn btn-sm', localFilters.showLevelup ? 'btn-warning' : 'btn-outline-warning']"
              type="button"
            >
              <i class="bi bi-arrow-up-circle me-1"></i>
              Level-Up ({{ activityCounts.levelup }})
            </button>
            <button 
              @click="localFilters.showQuicknote = !localFilters.showQuicknote"
              :class="['btn btn-sm', localFilters.showQuicknote ? 'btn-primary' : 'btn-outline-primary']"
              type="button"
            >
              <i class="bi bi-sticky me-1"></i>
              Notes ({{ activityCounts.quicknote }})
            </button>
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Skill:</label>
          <select v-model="localFilters.skillId" class="form-select form-select-sm">
            <option value="all">All Skills</option>
            <option 
              v-for="skill in skills" 
              :key="skill.id" 
              :value="skill.id"
            >
              {{ skill.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Quick time filters -->
      <div class="row mt-3">
        <div class="col-12">
          <label class="form-label">Quick Filters:</label>
          <div class="d-flex gap-2 flex-wrap">
            <button 
              @click="localFilters.timePeriod = 'today'"
              :class="['btn btn-sm', localFilters.timePeriod === 'today' ? 'btn-info' : 'btn-outline-info']"
              type="button"
            >
              Today
            </button>
            <button 
              @click="localFilters.timePeriod = 'week'"
              :class="['btn btn-sm', localFilters.timePeriod === 'week' ? 'btn-info' : 'btn-outline-info']"
              type="button"
            >
              This Week
            </button>
            <button 
              @click="localFilters.timePeriod = 'month'"
              :class="['btn btn-sm', localFilters.timePeriod === 'month' ? 'btn-info' : 'btn-outline-info']"
              type="button"
            >
              This Month
            </button>
            <button 
              @click="localFilters.timePeriod = 'all'"
              :class="['btn btn-sm', localFilters.timePeriod === 'all' ? 'btn-info' : 'btn-outline-info']"
              type="button"
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Date Range -->
      <div v-if="localFilters.timePeriod === 'custom'" class="row mt-3">
        <div class="col-md-6">
          <label class="form-label">From:</label>
          <input 
            v-model="localFilters.dateFrom" 
            type="date" 
            class="form-control form-control-sm"
          >
        </div>
        <div class="col-md-6">
          <label class="form-label">To:</label>
          <input 
            v-model="localFilters.dateTo" 
            type="date" 
            class="form-control form-control-sm"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { SkillData } from '@/types/skill'

interface Filters {
  timePeriod: string
  activityType: string
  skillId: string
  dateFrom: string
  dateTo: string
  showPractice: boolean
  showLevelup: boolean
  showQuicknote: boolean
}

interface ActivityCounts {
  practice: number
  levelup: number
  quicknote: number
}

interface Props {
  filters: Filters
  skills: SkillData[]
  activityCounts: ActivityCounts
}

interface Emits {
  (e: 'update:filters', filters: Filters): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Create local reactive copy of filters
const localFilters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
})

// Watch for changes and emit updates
watch(
  () => props.filters,
  (newFilters) => {
    emit('update:filters', newFilters)
  },
  { deep: true }
)
</script>