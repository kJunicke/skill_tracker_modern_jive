<template>
  <div class="level-badge-container">
    <!-- Left decorative elements -->
    <div class="decorative-left">
      <i 
        v-for="i in getDecorativeCount()"
        :key="`left-${i}`"
        :class="['bi', getDecorativeIcon(), 'decorative-element', getLevelColorClass()]"
      ></i>
    </div>

    <!-- Main level badge -->
    <div 
      :class="[
        'level-badge',
        getLevelClass(),
        skillId ? 'clickable-level' : ''
      ]"
      @click="skillId ? handleLevelClick() : null"
      :style="skillId ? 'cursor: pointer;' : ''"
      :title="getLevelTitle()"
    >
      <span class="level-number">{{ level }}</span>
      <!-- Hover arrow for level up -->
      <div v-if="skillId" class="level-up-arrow">
        <i class="bi bi-caret-up-fill"></i>
      </div>
    </div>

    <!-- Right decorative elements -->
    <div class="decorative-right">
      <i 
        v-for="i in getDecorativeCount()"
        :key="`right-${i}`"
        :class="['bi', getDecorativeIcon(), 'decorative-element', getLevelColorClass()]"
      ></i>
    </div>

  </div>
</template>

<script setup lang="ts">
// Component for displaying skill level badges with decorative elements

interface Props {
  level: number
  skillId?: string
}

