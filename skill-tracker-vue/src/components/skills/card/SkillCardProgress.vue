<template>
  <div class="skill-card-progress">
    <!-- Star rating -->
    <div class="mb-2 text-center">
      <StarRating 
        :level="skill.level" 
        :skill-id="skill.id"
      />
    </div>

    <!-- Focus mode progress -->
    <div v-if="skill.status === 'focus' && skill.focusData" class="mb-2">
      <div class="progress" style="height: 4px;">
        <div 
          class="progress-bar bg-danger" 
          :style="`width: ${focusProgress}%`"
        ></div>
      </div>
      <small class="text-muted">
        XP: {{ skill.focusData.currentXP }}/{{ skill.focusData.targetXP }}
        <span v-if="skill.focusData.readyForLevelUp" class="text-success ms-1">
          <i class="bi bi-check-circle"></i> Ready!
        </span>
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SkillData } from '@/types/skill'
import StarRating from '@/components/ui/StarRating.vue'

interface Props {
  skill: SkillData
}

const props = defineProps<Props>()

const focusProgress = computed(() => {
  if (!props.skill.focusData) return 0
  return Math.min(100, (props.skill.focusData.currentXP / props.skill.focusData.targetXP) * 100)
})

// Level-up functionality removed - now handled through unified practice/level-up system
</script>

<style scoped>
.progress {
  background-color: #e9ecef;
  border-radius: 2px;
}

.progress-bar {
  transition: width 0.6s ease;
}
</style>