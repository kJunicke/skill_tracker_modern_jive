import { ref, computed } from 'vue'

export function useArrayToggle(initialItems: string[] = []) {
  const items = ref<string[]>([...initialItems])

  const toggle = (item: string) => {
    const index = items.value.indexOf(item)
    if (index > -1) {
      items.value.splice(index, 1)
    } else {
      items.value.push(item)
    }
  }

  const add = (item: string) => {
    if (!items.value.includes(item)) {
      items.value.push(item)
    }
  }

  const remove = (item: string) => {
    const index = items.value.indexOf(item)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const includes = (item: string) => {
    return items.value.includes(item)
  }

  const clear = () => {
    items.value = []
  }

  const set = (newItems: string[]) => {
    items.value = [...newItems]
  }

  const count = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  return {
    items,
    toggle,
    add,
    remove,
    includes,
    clear,
    set,
    count,
    isEmpty
  }
}