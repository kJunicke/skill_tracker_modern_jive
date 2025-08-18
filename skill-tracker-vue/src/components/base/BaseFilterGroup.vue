<template>
  <div :class="containerClasses">
    <label v-if="label" :class="labelClasses">
      <i v-if="icon" :class="`bi ${icon} me-1`"></i>
      {{ label }}
    </label>
    
    <div :class="buttonGroupClasses">
      <slot :active-filter="activeFilter" :toggle-filter="toggleFilter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label?: string
  icon?: string
  modelValue: string | string[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  gap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  size: 'sm',
  gap: 'sm'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const activeFilter = computed(() => props.modelValue)

const toggleFilter = (value: string) => {
  if (Array.isArray(props.modelValue)) {
    // Multi-select mode
    const currentFilters = [...props.modelValue]
    const index = currentFilters.indexOf(value)
    
    if (index > -1) {
      currentFilters.splice(index, 1)
    } else {
      currentFilters.push(value)
    }
    
    emit('update:modelValue', currentFilters)
  } else {
    // Single-select mode
    const newValue = props.modelValue === value ? '' : value
    emit('update:modelValue', newValue)
  }
}

const containerClasses = computed(() => {
  const classes = ['filter-group']
  
  if (props.orientation === 'vertical') {
    classes.push('d-flex', 'flex-column')
  }
  
  return classes
})

const labelClasses = computed(() => [
  'form-label',
  'mb-2',
  'fw-semibold',
  'text-muted'
])

const buttonGroupClasses = computed(() => {
  const classes = ['btn-group']
  
  if (props.orientation === 'vertical') {
    classes.push('btn-group-vertical')
  }
  
  // Add gap classes
  const gapClass = `gap-${props.gap}`
  classes.push(gapClass)
  
  return classes
})
</script>

<style scoped>
.filter-group {
  margin-bottom: 1rem;
}

.gap-sm > * + * {
  margin-left: 0.25rem;
}

.gap-md > * + * {
  margin-left: 0.5rem;
}

.gap-lg > * + * {
  margin-left: 1rem;
}

.btn-group-vertical.gap-sm > * + * {
  margin-left: 0;
  margin-top: 0.25rem;
}

.btn-group-vertical.gap-md > * + * {
  margin-left: 0;
  margin-top: 0.5rem;
}

.btn-group-vertical.gap-lg > * + * {
  margin-left: 0;
  margin-top: 1rem;
}
</style>