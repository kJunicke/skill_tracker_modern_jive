import { computed, type Ref } from 'vue'

export function useCharacterCounter(text: Ref<string>, maxLength?: number) {
  const characterCount = computed(() => text.value.length)
  
  const isOverLimit = computed(() => {
    return maxLength ? characterCount.value > maxLength : false
  })
  
  const remainingCharacters = computed(() => {
    return maxLength ? maxLength - characterCount.value : Infinity
  })
  
  const percentageFull = computed(() => {
    return maxLength ? (characterCount.value / maxLength) * 100 : 0
  })
  
  const counterColor = computed(() => {
    if (!maxLength) return 'text-muted'
    
    const percentage = percentageFull.value
    if (percentage >= 100) return 'text-danger'
    if (percentage >= 80) return 'text-warning'
    return 'text-muted'
  })

  return {
    characterCount,
    isOverLimit,
    remainingCharacters,
    percentageFull,
    counterColor
  }
}