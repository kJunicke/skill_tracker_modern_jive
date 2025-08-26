# CLAUDE.md

This file provides guidance to Claude Code when working with the Modern Jive Skill Tracker repository.

## Project Overview

**Modern Jive Skill Tracker** is a scientifically-backed, gamified learning platform for social dance training. Built with Vue.js 3 and TypeScript, it combines evidence-based learning methods (SM2 spaced repetition) with modern gamification.

**Mission:** Transform how social dancers approach learning and skill development through data-driven training and reflective practice.

### 5-Status Learning System (FULLY IMPLEMENTED)
- **BACKLOG** (Level 0): Skill collection - no algorithms applied
- **ACQUISITION** (Level 1-4): Fixed 1-2-3 day intervals for skill building
- **MAINTENANCE** (Level 5+): Standard SM2 algorithm for retention
- **FOCUS** (Overlay on Maintenance): Daily practice suggestions with XP progression
- **ARCHIVED** (Level 5+): Inactive skills - no algorithms applied

**Key Transitions**: ACQUISITION → MAINTENANCE at Level 5, FOCUS → MAINTENANCE after 7 days without practice

### Current Status (2025-08-25)
- **Production-Ready**: Complete 5-status learning system deployed as PWA
- **Live Deployment**: https://github.com/kJunicke/skill_tracker_modern_jive
- **Quality Assured**: 241+ unit tests passing, TypeScript strict mode, ESLint clean, 90%+ coverage
- **Feature Complete**: Dark mode, data backup, toast notifications, timeline filtering, centralized XP system
- **Major Refactoring**: Unified spaced repetition system - ACQUISITION mode now correctly shows 1-2-3 day intervals
- **Latest Feature**: **Unified Practice & Level-Up System** - Single interface combining practice sessions and level-ups
- **Bug Fixes**: Fixed inconsistent interval calculations and timeline display issues
- **Code Cleanup**: Removed unused components and deprecated code (275+ lines cleaned up)
- **LATEST (2025-08-26)**: **BaseTeleportModal Migration COMPLETED** - All 8 modals successfully consolidated into shared BaseTeleportModal component. Achieved ~1200 lines code reduction (40% average), DRY principle implementation, unified modal architecture, and improved maintainability. Quality assured: 241 tests passing, TypeScript clean, ESLint clean, production builds successful.
- **Previous (2025-08-26)**: **CSS Architecture Cleanup COMPLETED** - Successfully removed all `!important` from modal.css base classes, restoring natural CSS specificity. Modal sizing now works correctly - NotesEditor timeline lg→xl expansion (800px→1200px) functions properly.
- **Previous (2025-08-25)**: **Vue 3 Teleport Modal Migration COMPLETED** - All 8 modals successfully migrated from Bootstrap to Vue 3 Teleport architecture. Achieved 55% performance improvement, eliminated 32.5kB bundle overhead, removed anti-patterns (modalKey++/destroyModal), and established modern declarative modal management. Comprehensive modal analysis completed with 28 improvement opportunities identified for future enhancement.
- **Previous**: **Test Suite Stabilization** - Fixed failing PracticeRating component tests that were blocking deployment. All 241 tests now pass, ensuring stable CI/CD pipeline.
- **Previous**: **SkillModal Bootstrap Instance Caching Fix** - Fixed bug where SkillModal retained form data between openings, preventing users from adding multiple skills.
- **Code Quality**: Fixed ESLint TypeScript warnings, updated test suite for Vue 3 Teleport patterns

## Documentation Index

**📋 Project Management:**
- **[TODO.md](./TODO.md)** - Primary source for project status, priorities, and roadmap
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Component structure and service layer details

## Development Guidelines

### Essential Rules
- **TDD Mandatory**: Write tests BEFORE implementing changes (90%+ coverage requirement)
- **Post-Development**: Tests, type-check, lint, and functional verification MUST pass
- **Bug Investigation**: ALWAYS consult `docs/BUG_PATTERNS.md` first when debugging - contains proven solutions for common Vue.js/Bootstrap integration issues
- **Reference Docs**: `docs/DEVELOPMENT_WORKFLOW.md` for TDD workflow, `docs/BUG_PATTERNS.md` for common patterns

### Critical Patterns
**Vue.js Reactivity**: Use `toRef(props, 'propName')` when passing props to composables
```typescript
// ✅ Correct reactive prop usage
const { filteredData } = useComposable(toRef(props, 'data'), filters)
```