interface Emits {
  (e: 'level-up'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get CSS class for level styling based on level ranges
const getLevelClass = () => {
  const level = props.level
  
  if (level === 0) {
    return 'level-unlearned'
  } else if (level === 1) {
    return 'level-1'
  } else if (level === 2) {
    return 'level-2'
  } else if (level === 3) {
    return 'level-3'
  } else if (level === 4) {
    return 'level-4'
  } else if (level === 5) {
    return 'level-5'
  } else if (level <= 9) {
    return 'level-advanced'
  } else if (level <= 19) {
    return 'level-expert'
  } else if (level <= 49) {
    return 'level-master'
  } else {
    return 'level-legend'
  }
}

// Get color class for decorative elements
const getLevelColorClass = () => {
  const level = props.level
  
  if (level === 0) {
    return 'text-danger'
  } else if (level === 1) {
    return 'text-warning'
  } else if (level === 2) {
    return 'text-info'
  } else if (level === 3) {
    return 'text-success'
  } else if (level === 4) {
    return 'text-primary'
  } else if (level === 5) {
    return 'text-secondary'
  } else if (level <= 9) {
    return 'text-success'
  } else if (level <= 19) {
    return 'text-info'
  } else if (level <= 49) {
    return 'text-danger'
  } else {
    return 'text-primary'
  }
}

// Get decorative icon based on 5-level progression system
const getDecorativeIcon = () => {
  const level = props.level
  
  if (level === 0) {
    return null // No decorations for unlearned
  } else if (level <= 5) {
    return 'bi-circle-fill' // Dots for levels 1-5
  } else if (level <= 10) {
    return 'bi-star-fill' // Stars for levels 6-10
  } else if (level <= 15) {
    return 'bi-gem' // Diamonds for levels 11-15
  } else if (level <= 20) {
    return 'bi-shield-fill' // Shields for levels 16-20
  } else if (level <= 25) {
    return 'bi-trophy-fill' // Trophies for levels 21-25
  } else if (level <= 30) {
    return 'bi-crown-fill' // Crowns for levels 26-30
  } else if (level <= 35) {
    return 'bi-diamond-fill' // Jewels for levels 31-35
  } else if (level <= 40) {
    return 'bi-lightning-fill' // Lightning for levels 36-40
  } else if (level <= 45) {
    return 'bi-fire' // Fire for levels 41-45
  } else {
    return 'bi-magic' // Magic symbols for levels 46+ (stays constant)
  }
}

// Get number of decorative elements (1-3 based on level range)
const getDecorativeCount = () => {
  const level = props.level
  
  if (level === 0) {
    return 0 // No decorations for unlearned
  } else if (level <= 10) {
    return 1 // 1 element each side for basic levels
  } else if (level <= 25) {
    return 2 // 2 elements each side for intermediate levels
  } else {
    return 3 // 3 elements each side for high levels
  }
}

// Get tooltip text
const getLevelTitle = () => {
  const level = props.level
  const baseText = (() => {
    if (level === 0) {
      return 'Level 0 - Not learned'
    } else if (level === 1) {
      return `Level ${level} - First Step`
    } else if (level === 2) {
      return `Level ${level} - Building Basics`
    } else if (level === 3) {
      return `Level ${level} - Getting Better`
    } else if (level === 4) {
      return `Level ${level} - Making Progress`
    } else if (level === 5) {
      return `Level ${level} - Solid Foundation`
    } else if (level <= 9) {
      return `Level ${level} - Advanced`
    } else if (level <= 19) {
      return `Level ${level} - Expert`
    } else if (level <= 49) {
      return `Level ${level} - Master`
    } else {
      return `Level ${level} - Legend`
    }
  })()
  
  return props.skillId ? `${baseText} - Click to level up!` : baseText
}

// Handle level click - opens level up modal with comment requirement
const handleLevelClick = () => {
  if (props.skillId) {
    emit('level-up')
  }
}
</script>

<style scoped>
.level-badge-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 32px;
  border-radius: 20px;
  font-weight: bold;
  position: relative;
  transition: all 0.2s ease-in-out;
  border: 2px solid;
}

.level-number {
  font-size: 1.1rem;
  font-weight: 700;
}

.decorative-left,
.decorative-right {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.decorative-element {
  font-size: 0.6rem;
  opacity: 0.8;
  transition: all 0.2s ease-in-out;
}


/* Level styling based on ranges */
.level-unlearned {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-color: #dc3545;
  color: #dc3545;
}

/* Distinct styling for first 5 levels */
.level-1 {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  border-color: #ffc107;
  color: #856404;
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.2);
}

.level-2 {
  background: linear-gradient(135deg, #cff4fc, #b6effb);
  border-color: #17a2b8;
  color: #0c5460;
  box-shadow: 0 2px 4px rgba(23, 162, 184, 0.25);
}

.level-3 {
  background: linear-gradient(135deg, #d1f2eb, #a7f3d0);
  border-color: #28a745;
  color: #155724;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

.level-4 {
  background: linear-gradient(135deg, #cce7ff, #a7d8f0);
  border-color: #007bff;
  color: #004085;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.35);
}

.level-5 {
  background: linear-gradient(135deg, #e2e3e5, #c6c8ca);
  border-color: #6c757d;
  color: #495057;
  box-shadow: 0 2px 6px rgba(108, 117, 125, 0.4);
  position: relative;
}

.level-5::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #6c757d, #adb5bd, #6c757d);
  border-radius: 22px;
  z-index: -1;
  opacity: 0.2;
}

.level-advanced {
  background: linear-gradient(135deg, #d1f2eb, #a7f3d0);
  border-color: #28a745;
  color: #155724;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}

.level-expert {
  background: linear-gradient(135deg, #cce7ff, #a7d8f0);
  border-color: #007bff;
  color: #004085;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.level-master {
  background: linear-gradient(135deg, #ffe6e6, #ffb3b3);
  border-color: #dc3545;
  color: #721c24;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.4);
  position: relative;
}

.level-master::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #dc3545, #e74c3c, #dc3545);
  border-radius: 22px;
  z-index: -1;
  opacity: 0.3;
}

.level-legend {
  background: linear-gradient(135deg, #e6e6ff, #d1c4e9);
  border-color: #6f42c1;
  color: #3d1a5b;
  box-shadow: 0 3px 12px rgba(111, 66, 193, 0.5);
  position: relative;
}

.level-legend::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, #6f42c1, #9c5bff, #6f42c1, #8e44ad);
  border-radius: 25px;
  z-index: -1;
  opacity: 0.4;
}

/* Clickable level effects */
.clickable-level {
  cursor: pointer;
  position: relative;
}

.clickable-level:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Level up arrow that appears on hover */
.level-up-arrow {
  position: absolute;
  top: -25px;
  right: -8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
  pointer-events: none;
}

.level-up-arrow i {
  color: #198754;
  font-size: 2rem;
  font-weight: 900;
}

.clickable-level:hover .level-up-arrow {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  animation: levelUpBounce 0.6s ease-out;
}

@keyframes levelUpBounce {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

/* Hover effects for container */
.level-badge-container:hover .decorative-element {
  opacity: 1;
  transform: scale(1.1);
}
</style>