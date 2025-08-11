import { ref, watch } from 'vue'
import type { SkillData } from '@/types/skill'

export function useEditorModal<T>(
  props: { skill: SkillData | null; isVisible: boolean },
  initialValueGetter: (skill: SkillData) => T,
  validator?: (value: T, skill: SkillData) => boolean
) {
  const editedValue = ref<T>()
  const hasChanges = ref(false)

  const resetForm = () => {
    if (props.skill) {
      editedValue.value = initialValueGetter(props.skill)
      hasChanges.value = false
    }
  }

  const canSave = ref(false)
  
  watch(
    () => [editedValue.value, props.skill],
    () => {
      if (!props.skill) {
        canSave.value = false
        return
      }
      
      const isValid = validator ? validator(editedValue.value as T, props.skill) : true
      const isDifferent = JSON.stringify(editedValue.value) !== JSON.stringify(initialValueGetter(props.skill))
      
      canSave.value = isValid && isDifferent
      hasChanges.value = isDifferent
    },
    { deep: true }
  )

  watch(() => props.skill, resetForm, { immediate: true })

  return {
    editedValue,
    hasChanges,
    canSave,
    resetForm
  }
}