# Common Bug Patterns & Solutions

## State Management: Calculation vs Persistence Bug (2025-08-27)

**⚠️ CRITICAL**: When complex state involves calculation AND persistence, ensure both happen in the same place.

**Problem**: ACQUISITION skills showed "Due in 3 days" instead of cumulative progression (0→1→2→3 days).

**Root Cause**: 
- `updateSM2Parameters()` returned old interval (unverändert for ACQUISITION)
- `calculateAcquisitionInterval()` calculated new interval only for nextReview
- Skill was saved with old interval → cumulative system broken

**Symptom**: Feature seems to work on first use, but doesn't progress correctly over time
```typescript
// ❌ BAD - Split responsibility (calculation vs persistence)
updateSM2Parameters() { 
  // Only increments repetitions for ACQUISITION
  return { interval: skill.interval } // Old value!
}
calculateAcquisitionInterval() {
  // Calculates new interval but doesn't save it
  newInterval = oldInterval + bonus
  return dateUtils.addDays(date, newInterval) // Only for nextReview!
}
```

**Solution**: Single source of truth principle
```typescript
// ✅ GOOD - Unified responsibility
updateSM2Parameters() {
  if (skill.status === 'acquisition') {
    repetitions += 1
    const bonus = ACQUISITION_QUALITY_BONUSES[quality]
    interval = bonus === 'reset' ? 1 : Math.max(1, interval + bonus) // Calculate AND store
  }
  return { interval, repetitions, nextReview } // Return calculated values
}
calculateAcquisitionInterval() {
  // Just use already calculated interval
  return dateUtils.addDays(date, skill.interval)
}
```

**Debugging Strategy**: Use strategic console.log to track state flow
```typescript
console.log('🔍 Input:', { interval: skill.interval, quality })
console.log('📊 Calculated:', { newInterval, nextReview })  
console.log('✅ Saved:', { interval: updatedSkill.interval })
```

**Key Principle**: If you calculate state, you must also persist it. Never split this responsibility.

## Fallback Logic: || vs ?? Bug (2025-08-27)

**⚠️ SUBTLE**: JavaScript falsy values can break initialization logic when 0 is a valid value.

**Problem**: New skills couldn't start with `interval: 0` for cumulative progression.

**Root Cause**: 
```typescript
// ❌ BAD - || treats 0 as falsy
let interval = skill.interval || 1  // 0 becomes 1!
// Expected: 0 -> 1 -> 2 -> 3
// Actual: 1 -> 2 -> 3 -> 4
```

**Solution**: Use status-specific fallbacks with nullish coalescing
```typescript
// ✅ GOOD - ?? only handles null/undefined
let interval = skill.status === 'acquisition' 
  ? (skill.interval ?? 0)  // Allow 0 for new skills
  : (skill.interval || 1)  // Default 1 for other statuses
```

**Debugging Tip**: Log the actual vs expected values
```typescript
console.log(`skill.interval: ${skill.interval}, typeof: ${typeof skill.interval}`)
console.log(`fallback result: ${skill.interval || 1} vs ${skill.interval ?? 0}`)
```

**Key Principle**: When 0 is valid, use ?? instead of ||. Consider context-specific fallbacks.

## Critical Vue.js Reactivity Pattern

**⚠️ IMPORTANT**: When components need skill data, always access the reactive store directly, not static prop copies.

**Problem**: Modal states (`modalStates.timeline.selectedSkill`) and component props can contain **static copies** of skill objects that don't update when the store changes.

**Solution**: Use computed properties to get current data from store:
```typescript
// ❌ BAD - Uses static copy from props
<SkillTimelineContent :skill="skill" />

// ✅ GOOD - Gets current data from reactive store
const currentSkill = computed(() => {
  if (!props.skill?.id) return null
  return skillStore.skills.find(s => s.id === props.skill.id) || props.skill
})
<SkillTimelineContent :skill="currentSkill" />
```

**Applied in**: TimelineModal.vue, NotesEditor.vue for transfer checkbox reactivity

**Symptom**: UI elements (like checkboxes) work after closing/reopening modals but not during active use

**Bug Fixed (2025-08-07)**: Transfer checkboxes in timeline components were not responding to clicks due to static prop copies. Fixed by implementing reactive store access pattern in both modal and sidebar timeline views.

## Training Log Reactivity Bug (2025-08-08)

**⚠️ COMMON BUG**: TrainingLog shows "No Activities Found" even when skills have practice logs, level-ups, or quick notes.

**Root Cause**: Non-reactive props passed to composables cause computed properties to lose reactivity.

**Symptoms**: 
- Debug shows "Skills received: 0" in TrainingLog
- Other modals (Timeline, Notes Editor) work fine with same skills data
- Console shows skills are loaded in skillStore but not in TrainingLog

