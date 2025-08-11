import { ref, computed } from 'vue'

export function useStepNavigation(totalSteps: number) {
  const currentStep = ref(1)

  const progressPercentage = computed(() => {
    return (currentStep.value / totalSteps) * 100
  })

  const canGoNext = ref(true)
  const canGoPrevious = computed(() => currentStep.value > 1)
  const isLastStep = computed(() => currentStep.value === totalSteps)
  const isFirstStep = computed(() => currentStep.value === 1)

  const nextStep = () => {
    if (currentStep.value < totalSteps && canGoNext.value) {
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      currentStep.value = step
    }
  }

  const resetToFirstStep = () => {
    currentStep.value = 1
  }

  return {
    currentStep,
    progressPercentage,
    canGoNext,
    canGoPrevious,
    isLastStep,
    isFirstStep,
    nextStep,
    previousStep,
    goToStep,
    resetToFirstStep
  }
}