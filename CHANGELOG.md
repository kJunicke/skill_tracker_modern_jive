# CHANGELOG

## 2025-08-18 - Status Transition Modal Fix

### = Bug Fixes
- **Fixed missing status transition modal at level 5**: Skills no longer automatically transition from acquisition to maintenance mode without user choice
- **Practice session flow**: Added status transition check after practice sessions to show user choice modal
- **Service layer filtering**: Modified automatic transition logic to be suggestion-based for user-facing transitions

### =' Technical Changes
- **useModals.ts**: Added async status transition check in `handlePracticeComplete` function
- **SkillService.ts**: Filtered out user-facing transitions (acquisition ’ maintenance at level 5) from automatic application
- **Quality assurance**: All 230 unit tests passing, TypeScript and ESLint clean

### <¯ User Experience
- Users now get a choice modal when reaching level 5 in acquisition mode
- Can choose to stay in acquisition mode or transition to maintenance mode
- Manual level-ups continue to work as expected
- Background transitions (focus timeout) still work automatically