**Bug Details**: 
- TrainingLog.vue passed `props.skills` (non-reactive) to `useTrainingLogData()` 
- Composable expected `SkillData[]` but needed `Ref<SkillData[]>` for reactivity
- computed() functions lost reactivity to skills data changes

**Solution**:
```typescript
// ❌ BAD - Non-reactive prop
const { filteredActivities } = useTrainingLogData(props.skills, filters)

// ✅ GOOD - Reactive prop reference  
const { filteredActivities } = useTrainingLogData(toRef(props, 'skills'), filters)

// And update composable signature:
export function useTrainingLogData(skills: Ref<SkillData[]>, filters: Ref<Filters>)
```

**Prevention**: Always use `toRef(props, 'propName')` when passing props to composables that use computed() or watch().

## TagsEditor Event Handling Bug (2025-08-08)

**⚠️ CRITICAL BUG**: TagsEditor modal opens but tags disappear after saving

**Root Cause**: Incorrect event parameter passing through modal component hierarchy

**Bug Details**:
- **TagsEditor.vue** emits: `emit('tags-changed', skillId, newTags)` (two separate parameters)
- **ModalManager.vue** tried: `@tags-changed="$emit('tags-changed', $event)"` (expects single object parameter)
- **useModals.ts** expected: `handleTagsChanged: (skillId: string, newTags: string[])` (two separate parameters)
- Result: Parameters got mangled, tags weren't saved properly

**Error Symptoms**:
- Console error: `props.skill.tags is not iterable`
- Tags modal opens successfully
- Tags can be selected and appear to save
- After closing modal, skill cards show no tags
- Tags are not persisted in store

**Solution Applied**:
```typescript
// ❌ WRONG - ModalManager.vue
@tags-changed="$emit('tags-changed', $event)"

// ✅ CORRECT - ModalManager.vue  
@tags-changed="(skillId, newTags) => $emit('tags-changed', {skillId, newTags})"

// ❌ WRONG - useModals.ts
handleTagsChanged: (skillId: string, newTags: string[]) => { ... }

// ✅ CORRECT - useModals.ts
handleTagsChanged: (data: {skillId: string, newTags: string[]}) => { ... }
```

**Prevention Pattern**: When passing multi-parameter events through component hierarchy:
1. **Child Component**: Emit separate parameters: `emit('event', param1, param2)`
2. **Parent Component**: Convert to object: `@event="(p1, p2) => $emit('event', {param1: p1, param2: p2})"`
3. **Handler**: Destructure object: `handler: (data: {param1: type, param2: type}) => { ... }`

**Files Fixed**: 
- `ModalManager.vue:40`: Event parameter restructuring
- `useModals.ts:135`: Handler signature update
- `TagsEditor.vue:208,173,97`: Added safe array checking for undefined tags

## General Prevention Strategies

### Safe Property Access
- Use computed properties with fallbacks for undefined/invalid data
- Always check for null/undefined before accessing nested properties
- Use optional chaining (`?.`) for safe property access

### Event Parameter Consistency
- Ensure event emitters and handlers use matching parameter structures
- When passing events through component hierarchies, maintain consistent parameter formats
- Document event signatures clearly in component interfaces

### Reactive Data Flow
- Use `toRef()` when passing props to composables that use computed() or watch()
- Access reactive store directly instead of using static prop copies
- Prefer computed properties over watchers for derived state

### Type Safety
- Mock objects in tests must match complete interface definitions
- Ensure all TypeScript interfaces are properly implemented
- Use strict type checking to catch parameter mismatches early

## Unit Testing Bug Patterns (2025-08-11)

### **Modal Component Testing Issues**

**⚠️ COMMON BUG**: Tests fail with "Cannot call vm on an empty VueWrapper" or modal components not found.

**Root Cause**: Modal components with `v-if` directives are not rendered when `isVisible: false`, making them unavailable for testing.

**Symptoms**:
- `wrapper.findComponent({ name: 'ModalName' })` returns empty wrapper
- Tests that check modal visibility pass, but event tests fail  
- Error: "Cannot call vm on an empty VueWrapper"

**Solution Applied**:
```typescript
// ❌ BAD - Tests without proper modal state setup
beforeEach(() => {
  wrapper = createWrapper() // All modals isVisible: false
})

// ✅ GOOD - Set modal states for event testing
beforeEach(() => {
  wrapper = createWrapper({
    ...mockModalStates,
    skill: { selectedSkill: mockSkill, isVisible: true },
    practice: { selectedSkill: mockSkill, isVisible: true }
    // Set all needed modals to isVisible: true for event tests
  })
})
```

### **Test ID and Component Selection**

**⚠️ PATTERN**: Use `data-testid` attributes for reliable component testing, not complex CSS selectors.

