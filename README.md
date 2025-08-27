# Modern Jive Skill Tracker

**Live App**: https://kjunicke.github.io/skill_tracker_modern_jive/

A scientifically-backed, gamified learning platform for Modern Jive dance training. Built with Vue.js 3, TypeScript, and Progressive Web App technology.

## 🧪 Current Status: Beta Testing Phase 1

**I am currently in the first testing phase of the application.** This phase focuses on:

### Testing Objectives
- **Core Functionality Validation**: Verifying the 5-status learning system works as designed
- **Spaced Repetition Algorithm**: Testing both daily and weekly mode effectiveness
- **User Experience Evaluation**: Gathering feedback on interface design and workflow efficiency  
- **Data Integrity**: Ensuring reliable data persistence and backup/restore functionality
- **Performance Assessment**: Monitoring app responsiveness and PWA capabilities
- **Responsiveness & Display**: Testing across different devices, screen sizes, and orientations
- **Visual Presentation**: Evaluating interface clarity, color schemes, and visual hierarchy

### What This Means
- **Feature Complete**: All core features are implemented and functional
- **Production Ready**: The app is stable and safe to use for skill tracking
- **Active Development**: I'm continuously improving based on user feedback
- **Data Safety**: Your practice data is secure with local storage and export capabilities

### How to Participate
- **Use the App**: Track your Modern Jive skills and provide feedback on your experience
- **Report Issues**: Let me know if you encounter any bugs or usability concerns
- **Share Feedback**: Help me improve the learning algorithm and user interface
- **Test Features**: Experiment with different skill statuses, practice modes, and timeline features

I welcome feedback from the Modern Jive community to make this the best possible learning tool!

## 🎯 Mission

Transform how social dancers approach learning and skill development through data-driven training and reflective practice.

## ✨ Features

### 🧠 Advanced 5-Status Learning System
- **BACKLOG** (Level 0): Skill collection - no algorithms applied
- **ACQUISITION** (Level 1-4): Cumulative progression with 1-2-3 day intervals for skill building
- **MAINTENANCE** (Level 5+): SM2 spaced repetition algorithm for long-term retention
- **FOCUS**: Daily practice suggestions with XP progression and level-up notifications
- **ARCHIVED**: Inactive skills - preserved for reference without active algorithms

### 🕒 Dual-Mode Spaced Repetition
- **Daily Mode**: For home practice with daily intervals
- **Weekly Mode**: For class/studio practice with weekly intervals scheduled to training days
- **Training Schedule**: Configurable weekly training days (e.g., Tuesday/Thursday)
- **Intelligent Scheduling**: Automatic scheduling to next available training session

### 📱 Progressive Web App
- **Offline-First**: Full functionality without internet connection
- **Installable**: Add to home screen on mobile/desktop devices
- **Responsive Design**: Optimized for all screen sizes and devices
- **Modern UI**: Clean, accessible interface with dark/light mode support

### 🎮 Comprehensive Gamification
- **XP System**: Dynamic experience point rewards based on practice quality
- **Smooth Level Progression**: Intelligent transitions between learning phases
- **4-Point Quality System**: Forgotten/Hard/Good/Very Easy practice ratings
- **Achievement Tracking**: Detailed progress analytics and timeline views
- **Focus Mode Rewards**: Special XP progression for intensive skill development

## 🏗️ Technical Architecture

### Core Technologies
- **Framework**: Vue.js 3 with Composition API and `<script setup>`
- **Language**: TypeScript with strict mode for complete type safety
- **UI Framework**: Bootstrap 5 with custom component system
- **State Management**: Pinia stores with reactive data flow
- **Testing**: Vitest with 90%+ test coverage (253+ passing tests)
- **Build Tool**: Vite with PWA plugin and optimized bundling
- **Deployment**: GitHub Pages with automated CI/CD workflows

### Modern Architecture Patterns
- **Vue 3 Teleport Modals**: Modern modal system with 55% performance improvement
- **Service Layer**: Dependency injection with SpacedRepetitionService, SkillService, AnalyticsService
- **Composable Functions**: Reusable logic with useSkillTimeline, useTrainingLogData, useModals
- **Component Library**: 25+ focused components with BaseTeleportModal, BaseButton, BaseToast
- **Fallback Logging**: Comprehensive error tracking with 80+ logged fallback patterns

