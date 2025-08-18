<template>
  <button 
    @click="$emit('toggle')"
    :class="buttonClasses"
    type="button"
    :disabled="disabled"
  >
    <i v-if="icon" :class="`bi ${icon} me-1`"></i>
    {{ label }}
    <span v-if="count !== undefined" :class="badgeClasses">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  isActive: boolean
  count?: number
  icon?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  showBadge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  disabled: false,
  showBadge: true
})

defineEmits<{
  toggle: []
}>()

const buttonClasses = computed(() => {
  const baseClasses = ['btn']
  
  // Size class
  if (props.size !== 'md') {
    baseClasses.push(`btn-${props.size}`)
  }
  
  // Variant classes based on active state
  if (props.isActive) {
    baseClasses.push(`btn-${props.variant}`)
  } else {
    baseClasses.push(`btn-outline-${props.variant}`)
  }
  
  return baseClasses
})

const badgeClasses = computed(() => {
  const classes = ['badge', 'ms-1']
  
  if (props.isActive) {
    // For active buttons, use light badge for contrast
    classes.push('bg-light', 'text-dark')
  } else {
    // For inactive buttons, use variant color
    classes.push(`bg-${props.variant}`)
  }
  
  return classes
})
</script>