# Common Bug Patterns & Solutions

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

## Bootstrap Modal + Vue 3 Integration Bug (2025-08-11)

**⚠️ CRITICAL BUG**: Practice Modal works correctly on first open but subsequent attempts result in unclickable quality rating buttons.

**Root Cause**: Bootstrap Modal instances are cached and remain associated with old DOM elements even when Vue components are force re-rendered with `:key` changes.

**Symptoms**:
- First modal opening: All buttons work perfectly
- Second+ modal opening: Quality buttons appear but clicks don't register
- Component-level events fire but DOM event handlers are detached
- Page refresh fixes the issue temporarily

**Technical Details**:
- `modalManager.ts` caches Bootstrap Modal instances in `modalInstances Map<string, Modal>`
- Vue's key-based re-rendering creates new DOM elements
- Cached Bootstrap instances still reference the destroyed DOM elements
- Event handlers remain bound to the old, non-existent elements

**Failed Solutions Attempted**:
1. ❌ Form reset with `watch()` on modal visibility - didn't fix event handlers
2. ❌ Changed `v-if` to `v-show` in BaseModal.vue - didn't prevent instance caching
3. ❌ Key-based component re-rendering alone - Bootstrap instances still cached

**Solution Applied**:
```typescript
// useModals.ts - showPracticeModal function
showPracticeModal: (skill: SkillData) => {
  destroyModal('practiceRatingModal') // ✅ Destroy old Bootstrap instance FIRST
  modalKey.value++                   // ✅ Force Vue component re-render  
  openModal('practice', skill)       // ✅ Create fresh Bootstrap instance
},
```

**Prevention Pattern**: For Vue components with Bootstrap modals that use key-based re-rendering:
1. **Always destroy Bootstrap instance before component re-render**
2. **Then increment component key to force Vue re-creation**
3. **Finally create new modal with fresh DOM elements**

**Files Fixed (2025-08-11)**:
- `useModals.ts:108-111`: Added `destroyModal()` call before component re-render
- Import statement updated to include `destroyModal` from `@/utils/modalManager`

## Timeline Modal Reactivity Bug Fix (2025-08-12)

**⚠️ CRITICAL BUG FIXED**: Timeline Modal didn't update with new Quick Notes after first opening - applied same fix as Practice Modal.

**Root Cause**: Same Bootstrap Modal instance caching bug that affected Practice Modal but was never fixed for Timeline Modal.

**Symptoms**:
- Quick Notes appear immediately in sidebar timeline ✅
- First Timeline Modal opening shows all notes correctly ✅ 
- Subsequent Timeline Modal openings missing newly added Quick Notes ❌
- Page refresh required to see timeline updates ❌

**Solution Applied** (identical to Practice Modal fix):
```typescript
// useModals.ts:115-119
showTimelineModal: (skill: SkillData) => {
  destroyModal('progressionTimelineModal') // ✅ Destroy old Bootstrap instance
  modalKey.value++ // ✅ Force component re-render
  openModal('timeline', skill)
},

// ModalManager.vue:25 
<TimelineModal :key="modalKey" ... />
```

**Files Fixed (2025-08-12)**:
- `useModals.ts:115-119`: Added `destroyModal()` and `modalKey.value++` before opening Timeline Modal
- `ModalManager.vue:25`: Added `:key="modalKey"` to TimelineModal component

**Root Learning**: Bootstrap's instance caching conflicts with Vue's reactivity system. Both the JavaScript Modal instance AND the Vue component must be fresh for proper event binding.

## Comprehensive Bootstrap Modal Audit Results (2025-08-12)

**⚠️ AUDIT COMPLETE**: Systematic investigation of entire codebase for Bootstrap Modal instance caching bugs and similar patterns.

### ✅ **ALL MODAL BUGS ELIMINATED**

**Fixed Modals** (all now use `destroyModal()` + `modalKey++` pattern):
1. **Practice Modal** - `useModals.ts:107-111` ✅ 
2. **Timeline Modal** - `useModals.ts:115-119` ✅
3. **Status Editor Modal** - `useModals.ts:123-127` ✅
4. **Tags Editor Modal** - `useModals.ts:130-134` ✅
5. **Notes Editor Modal** - `useModals.ts:137-141` ✅

**Template Updates** - All fixed modals have `:key="modalKey"` in `ModalManager.vue`:
- PracticeRating: Line 15 ✅
- TimelineModal: Line 25 ✅  
- StatusEditor: Line 39 ✅
- TagsEditor: Line 48 ✅
- NotesEditor: Line 57 ✅

### ✅ **COMPONENTS CONFIRMED SAFE**

**No Bootstrap Modal Usage** (different UI patterns):
- **StatusTransitionConfirmation**: Custom overlay with `v-if`, not Bootstrap Modal
- **BaseEditorModal**: Unused component (no references found)
- **All Dropdown Components**: Custom Vue-based with `useSkillCardDropdown.ts`, not Bootstrap Dropdown
- **Toast System**: Vue-based (Pinia store + components), not Bootstrap Toast
- **Markdown Editors**: `md-editor-v3` library integration, different architecture
- **InlineMarkdownEditor**: Vue `v-if`/`v-else` pattern, no external library caching

### ✅ **THIRD-PARTY LIBRARIES CHECKED**

**UI Libraries Analyzed**:
- **Bootstrap 5.3.2**: Only Modal components affected (now all fixed)
- **md-editor-v3**: Vue-integrated editor, no instance caching issues
- **No other UI libraries** with potential instance caching patterns

### 🎯 **PREVENTION PATTERN ESTABLISHED**

**Mandatory Pattern** for ALL Bootstrap modals with dynamic data:
```typescript
// useModals.ts
showModalName: (skill: SkillData) => {
  destroyModal('modalId') // Clear cached Bootstrap instance  
  modalKey.value++ // Force Vue component re-render
  openModal('modalType', skill)
}

// ModalManager.vue template
<ModalComponent :key="modalKey" ... />
```

**Root Cause Understanding**: Bootstrap caches Modal instances by DOM element ID. When Vue re-renders components (via `:key` changes), cached instances still reference destroyed DOM elements, causing event handlers to bind to non-existent elements.

### 📋 **TESTING VERIFICATION**

- **Unit Tests**: All 216 tests pass ✅
- **Manual Testing**: Dev server running, all modals function correctly ✅  
- **Type Safety**: TypeScript compilation clean ✅
- **Lint Check**: ESLint clean ✅

### 🚀 **CONCLUSION**

**STATUS**: Bootstrap Modal instance caching bug **COMPLETELY ELIMINATED** from the Modern Jive Skill Tracker codebase. All affected components fixed, no similar patterns found elsewhere. System is robust against future Bootstrap Modal caching issues.