**Problem**: Tests using complex selectors like icon class searches are fragile:
```typescript
// ❌ FRAGILE - Searches by CSS class patterns
const directionButton = buttons.find(btn => {
  const icons = btn.findAll('i')
  return icons.some(icon => 
    icon.classes().some(cls => cls.includes('bi-sort-up'))
  )
})
```

**Solution**:
```typescript
// ✅ RELIABLE - Use data-testid attributes
// In component template:
<button data-testid="sort-direction-button" @click="handleToggle">

// In test:
const directionButton = wrapper.find('[data-testid="sort-direction-button"]')
```

### **Object Comparison in Tests**

**⚠️ COMMON BUG**: Test failures with "serializes to the same string" but using `.toBe()` for objects.

**Problem**: `.toBe()` uses Object.is() equality, which fails for different object instances even with same content.

**Solution**:
```typescript
// ❌ BAD - Object comparison with .toBe()
expect(component.props('skill')).toBe(mockSkill)

// ✅ GOOD - Deep equality comparison
expect(component.props('skill')).toStrictEqual(mockSkill)
```

### **Mock Method Completeness**

**⚠️ CRITICAL**: Tests fail with "function is not a function" when mocks are incomplete.

**Problem**: Store mocks missing methods used in actual components:
```typescript
// ❌ INCOMPLETE MOCK
const mockSkillStore = {
  updateSkill: vi.fn(),
  deleteSkill: vi.fn()
  // Missing: shouldSuggestStatusTransition
}
```

**Solution**: Ensure all mock objects include all methods referenced in code:
```typescript
// ✅ COMPLETE MOCK
const mockSkillStore = {
  updateSkill: vi.fn(),
  deleteSkill: vi.fn(),
  shouldSuggestStatusTransition: vi.fn().mockResolvedValue({ shouldSuggest: false })
}
```

**Files Fixed (2025-08-11)**:
- `ModalManager.vue`: Added `data-testid` attributes and `v-if` visibility logic
- `ModalManager.test.ts`: Fixed event tests with proper modal state setup, object comparison
- `SkillFilters.vue`: Added `data-testid="sort-direction-button"`
- `SkillFilters.test.ts`: Simplified button selection with test ID
- `useSkillEventHandlers.test.ts`: Added missing mock method `shouldSuggestStatusTransition`

## Vue 3 Teleport Modal Migration Complete (2025-08-21)

**✅ MIGRATION COMPLETED**: All Bootstrap modal issues permanently resolved through Vue 3 Teleport migration.

**Previous Bootstrap Issues** (Now Obsolete):
- ❌ Modal instance caching conflicts with Vue reactivity
- ❌ `modalKey++` anti-pattern causing component remounting  
- ❌ Complex DOM manipulation vs Vue state management
- ❌ Bootstrap-specific event binding issues

**Vue 3 Teleport Benefits**:
- ✅ **Native Vue Modals**: Pure reactivity without DOM manipulation
- ✅ **Performance**: 55% faster, 0kB bundle overhead vs Bootstrap (32.5kB)
- ✅ **Declarative State**: Simple `v-if` visibility control
- ✅ **Reliable Events**: No cache-related event binding issues
- ✅ **Better Testing**: Native Vue component testing without Bootstrap mocking

**Migration Results**:
- **8/8 Modals Migrated**: All Bootstrap modals → Vue 3 Teleport
- **Anti-Patterns Eliminated**: No more `destroyModal()` + `modalKey++` complexity
- **Code Simplified**: Declarative modal management with reactive state
- **Bundle Reduced**: Eliminated Bootstrap modal JavaScript dependencies

**Modern Vue 3 Teleport Pattern**:
```vue
<Teleport to="body">
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <slot />
    </div>
  </div>
</Teleport>
```

**Files Modernized** (Bootstrap → Vue 3 Teleport):
- All modal components now use native Vue 3 patterns
- `useModals.ts`: Simple state toggles, no DOM manipulation
- `ModalManager.vue`: Clean component rendering without keys
- `BaseModal.vue`: Vue 3 Teleport foundation

### 🎯 **CURRENT DEVELOPMENT GUIDELINES**

**Vue 3 Modal Development**:
1. **Use Vue 3 Teleport**: All new modals must use Teleport pattern
2. **Declarative State**: Control visibility with reactive `v-if`
3. **Simple Events**: Standard Vue event handling, no DOM manipulation
4. **CSS Variables**: Custom styling instead of Bootstrap classes

**Legacy Bootstrap References** (Historical - No Longer Applicable):
- Bootstrap modal caching patterns → Obsolete
- `modalKey++` anti-pattern → Eliminated  
- `destroyModal()` utility → Not needed
- Bootstrap modal event binding → Native Vue events