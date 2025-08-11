<template>
  <div class="mb-4">
    <div class="row">
      <div class="col-md-6">
        <label class="form-label fw-bold">Filter by status:</label>
        <div class="d-flex flex-wrap gap-2">
          <button 
            v-for="status in statusOptions"
            :key="status.value"
            :class="[
              'btn', 
              'btn-sm',
              filters.status === status.value ? 'btn-primary' : 'btn-outline-primary'
            ]"
            @click="$emit('filter-change', {key: 'status', value: status.value})"
          >
            <i v-if="status.icon" :class="`bi ${status.icon} me-1`"></i>
            {{ status.label }}
          </button>
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label fw-bold">Filter by tags:</label>
        <div class="d-flex flex-wrap gap-2">
          <button 
            v-for="tag in tagOptions"
            :key="tag.value"
            :class="[
              'btn', 
              'btn-sm',
              filters.tag === tag.value ? 'btn-primary' : 'btn-outline-secondary'
            ]"
            @click="$emit('filter-change', {key: 'tag', value: tag.value})"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Search and Sorting -->
    <div class="row mt-3">
      <div class="col-md-6">
        <input 
          :value="filters.search"
          @input="handleSearchInput"
          type="text" 
          class="form-control" 
          placeholder="Search skills..."
        >
      </div>
      <div class="col-md-6">
        <label class="form-label fw-bold">Sort by:</label>
        <div class="d-flex gap-2 align-items-center">
          <div class="dropdown">
            <button 
              class="btn btn-outline-info dropdown-toggle" 
              type="button" 
              @click="toggleDropdown"
            >
              <i class="bi bi-sort-down me-1"></i>
              {{ currentSortLabel }}
            </button>
            <ul 
              v-show="showDropdown" 
              class="dropdown-menu show"
              style="position: absolute; z-index: 1000;"
            >
              <li v-for="option in sortOptions" :key="option.value">
                <a 
                  class="dropdown-item" 
                  :class="{ 'active': sorting.field === option.value }"
                  href="#" 
                  @click.prevent="handleSortFieldChange(option.value)"
                >
                  <i :class="`bi ${option.icon} me-2`"></i>
                  {{ option.label }}
                </a>
              </li>
            </ul>
          </div>
          <button 
            class="btn btn-outline-secondary"
            :title="`Sort ${sorting.direction === 'asc' ? 'Descending' : 'Ascending'}`"
            @click="handleSortDirectionToggle"
          >
            <i :class="`bi bi-sort-${sorting.direction === 'asc' ? 'up' : 'down'}`"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SKILL_TAGS, STATUS_CONFIG } from '@/utils/constants'

interface Props {
  filters: {
    status: string
    tag: string
    search: string
  }
  sorting: {
    field: 'reviewDate' | 'name' | 'level'
    direction: 'asc' | 'desc'
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'filter-change': [filter: {key: 'status' | 'tag' | 'search', value: string}]
  'sort-change': [field: 'reviewDate' | 'name' | 'level']
  'sort-direction-toggle': []
}>()

const showDropdown = ref(false)

const statusOptions = computed(() => [
  { value: 'all', label: 'All', icon: null },
  ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    value: key,
    label: config.label,
    icon: config.icon
  }))
])

const tagOptions = computed(() => [
  { value: 'all', label: 'All' },
  ...SKILL_TAGS.map(tag => ({ value: tag, label: tag }))
])

const sortOptions = computed(() => [
  { value: 'reviewDate' as const, label: 'Review Date', icon: 'bi-calendar3' },
  { value: 'name' as const, label: 'Name', icon: 'bi-sort-alpha-down' },
  { value: 'level' as const, label: 'Level', icon: 'bi-star' }
])

const currentSortLabel = computed(() => {
  const option = sortOptions.value.find(opt => opt.value === props.sorting.field)
  return option ? option.label : 'Review Date'
})

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('filter-change', {key: 'search', value: target.value})
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleSortFieldChange = (field: 'reviewDate' | 'name' | 'level') => {
  emit('sort-change', field)
  showDropdown.value = false
}

const handleSortDirectionToggle = () => {
  emit('sort-direction-toggle')
}
</script>