### Code Quality & Developer Experience
- **ESLint + TypeScript**: Strict linting and type checking
- **Test-Driven Development**: Write tests first methodology
- **DRY Principle**: Consolidated modal system saving ~1200 lines of code
- **Modern Patterns**: Vue 3 best practices, reactive composition, teleport architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kJunicke/skill_tracker_modern_jive.git
cd skill_tracker_modern_jive

# Install dependencies
cd skill-tracker-vue
npm install

# Start development server
npm run dev

# Run tests
npm run test:unit

# Build for production
npm run build
```

## 📊 Scientific Learning Algorithm

### Enhanced SM2 Spaced Repetition System
Based on the proven **SM2 (SuperMemo 2)** algorithm with modern enhancements:

- **ACQUISITION Phase** (Levels 1-4): Cumulative progression system
  - Quality-based bonuses: Good (+1 day), Very Easy (+2 days), Hard (no change), Forgotten (reset to 1 day)
  - Smooth transitions to maintenance phase at Level 5
  
- **MAINTENANCE Phase** (Level 5+): Dynamic SM2 algorithm
  - Ease factor adjustments based on recall difficulty
  - Exponential interval growth for long-term retention
  - Intelligent transition preservation from acquisition intervals

- **FOCUS Mode**: Intensive practice with gamification
  - XP-based progression system with quality rewards
  - Daily practice suggestions for accelerated learning
  - Automatic transition back to maintenance after 7 days of inactivity

### Dual-Mode Scheduling
- **Daily Mode**: Traditional daily intervals for home practice
- **Weekly Mode**: Class-based scheduling with configurable training days
- **Intelligent Date Calculation**: Automatic scheduling to available training sessions

## 🎨 User Experience

### Modern Interface Design
- **Intuitive Interface**: Clean, accessible design optimized for dance training workflows
- **Unified Practice System**: Combined practice sessions and level-ups in single interface
- **Quick Actions**: One-click practice rating with immediate visual feedback
- **Dark/Light Mode**: Automatic system preference detection with manual toggle

### Advanced Features
- **Timeline System**: Comprehensive progress tracking with filterable views
- **Markdown Notes**: Rich text support for detailed skill observations
- **Quick Notes**: Fast in-context note-taking during practice sessions
- **Training Analytics**: Detailed statistics and learning velocity tracking
- **Export/Import**: Complete JSON backup system for data portability and migration

### Responsive Design
- **Mobile-First**: Optimized touch interface for mobile devices
- **Desktop Experience**: Enhanced keyboard navigation and larger screen layouts
- **PWA Integration**: Install as native app with offline functionality

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally in your browser
- **No Tracking**: No analytics or user tracking
- **Offline-First**: Works completely offline
- **Open Source**: Full source code available for inspection

## 🤝 Contributing

### Development Standards
This project follows industry best practices and modern development standards:

- **Test-Driven Development**: Write tests before implementation (90%+ coverage requirement)
- **TypeScript Strict Mode**: Complete type safety with strict compiler settings
- **ESLint + Prettier**: Automated code quality and consistent formatting
- **Vue 3 Best Practices**: Modern composition API, teleport patterns, reactive design

### Code Quality Requirements
- **Fallback Logging**: All fallback patterns must include descriptive console logging
- **Component Testing**: Vitest with Vue Test Utils for comprehensive component coverage
- **Service Layer Testing**: Unit tests for all business logic and data transformations
- **Integration Testing**: End-to-end workflow testing for critical user paths

### Architecture Guidelines
- **DRY Principle**: Eliminate code duplication through shared components and utilities
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data layers
- **Reactive Patterns**: Leverage Vue 3 reactivity system for optimal performance
- **Documentation**: Maintain comprehensive code documentation and README updates

## 📄 License

This project is open source. License details to be determined.

## 🙏 Acknowledgments

Built with modern web technologies and evidence-based learning methods to support the Modern Jive dance community.

---

**Start your dance learning journey**: https://kjunicke.github.io/skill_tracker_modern_jive/