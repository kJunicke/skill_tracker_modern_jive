# XP System Architecture

## Overview

The Focus Mode XP system has been fully centralized to eliminate hardcoded values and provide a single source of truth for all XP calculations throughout the application.

## Central Function

**Location**: `src/utils/focusDataHelpers.ts`

```typescript
/**
 * Central XP calculation function - used by all parts of the application
 */
export function calculateTargetXP(level: number): number {
  return Math.floor(3 * 2 + level / 3)
}
```

## Current Formula (2025-08-12)

**Formula**: `Math.floor(3 * 2 + level / 3)`

**Examples**:
- Level 1: `Math.floor(6 + 0.33) = 6 XP`
- Level 2: `Math.floor(6 + 0.67) = 6 XP`  
- Level 3: `Math.floor(6 + 1.00) = 7 XP`
- Level 5: `Math.floor(6 + 1.67) = 7 XP`
- Level 15: `Math.floor(6 + 5.00) = 11 XP`

## System Integration

### Services Using Central Function
- **SpacedRepetitionService.ts** - Core SM2 algorithm service
- **spacedRepetition.ts** - Utility functions
- **useModalEventHandlers.ts** - Modal event handling

### Test Data Using Central Function
- **testData.ts** - Main test fixtures
- **mockData.ts** - Mock data helpers
- **SpacedRepetitionService.test.ts** - Service tests
- **SkillService.test.ts** - Skill service tests
- **AnalyticsService.test.ts** - Analytics tests

### Helper Functions
- **createDefaultFocusData(level)** - Creates focus data with correct targetXP
- **initializeFocusData(existingData, level)** - Initializes focus data with level-specific XP

## Benefits of Centralization

### ✅ Single Source of Truth
- Only one function to modify when changing XP formula
- Eliminates inconsistencies across codebase
- Automatic propagation to all dependent systems

### ✅ Zero Hardcoded Values
- No XP values hardcoded in tests or services
- All calculations derive from central function
- Formula changes apply universally

### ✅ Maintainable
- Change formula once, entire system updates
- Reduced risk of missing updates in scattered locations
- Clear documentation of XP calculation logic

### ✅ Testable
- All 216 tests automatically adapt to formula changes
- Only expectation values need updating (not implementations)
- Consistent test data across all test files

## Making Formula Changes

### Step 1: Update Central Function
Modify only the return statement in `focusDataHelpers.ts`:

```typescript
export function calculateTargetXP(level: number): number {
  return Math.floor(/* YOUR NEW FORMULA HERE */)
}
```

### Step 2: Update Test Expectations
Run tests and update any failing expectation values:

```bash
npm run test:unit
```

### Step 3: Verify System
Confirm all systems work with new formula:

```bash
npm run test:unit
npm run type-check
npm run lint
npm run dev
```

## Migration History

**Before Centralization**:
- XP values scattered across multiple files
- Formula: `Math.floor(3 * 2 + level / 5)`
- Hardcoded values in tests, services, and mock data
- Changes required updating 15+ locations

**After Centralization (2025-08-12)**:
- Single function in `focusDataHelpers.ts`
- Formula: `Math.floor(3 * 2 + level / 3)` 
- Zero hardcoded values
- Changes require updating only 1 location + test expectations

## Testing Coverage

- ✅ **216 tests passing** with centralized system
- ✅ **All services** use central function
- ✅ **All test data** derives from central function
- ✅ **Type safety** maintained throughout
- ✅ **ESLint clean** with centralized approach