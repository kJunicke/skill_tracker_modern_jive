# CHANGELOG

## 2025-08-18 - Spaced Repetition System Refactoring

### =% Major Changes
- **BREAKING**: Removed deprecated `utils/spacedRepetition.ts` - replaced by unified SpacedRepetitionService
- **FIXED**: ACQUISITION mode now correctly shows 1-2-3 day intervals instead of 6 days
- **UNIFIED**: All practice sessions now use consistent SkillService ’ SpacedRepetitionService flow

### = Bug Fixes
- Fixed ACQUISITION interval calculation bug causing wrong day displays in SkillCards
- Fixed index offset in calculateAcquisitionInterval (was showing 2-3-1 instead of 1-2-3 pattern)
- Corrected inconsistent spaced repetition logic between UI components and modal displays

### = Refactoring
- **useModalEventHandlers**: Now uses `skillStore.recordPracticeSession()` instead of deprecated utils
- **PracticeRating.vue**: Updated to use SpacedRepetitionService for interval calculations
- **SkillCard components**: All now use unified SpacedRepetitionService.getDaysUntilReview()
- **Test suite**: Updated to use real date calculations instead of mocked deprecated functions

### =Ê Testing
- Added comprehensive ACQUISITION mode interval testing
- Fixed SkillCard and SkillCardStatus test cases to use dynamic dates
- All 232 tests passing with new unified system

### ¡ Performance
- Eliminated duplicate spaced repetition calculations
- Removed conflicting code paths for practice session handling
- Streamlined data flow: UI ’ skillStore ’ SkillService ’ SpacedRepetitionService

### <¯ Technical Details
- ACQUISITION intervals now correctly cycle through [1, 2, 3] days
- Fixed repetitions-based indexing: `intervalIndex = (repetitions - 1)`
- Maintained automatic ACQUISITION ’ MAINTENANCE transition at Level 5
- All components use consistent getDaysUntilReview implementation
