import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for managing dropdown state in SkillCard components
 * Handles open/close state and automatic closing on outside clicks
 */
export function useSkillCardDropdown() {
  const dropdownOpen = ref(false)
  
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value
  }
  
  const closeDropdown = () => {
    dropdownOpen.value = false
  }
  
  const openDropdown = () => {
    dropdownOpen.value = true
  }
  
  // Close dropdown when clicking outside
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.dropdown')) {
      closeDropdown()
    }
  }
  
  // Close dropdown on escape key
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })
  
  return {
    dropdownOpen,
    toggleDropdown,
    closeDropdown,
    openDropdown
  }
}