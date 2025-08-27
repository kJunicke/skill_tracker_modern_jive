# Fallback Patterns Documentation

This document catalogs all fallback patterns identified in the Modern Jive Skill Tracker codebase. All fallbacks now include console logging for debugging and error identification.

## Fallback Pattern Categories

### 1. Logical OR (`||`) Fallbacks
These are the most common fallback patterns, providing default values when properties are falsy.

#### SpacedRepetitionService.ts
```typescript
// SM2 parameter fallbacks
let easeFactor = skill.easeFactor || 2.5
let interval = skill.interval || 1  
let repetitions = skill.repetitions || 0

// Focus data initialization
const existingFocusData = skill.focusData || defaultFocusData

// Training schedule fallback
const lastPracticedDate = skill.lastPracticed || dateUtils.now()
```

#### AnalyticsService.ts
```typescript
// Array length fallbacks for statistics
const practiceCount = skill.practiceLog?.length || 0
const levelUpCount = skill.progressionHistory?.length || 0
const recentSessions = skill.practiceLog?.slice(-10) || []

// Focus progression fallbacks
const isReadyForLevelUp = skill.focusData?.readyForLevelUp || false
```

#### SkillService.ts
```typescript
// Default spaced repetition mode
spacedRepetitionMode: data.spacedRepetitionMode || 'daily'

// Skill validation fallbacks  
if (!data.name || data.name.trim().length === 0) // Name validation
```

### 2. Nullish Coalescing (`??`) Fallbacks
Used for precise null/undefined checks, allowing falsy values like 0.

#### SpacedRepetitionService.ts
```typescript
// Acquisition interval calculation (allows 0 values)
let interval = skill.status === 'acquisition' ? (skill.interval ?? 0) : (skill.interval || 1)

// Toast duration fallbacks
duration: toastOptions.duration ?? 5000
```

### 3. Optional Chaining (`?.`) Patterns
Safely access nested properties that might be undefined.

#### Throughout Codebase
```typescript
// Array access patterns
skill.practiceLog?.forEach(...)
skill.quickNotes?.filter(...)
const count = skill.progressionHistory?.length

// Method calls on potentially undefined objects
editorRef.value?.focus()
const files = (event.target as HTMLInputElement).files?.[0]
```

### 4. Object/Array Lookup Fallbacks
Fallbacks for dictionary/array lookups with unknown keys.

#### qualityUtils.ts
```typescript
// Quality configuration lookup
return QUALITY_CONFIG[quality as QualityLevel] || FALLBACK_CONFIG
```

#### TrainingLogTimeline.vue
```typescript
// UI mapping fallbacks
return colors[type] || 'bg-secondary'
return icons[type] || 'bi-circle'  
return xpValues[quality] || 0
```

#### modalManager.ts
```typescript
// Bootstrap modal instance fallback
const modal = modalInstances.get(elementId) || Modal.getInstance(element)
```

### 5. Try-Catch Error Fallbacks
Error handling with fallback behaviors.

#### Throughout Services
```typescript
try {
  // Risky operation
  return await storageService.operation()
} catch (error) {
  console.error('Operation failed:', error)
  // Fallback behavior
  return defaultValue
}
```

#### SpacedRepetitionService.ts
```typescript
try {
  // Access training schedule from store
  if (store && store.trainingSchedule) {
    this.trainingScheduleService.setTrainingDays(store.trainingSchedule.trainingDays)
  }
} catch {
  // Fallback to default training days
  console.warn('Could not access training schedule store, using default training days')
}
```

### 6. Ternary/Conditional Fallbacks
Complex conditional logic with fallbacks.

#### Various Components
```typescript
// Status-based fallbacks
const nextReview = skill.status === 'backlog' || skill.status === 'archived' 
  ? dateUtils.addDays(dateUtils.now(), 3650) // 10 years
  : calculateNextReview(skill)

// UI display fallbacks  
:class="['btn btn-sm', localFilters.showPractice ? 'btn-success' : 'btn-outline-success']"
```

## Fallback Logging Standards

### Required Log Format
All fallbacks MUST use this standardized logging format:

```typescript
console.warn(`[FALLBACK] ServiceName.methodName: Missing ${property} for ${identifier}, using ${fallbackValue}. Reason: ${typeof property} or specific reason.`)
```

### Examples of Proper Logging

#### Good Examples ✅
```typescript
// SpacedRepetitionService fallbacks
if (!easeFactor) {
  console.warn(`[FALLBACK] SpacedRepetitionService.updateSM2Parameters: Missing easeFactor for skill "${skill.name}", using default 2.5. Reason: easeFactor is undefined or null.`)
  easeFactor = 2.5
}

// Quality lookup fallbacks
if (!config) {
  console.warn(`[FALLBACK] qualityUtils.getQualityConfig: Invalid quality value "${quality}", using fallback config. Expected 1-4.`)
  return FALLBACK_CONFIG
}
```

#### Bad Examples ❌
```typescript
// Silent fallbacks (NOT ALLOWED)
const easeFactor = skill.easeFactor || 2.5
const config = QUALITY_CONFIG[quality] || FALLBACK_CONFIG
```

## Benefits of Logged Fallbacks

1. **Debugging**: Quickly identify when fallbacks are triggered
2. **Data Quality**: Detect missing or invalid data patterns  
3. **Performance**: Identify frequently triggered fallbacks that may indicate data issues
4. **Monitoring**: Track fallback usage in production for system health
5. **Development**: Understand data flow and edge cases during development

## Fallback Categories by Frequency

### High Frequency (Expected)
- SM2 parameter initialization for new skills
- UI component default values  
- Empty array/object initialization

### Medium Frequency (Monitor) 
- Missing optional properties
- User input validation fallbacks
- API response handling

### Low Frequency (Investigate)
- Core data missing (should rarely happen)
- System state fallbacks
- Emergency fallbacks for critical failures

## Maintenance Guidelines

1. **Add Logging**: All new fallbacks must include proper logging
2. **Review Logs**: Regularly review fallback logs in development
3. **Monitor Production**: Track fallback frequency in production environments
4. **Update Documentation**: Keep this document updated when adding new fallback patterns
5. **Test Coverage**: Ensure tests cover fallback scenarios

## File Locations of Major Fallbacks

### Core Services
- `src/services/core/SpacedRepetitionService.ts` - 15+ fallbacks
- `src/services/core/AnalyticsService.ts` - 8+ fallbacks  
- `src/services/core/SkillService.ts` - 5+ fallbacks
- `src/services/core/StorageService.ts` - 10+ fallbacks

### UI Components
- `src/components/analytics/TrainingLogTimeline.vue` - 6+ fallbacks
- `src/utils/qualityUtils.ts` - 2+ fallbacks
- `src/utils/modalManager.ts` - 2+ fallbacks

### Stores and Composables
- `src/stores/skillStore.ts` - 8+ fallbacks
- `src/stores/toastStore.ts` - 4+ fallbacks
- `src/composables/useSkillTimeline.ts` - 6+ fallbacks
- `src/composables/useTrainingLogData.ts` - 4+ fallbacks

Total identified fallbacks: **80+** across the entire codebase.

---

**Last Updated**: 2025-08-27
**Status**: All major fallbacks now include logging for debugging support.