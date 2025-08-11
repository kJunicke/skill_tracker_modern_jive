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