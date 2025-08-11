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
- **Next Priority**: GitHub Pages PWA deployment (see [TODO.md](./TODO.md)) 🎯

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
- **Base Components**: BaseModal.vue, BaseButton.vue for UI consistency

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
- **Private Email**: Git configured to use `132850162+kJunicke@users.noreply.github.com` for all future commits
- **Mailmap**: `.mailmap` file masks historical commits in public displays (GitHub, git shortlog, etc.)
- **⚠️ WICHTIG**: Alte Commits in `.git/logs/` enthalten weiterhin die echte E-Mail-Adresse
- **Für vollständige Anonymisierung**: Neue Git-History mit `git checkout --orphan` erforderlich

## Vue 3 Development Guidelines

### Essential Patterns
- **Composition API**: Use `<script setup lang="ts">` for all components
- **Component Decomposition**: Break large components into focused sub-components
- **TypeScript**: Define clear interfaces for props, events, and data structures
- **Reactive Props**: Use `toRef()` for composable integration
- **Computed Over Watchers**: Prefer computed properties for derived state

### Testing with Vitest
- **Structure**: Arrange-Act-Assert pattern
- **Mocking**: Use vi.fn() for dependency isolation
- **Coverage**: 90%+ for service layer, component interaction testing
- **Commands**: `npm run test:coverage` for reports

## Environment
- **Platform**: Windows development
- **Package Manager**: npm
- **PWA Ready**: Offline-first with installable app experience
- **Deployment**: GitHub Pages with automated workflow (pending)
- **Skill Levels**: 0 bis unendlich (0 to infinity)