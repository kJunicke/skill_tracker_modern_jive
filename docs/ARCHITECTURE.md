# Technical Architecture

## Component Structure

### Layout Components (App.vue Refactoring - 2025-08-07)
- **App.vue**: Main application orchestration (reduced from 267 to 182 lines)
  - **AppHeader.vue**: Application header with title and description
  - **MainSkillInterface.vue**: Main skill management interface wrapper
  - **ModalManager.vue**: Centralized modal management component
  - **AppActionBar.vue**: Action buttons section (Logbuch, Post-Training, Reset, Add Skill)

### Skill Management Components  
- **SkillCard.vue**: Refactored modular skill display component (reduced from 700 to 157 lines)
  - **SkillCardHeader.vue**: Name, dropdown menu, and timeline button
  - **SkillCardProgress.vue**: Star rating and focus mode progress bar
  - **SkillCardStatus.vue**: Status badge, tags, and next review information
  - **SkillCardNotes.vue**: Notes preview with hover tooltips and markdown rendering
  - **SkillCardActions.vue**: Practice button, quick notes, and level-up actions
- **SkillsGrid.vue**: Grid layout for skill cards with responsive design
- **SkillFilters.vue**: Advanced filtering and sorting interface

### UI Components
- **MarkdownEditor.vue**: Toggle-based markdown editor with preview modes
- **SkillTimelineContent.vue**: Unified timeline component supporting both compact sidebar and full modal views
- **TimelineModal.vue**: Dedicated modal wrapper for full timeline experience with statistics
- **StatusEditor.vue**: Interactive status management for skills

### Base Component Library (Phase 3B - 2025-08-08) ✅
**Professional Design System Foundation** - Standardized UI components for consistent user experience

#### Base Components
- **BaseModal.vue** (180 lines): Standardized modal component with Bootstrap 5 integration
  - Flexible sizing (sm, lg, xl, fullscreen), header variants, conditional rendering
  - Slot-based content system, configurable footer buttons, data-testid support
  - Gradient header styling, accessibility features, consistent event handling
- **BaseButton.vue** (195 lines): Unified button component with enhanced features
  - All Bootstrap variants with gradient styling, icon support (left/right positioning)
  - Loading states with spinner animation, hover effects, block/inline layouts
  - Custom classes, disabled states, router-link support, accessibility compliance

#### Component Migration Status
- **4 Modals Migrated**: StatusEditor, TagsEditor, TimelineModal, PracticeRating → BaseModal
- **3 Component Groups Migrated**: SkillCardActions, AppActionBar, PracticeRating → BaseButton
- **15+ Button Variants Unified**: Consistent styling, behavior, and interaction patterns
- **UI Consistency Achievement**: 90%+ standardization across modal and button components

## Service Layer Architecture (Completed 2025-08-08) ✅
**Clean Architecture Implementation** - Complete separation of concerns with dependency injection

### Core Services
- **SkillService.ts** (197 lines): Complete business logic for skill CRUD operations, practice sessions, and level progression
- **StorageService.ts** (48 lines): Abstraction layer for data persistence with adapter pattern
- **SpacedRepetitionService.ts** (200 lines): Isolated SM2 algorithm implementation with focus mode logic
- **AnalyticsService.ts** (154 lines): Statistics calculations, skill grouping, and progress metrics

### Adapter Pattern
- **LocalStorageAdapter.ts** (43 lines): Clean localStorage implementation with error handling
- **Future-Ready**: Backend integration ready via StorageAdapter interface

### Dependency Injection
- **Service Container**: Centralized DI container with symbol-based tokens (services/index.ts)
- **Testable Architecture**: Services are fully mockable for unit testing
- **Clean Dependencies**: Clear separation between services, adapters, and UI layer
- **Store Integration**: skillStore.ts (281 lines) now uses service layer via dependency injection

## Unified Timeline System Architecture
- **useSkillTimeline.ts**: Unified composable for timeline functionality across all components
- **Single Timeline Component**: SkillTimelineContent.vue serves both sidebar (compact) and modal (full) views via isModalView prop
- **Unified Data Structure**: Level-ups, practice sessions, and quick notes in single timeline with consistent event types
- **Consistent Filtering**: Shared filter logic for all timeline views with live event counts
- **Edit Functionality**: Integrated edit buttons for level-up comments and practice notes in both views
- **Type Safety**: Proper TypeScript interfaces for all timeline events and component props

## Composable Architecture
- **useSkillCardDropdown.ts**: Reusable dropdown state management with outside-click and escape key handling
- **useAppEventHandlers.ts**: Extracted inline event handlers from App.vue (level-up comment editing, practice note editing, test environment reset)
- **Component Decomposition**: SkillCard split into 5 focused sub-components for better maintainability and testability
- **App.vue Decomposition**: Main application split into 4 focused layout components for better maintainability
- **Event Propagation**: Clean event handling through component hierarchy without prop drilling
- **CSS Scoping**: Component-specific styling prevents style conflicts and improves modularity

## Key Features Implementation
- **5-Status Learning System**: Based on scientifically-backed algorithms
  - **Active Learning**: ACQUISITION (fixed 1-2-3 day intervals), MAINTENANCE (SM2), FOCUS (XP system)
  - **Non-Learning**: BACKLOG (skill collection), ARCHIVED (inactive, excluded from algorithms)
- **Interactive Elements**: Clickable status badges, tags, and practice buttons
- **Notes Tooltips**: Hover tooltips with 500ms delay for truncated notes
- **Sorting & Filtering**: Multi-criteria sorting with real-time filtering
- **Practice Sessions**: Quick practice functionality with quality rating and integrated level-up capability
- **Unified Timeline System**: Single codebase serving both sidebar and modal timeline views with isModalView prop
- **Quick Notes**: Timeline-exclusive quick notes with full CRUD operations (create, edit, delete) and separate storage
- **Timeline Filtering**: Toggle visibility of different event types with live counts (level-ups, practices, notes)
- **Edit Functionality**: Comprehensive edit buttons for all timeline entry types (level-up comments, practice notes, quick notes) in both timeline views
- **Timeline Integration**: Seamless timeline access from both Notes Editor sidebar and dedicated Timeline Modal
- **Transfer Status Tracking**: Green checkbox buttons for marking timeline entries as transferred to main notes with persistent state management
- **Progressive Web App**: Offline-first functionality with installable app experience and localStorage-based caching