<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled"
    :type="buttonType"
    v-bind="linkProps"
    @click="handleClick"
  >
    <i v-if="icon && iconPosition === 'left'" :class="`bi ${icon} ${iconSpacing}`"></i>
    
    <slot>{{ text }}</slot>
    
    <i v-if="icon && iconPosition === 'right'" :class="`bi ${icon} ${iconSpacing}`"></i>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
type ButtonSize = 'sm' | 'lg' | undefined
type IconPosition = 'left' | 'right'

interface Props {
  // Content
  text?: string
  icon?: string
  iconPosition?: IconPosition
  
  // Styling  
  variant?: ButtonVariant
  outline?: boolean
  size?: ButtonSize
  block?: boolean
  
  // State
  disabled?: boolean
  loading?: boolean
  active?: boolean
  
  // Behavior
  tag?: 'button' | 'a' | 'router-link'
  type?: 'button' | 'submit' | 'reset'
  
  // Link props (for 'a' tag)
  href?: string
  target?: string
  
  // Router props (for 'router-link' tag)
  to?: string | object
  
  // Custom classes
  customClass?: string
}

interface Emits {
  (e: 'click', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  outline: false,
  iconPosition: 'left',
  tag: 'button',
  type: 'button',
  disabled: false,
  loading: false,
  active: false,
  block: false
})

const emit = defineEmits<Emits>()

// Computed Classes
const buttonClasses = computed(() => [
  'btn',
  {
    // Variant classes
    [`btn-${props.variant}`]: !props.outline,
    [`btn-outline-${props.variant}`]: props.outline,
    
    // Size classes
    [`btn-${props.size}`]: props.size,
    
    // State classes
    'btn-block': props.block,
    'w-100': props.block,
    'active': props.active,
    'disabled': props.disabled,
    
    // Loading state
    'loading': props.loading
  },
  // Custom classes
  props.customClass
])

const buttonType = computed(() => {
  if (props.tag === 'button') {
    return props.type
  }
  return undefined
})

const linkProps = computed(() => {
  if (props.tag === 'a') {
    return {
      href: props.href,
      target: props.target
    }
  }
  if (props.tag === 'router-link') {
    return {
      to: props.to
    }
  }
  return {}
})

const iconSpacing = computed(() => {
  if (props.iconPosition === 'left') {
    return 'me-2'
  } else {
    return 'ms-2'  
  }
})

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Base button enhancements */
.btn {
  transition: all 0.2s ease-in-out;
  border: none;
  font-weight: 500;
}

.btn:hover:not(.disabled):not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active:not(.disabled):not(:disabled) {
  transform: translateY(0);
}

/* Loading state */
.btn.loading {
  pointer-events: none;
  position: relative;
  color: transparent !important;
}

.btn.loading::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-loading-spinner 0.75s linear infinite;
  color: inherit;
}

@keyframes btn-loading-spinner {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Enhanced gradient variants */
.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  border: none;
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  border: none;
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  border: none;
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107, #d39e00);
  border: none;
  color: #212529;
}

.btn-info {
  background: linear-gradient(135deg, #17a2b8, #138496);
  border: none;
}

.btn-light {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: none;
  color: #212529;
}

.btn-dark {
  background: linear-gradient(135deg, #343a40, #23272b);
  border: none;
}

/* Outline variants hover states */
.btn-outline-primary:hover,
.btn-outline-secondary:hover,
.btn-outline-success:hover,
.btn-outline-danger:hover,
.btn-outline-warning:hover,
.btn-outline-info:hover,
.btn-outline-light:hover,
.btn-outline-dark:hover {
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-outline-warning:hover {
  color: #212529;
}

.btn-outline-light:hover {
  color: #212529;
}

/* Small button adjustments */
.btn-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

/* Large button adjustments */  
.btn-lg {
  font-size: 1.125rem;
  padding: 0.75rem 1.5rem;
}

/* Block button */
.btn-block,
.btn.w-100 {
  width: 100%;
}

/* Disabled state */
.btn:disabled,
.btn.disabled {
  opacity: 0.65;
  pointer-events: none;
  transform: none;
  box-shadow: none;
}

/* Focus states for accessibility */
.btn:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Special button types from existing codebase */
.practice-btn {
  font-weight: 600;
}

.level-up-btn {
  font-weight: 600;
  position: relative;
}

.level-up-btn.ready-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
  }
}

.timeline-btn {
  position: relative;
  overflow: hidden;
}

.quality-btn {
  text-align: left;
}
</style>