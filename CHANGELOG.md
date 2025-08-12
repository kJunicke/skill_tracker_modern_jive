# Changelog

All notable changes to the Modern Jive Skill Tracker project will be documented in this file.

## [2025-08-12] - Bootstrap Modal Bugs Eliminated 

### Fixed
- **Bootstrap Modal Instance Caching Bug**: Complete elimination from codebase
  - Fixed Practice Modal, Timeline Modal, StatusEditor, TagsEditor, NotesEditor
  - Applied `destroyModal()` + `modalKey++` pattern to all 5 modals with dynamic data
  - Updated `useModals.ts:107-141` and `ModalManager.vue` with `:key="modalKey"` props

### Enhanced
- **Comprehensive Audit**: Systematic investigation of entire codebase for similar patterns
- **Prevention Pattern**: Established mandatory Bootstrap Modal fix pattern for future development
- **Documentation**: Complete audit results documented in `docs/BUG_PATTERNS.md:299-362`

### Verified
- All 216 unit tests pass 
- TypeScript compilation clean 
- ESLint clean 
- Manual testing complete 

### Files Modified
- `src/composables/useModals.ts`: Applied destroyModal pattern to 5 modal functions
- `src/components/layout/ModalManager.vue`: Added `:key="modalKey"` to all dynamic modals
- `src/composables/__tests__/useModals.test.ts`: Updated mocks for new dependencies
- `docs/BUG_PATTERNS.md`: Added comprehensive audit section
- `TODO.md`: Updated audit task as FULLY COMPLETED
- `CLAUDE.md`: Updated current status and robustness notes

## [2025-08-11] - Toast System & PWA Deployment

### Added
- **Complete Toast Notification System**: 4 variants with comprehensive testing
- **GitHub Pages PWA Deployment**: Live production deployment
- **Enhanced Test Coverage**: 216 unit tests with 90%+ coverage

### Fixed
- **Timeline Modal Reactivity Bug**: Quick Notes now appear immediately in modal
- **Practice Modal Bug**: Bootstrap Modal instance caching issue resolved

## [2025-08-09] - 5-Status Learning System

### Added
- **BACKLOG**: Skill collection (Level 0)
- **ACQUISITION**: Fixed 1-2-3 day intervals (Level 1-4)
- **MAINTENANCE**: SM2 spaced repetition (Level 5+)
- **FOCUS**: XP-based daily practice suggestions
- **ARCHIVED**: Inactive skills management

### Enhanced
- **Component Architecture**: Massive refactoring with 32% to 84% code reduction
- **Service Layer**: Complete separation with dependency injection
- **Professional Testing**: 1,355+ lines of comprehensive unit tests