**Store Access**: Always get current data from reactive store, not static prop copies
```typescript
// ✅ Reactive store access (NEVER use fallback to props - causes stale data!)
const currentSkill = computed(() => 
  skillStore.skills.find(s => s.id === props.skill.id) || null
)
```

**Vue 3 Teleport Modal Pattern**: All modals now use modern Vue 3 Teleport architecture
```typescript
// ✅ CURRENT PATTERN for all Vue 3 Teleport modals (no Bootstrap dependencies)
const showModal = (skill: SkillData) => {
  selectedSkill.value = skill
  isVisible.value = true
}
// Clean declarative state management without DOM manipulation
```

**Event Handling**: Multi-parameter events through component hierarchy
```typescript
// Child: emit('event', param1, param2)
// Parent: @event="(p1, p2) => $emit('event', {param1: p1, param2: p2})"
// Handler: handler: (data: {param1: type, param2: type}) => { ... }
```

### Architecture Overview
**Service Layer**: SkillService (CRUD), SpacedRepetitionService (SM2 algorithm), StorageService (persistence), focusDataHelpers (XP calculation)  
**Key Components**: App.vue (4 layout sub-components), SkillCard.vue (5 focused sub-components), ModalManager.vue, ToastManager.vue  
**Base Components**: BaseModal.vue, BaseButton.vue, BaseToast.vue for UI consistency  
**Dependency Injection**: Centralized DI container for testable architecture

### Toast System
**Complete notification system** with 4 variants (success/error/warning/info):
- **Components**: BaseToast.vue, ToastManager.vue with auto-dismiss and positioning
- **Store Integration**: useToasts() composable with Pinia store for state management
- **App Integration**: Connected to skill operations, data backup, form validation, and auto-save confirmations

### Timeline Filtering System
**Universal marked/unmarked filter for complete timeline control:**
- **Filter Types**: All → Unmarked → Marked cycle button for Level-Ups, Practice Sessions, and Quick Notes
- **Dual View Support**: Works in both compact sidebar and full modal timeline views with smart counts
- **Vue-native Implementation**: Pure Vue reactivity without Bootstrap dependencies

### XP System Architecture
**Centralized Focus Mode XP calculation:**
- **Central Function**: `calculateTargetXP(level)` in `focusDataHelpers.ts` with formula `Math.floor(3 * 2 + level / 3)`
- **Zero Hardcoding**: All services and 241+ tests use central function - change formula once, entire system updates

## Development Environment

### Commands
- **Build**: `npm run build`, `npm run dev`
- **Testing**: `npm run test:unit`, `npm run test:coverage`, `npm run test:unit:watch`
- **Quality**: `npm run lint`, `npm run type-check`

### Project Structure
```
src/
├── components/       # Vue components (25+ focused components)
├── services/         # Business logic with dependency injection
├── composables/      # Reusable Vue composition functions
├── stores/           # Pinia state management
└── types/           # TypeScript interfaces
```

### Git Workflow & Privacy
**IMPORTANT**: Always commit ALL modified files with `git add .` to preserve parallel user changes.

**Privacy & Security Status** (configured 2025-08-11):
- **✅ FULLY PROTECTED**: Clean Git-History mit `git checkout --orphan` erstellt
- **Private Email**: Git configured to use `132850162+kJunicke@users.noreply.github.com` für alle Commits
- **Email Masking**: `.mailmap` file masks any remaining email references in public displays  
- **Security Audit**: No API keys, credentials, or vulnerabilities - `npm audit` clean
- **Public Repository**: https://github.com/kJunicke/skill_tracker_modern_jive - sicher für öffentliche Veröffentlichung

**Documentation Privacy Rules**:
- **NO personal information** in any documentation files (CLAUDE.md, TODO.md, docs/)
- **NO personal email addresses, local paths with usernames, private notes**
- **ONLY technical project information** - keep all content "public repository ready"

## Vue 3 Development Guidelines

### Essential Patterns
- **Composition API**: Use `<script setup lang="ts">` for all components
- **Component Decomposition**: Break large components into focused sub-components
- **TypeScript**: Define clear interfaces for props, events, and data structures
- **Reactive Props**: Use `toRef()` for composable integration
- **Computed Over Watchers**: Prefer computed properties for derived state

### Vue 3 Teleport Modal System (2025-08-26) ✅
**Modern Modal Architecture** - All modals migrated to Vue 3 Teleport with clean CSS architecture

#### Implementation Pattern
**Standard Vue 3 Teleport Modal Structure:**
```vue
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- Modal content with slots -->
        <slot name="header" />
        <slot />
        <slot name="footer" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const isVisible = ref(false)
const closeModal = () => {
  isVisible.value = false
  emit('close')
}
</script>
```

