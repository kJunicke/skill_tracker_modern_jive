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

### Current Status (2025-08-11)
- **Production-Ready**: Complete 5-status learning system with PWA functionality ✅
- **DEPLOYED**: GitHub Pages PWA deployment LIVE 🚀
- **Repository**: Public release at https://github.com/kJunicke/skill_tracker_modern_jive
- **Testing**: All 175 unit tests passing ✅ (Fixed: ModalManager, SkillFilters, useSkillEventHandlers)
- **Quality**: TypeScript strict mode, ESLint clean, 90%+ test coverage

## Documentation Index

**📋 Project Management:**
- **[TODO.md](./TODO.md)** - Primary source for project status, priorities, and roadmap
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Component structure and service layer details

**🔧 Development Guidelines:**
- **[docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)** - Mandatory TDD workflow and testing requirements
- **[docs/BUG_PATTERNS.md](./docs/BUG_PATTERNS.md)** - Common Vue.js reactivity and event handling bugs

**🔒 Privacy & Security:**
- **[docs/PRIVACY_SETUP.md](./docs/PRIVACY_SETUP.md)** - Email privacy configuration and security audit results

## Core Development Guidelines

### Essential Rules
- **TODO.md Management**: MUST be kept current for all development priorities
- **TDD Mandatory**: Write tests BEFORE implementing changes (90%+ coverage requirement)
- **Pre-Development**: Always run `npm run test:unit`, `npm run type-check`, `npm run dev` first
- **Post-Development**: Tests, type-check, lint, and functional verification MUST pass

### Critical Patterns
**Vue.js Reactivity**: Use `toRef(props, 'propName')` when passing props to composables
```typescript
// ✅ Correct reactive prop usage
const { filteredData } = useComposable(toRef(props, 'data'), filters)
```

**Store Access**: Always get current data from reactive store, not static prop copies
```typescript
// ✅ Reactive store access
const currentSkill = computed(() => 
  skillStore.skills.find(s => s.id === props.skill.id) || props.skill
)
```

**Event Handling**: Multi-parameter events through component hierarchy
```typescript
// Child: emit('event', param1, param2)
// Parent: @event="(p1, p2) => $emit('event', {param1: p1, param2: p2})"
// Handler: handler: (data: {param1: type, param2: type}) => { ... }
```

### Service Layer Architecture
- **SkillService.ts**: Business logic for CRUD operations, practice sessions, level progression
- **SpacedRepetitionService.ts**: SM2 algorithm implementation with 5-status logic
- **StorageService.ts**: Data persistence abstraction with LocalStorageAdapter
- **Dependency Injection**: Centralized DI container for testable architecture

### Key Components
- **App.vue**: Main orchestration with 4 layout sub-components
- **SkillCard.vue**: Modular display with 5 focused sub-components
- **ModalManager.vue**: Centralized modal management
- **ToastManager.vue**: Centralized toast notification system with auto-dismiss
- **Base Components**: BaseModal.vue, BaseButton.vue, BaseToast.vue for UI consistency

### Toast System (NEW)
**Complete notification system** with 4 variants and full test coverage:
- **BaseToast.vue**: Individual toast component with animations and auto-dismiss
- **ToastManager.vue**: Global toast container with positioning
- **useToasts()**: Composable for creating and managing toasts
- **toastStore**: Pinia store for centralized toast state management

**Toast Types**:
- `showSuccess()` - Green success notifications (3s default)
- `showError()` - Red error notifications (8s default) 
- `showWarning()` - Yellow warning notifications (5s default)
- `showInfo()` - Blue info notifications (5s default)

**Current Integrations**:
- Skill save confirmation
- Practice session completion with level-up detection
- Level updates and skill deletion confirmations

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

**Privacy Configuration** (configured 2025-08-11):
- **✅ FULLY PROTECTED**: Clean Git-History mit `git checkout --orphan` erstellt
- **Private Email**: Git configured to use `132850162+kJunicke@users.noreply.github.com` für alle Commits
- **Mailmap**: `.mailmap` file masks any remaining email references in public displays  
- **Public Repository**: https://github.com/kJunicke/skill_tracker_modern_jive - sicher für öffentliche Veröffentlichung

## Vue 3 Development Guidelines

### Essential Patterns
- **Composition API**: Use `<script setup lang="ts">` for all components
- **Component Decomposition**: Break large components into focused sub-components
- **TypeScript**: Define clear interfaces for props, events, and data structures
- **Reactive Props**: Use `toRef()` for composable integration
- **Computed Over Watchers**: Prefer computed properties for derived state

### Testing with Vitest (175 tests passing ✅)
- **Structure**: Arrange-Act-Assert pattern
- **Mocking**: Use vi.fn() for dependency isolation
- **Coverage**: 90%+ for service layer, component interaction testing
- **Commands**: `npm run test:coverage` for reports
- **Test IDs**: Use `data-testid` attributes for reliable component testing
- **Modal Testing**: Ensure components use `v-if` for conditional rendering in tests

## Environment
- **Platform**: Windows development
- **Package Manager**: npm
- **PWA Ready**: Offline-first with installable app experience
- **Deployment**: GitHub Pages with automated workflow ✅ LIVE
- **Skill Levels**: 0 bis unendlich (0 to infinity)