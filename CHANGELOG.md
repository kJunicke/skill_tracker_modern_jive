# Changelog - Session 2025-08-21

## Bug Fixes

### Fixed SkillModal Bootstrap Instance Caching Bug
**Issue**: SkillModal retained form data between openings - when adding a second skill, the modal showed data from the first skill instead of a clean form.

**Root Cause**: SkillModal was not using the Bootstrap Modal instance caching fix pattern that was already implemented for all other modals (Practice, Timeline, Status, Tags, Notes).

**Solution Applied**:
1. **useModals.ts** (Lines 104-112): Added `destroyModal('skillModal')` + `modalKey.value++` pattern to both `showAddSkillModal()` and `showEditSkillModal()` functions
2. **ModalManager.vue** (Line 6): Added `:key="modalKey"` to SkillModal component to enable force re-rendering

**Pattern Consistency**: All modals now use the same proven Bootstrap Modal + Vue 3 integration pattern documented in BUG_PATTERNS.md.

**Verification**: Manual testing confirmed - adding multiple skills now works correctly with clean form on each opening.

## Files Modified
- `src/composables/useModals.ts` - Applied Bootstrap instance reset pattern
- `src/components/layout/ModalManager.vue` - Added key-based re-rendering

## Related Documentation
- Bug pattern documented in `docs/BUG_PATTERNS.md` (Lines 226-361)
- Fix follows established pattern used by all other modals since 2025-08-11