#### Key Benefits
- **🚀 Performance**: 55% faster than Bootstrap modals, 32.5kB bundle reduction
- **🔧 Maintainability**: Declarative state management with simple `v-if`
- **🧪 Testability**: Native Vue component testing without Bootstrap mocking
- **🎯 Reliability**: No instance caching or DOM manipulation conflicts
- **🎨 Clean CSS**: Natural CSS specificity without !important conflicts

#### Development Guidelines
1. **Use BaseTeleportModal**: All new modals MUST use BaseTeleportModal.vue component from `/components/base/`
2. **Standard Architecture**: Import and extend BaseTeleportModal instead of creating custom modal structures
3. **CSS Variables System**: Styling handled automatically through modal.css variables (import order fixed)
4. **Slot-Based Content**: Use `#title`, default slot, and `#footer` slots for content organization
5. **Header Types**: Use `headerType` prop for consistent styling (skill, practice, status, tags, notes, timeline, training, transition)
6. **Accessibility Built-in**: Keyboard navigation, ARIA attributes, and focus management included

#### BaseTeleportModal Usage Pattern
```vue
<template>
  <BaseTeleportModal
    :isVisible="isVisible"
    title="Modal Title"
    headerType="skill"
    size="lg"
    @close="closeModal"
  >
    <template #title>
      <i class="bi bi-icon me-2"></i>
      Custom Title
    </template>
    
    <!-- Modal content in default slot -->
    <form>...</form>
    
    <template #footer>
      <button class="btn btn-secondary" @click="closeModal">Cancel</button>
      <button class="btn btn-primary" @click="save">Save</button>
    </template>
  </BaseTeleportModal>
</template>

<script setup lang="ts">
import BaseTeleportModal from '@/components/base/BaseTeleportModal.vue'
// No custom modal styling needed - handled by modal.css variables
</script>
```

#### Migration Benefits Achieved
- **Anti-Pattern Elimination**: No more `modalKey++` / `destroyModal()` complexity
- **Bundle Size Reduction**: Eliminated Bootstrap modal JavaScript (32.5kB saved)
- **Code Simplification**: Clean reactive state management
- **Testing Improvements**: Reliable component testing with Vue Test Utils
- **CSS Transparency Fix (2025-08-25)**: Fixed modal transparency by correcting CSS import order in main.ts and adding defensive !important rules

#### Technical Implementation Notes (2025-08-26)
- **Clean CSS Architecture**: Removed all !important from modal.css base classes for natural CSS specificity
- **Modal Sizing Fixed**: Size classes (modal-lg, modal-xl) now work correctly without conflicts
- **NotesEditor Timeline**: lg→xl expansion (800px→1200px) functions properly when timeline is shown
- **BaseTeleportModal Ready**: All future modal development should use the existing BaseTeleportModal.vue component
- **Migration Path**: 8 existing modals can be gradually migrated to BaseTeleportModal for consistency

### Testing with Vitest (241+ tests passing)
- **Structure**: Arrange-Act-Assert pattern
- **Mocking**: Use vi.fn() for dependency isolation
- **Coverage**: 90%+ for service layer, component interaction testing
- **Commands**: `npm run test:coverage` for reports
- **Test IDs**: Use `data-testid` attributes for reliable component testing
- **Modal Testing**: Ensure components use `v-if` for conditional rendering in tests

### Dark Mode System
**Complete dark theme with user preference persistence:**
- **DarkModeStore**: Pinia store with toggle functionality and localStorage persistence
- **UI Components**: Native header button positioned next to view mode toggle, no hover effects
- **Button Integration**: Both dark mode and view mode buttons in responsive header container
- **CSS Implementation**: Comprehensive light/dark color schemes with 0.3s smooth transitions
- **Mobile Optimization**: Responsive button sizing and positioning for mobile devices

### Data Backup System
**Complete JSON export/import functionality:**
- **Export/Import**: Structured JSON with metadata, validation, and automatic backup before import
- **UI Integration**: Export/Import buttons in main action bar with toast notifications
- **Safety Features**: Double confirmation for destructive actions, comprehensive error reporting
- **Test Coverage**: 14 unit tests covering all export/import scenarios

## Environment
- **Platform**: Windows development
- **Package Manager**: npm
- **PWA Ready**: Offline-first with installable app experience
- **Deployment**: GitHub Pages with automated workflow ✅ LIVE
- **Skill Levels**: 0 bis unendlich (0 to infinity)