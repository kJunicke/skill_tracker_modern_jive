# Spaced Repetition System

**Modern Jive Skill Tracker** uses a scientifically-backed spaced repetition system based on the SM2 algorithm, adapted for skill-based learning with a 5-status progression model.

## Overview

The system combines **Anki-inspired acquisition** with **SM2 maintenance** to optimize learning efficiency across different skill development phases.

## 5-Status Learning System

### Status Definitions

| Status | Level Range | Algorithm | Purpose |
|--------|-------------|-----------|---------|
| **BACKLOG** | 0 | None | Skill collection - no practice scheduling |
| **ACQUISITION** | 1-4 | Fixed intervals + bonuses | Active skill building phase |
| **MAINTENANCE** | 5+ | SM2 algorithm | Long-term retention |
| **FOCUS** | 5+ | Daily suggestions + XP | Intensive improvement mode |
| **ARCHIVED** | 5+ | None | Inactive skills - no scheduling |

### Key Transitions

- **ACQUISITION → MAINTENANCE**: Automatic at Level 5
- **MAINTENANCE ↔ FOCUS**: User-controlled
- **FOCUS → MAINTENANCE**: Automatic after 7 days without practice

## Acquisition Mode (Levels 1-4)

**Purpose**: Rapid skill building with progressive intervals

### Interval Logic

**New Skill Creation:**
- `nextReview = today` (due immediately)
- `interval = 1` day

**Practice Quality Bonuses:**
- **Could Not Perform (1)**: Reset to 1 day
- **Hard (2)**: +0 days (no change) 
- **Good (3)**: +1 day
- **Very Easy (4)**: +2 days

**Interval Calculation:**
```typescript
newInterval = currentInterval + bonus
nextReview = practiceDate + newInterval
```

**Example Progression:**
- Day 1: Practice "Good" → Review in 2 days (1+1)
- Day 3: Practice "Good" → Review in 3 days (2+1) 
- Day 6: Practice "Very Easy" → Review in 5 days (3+2)
- Day 11: Practice "Good" → Review in 6 days (5+1)

**Key Features:**
- **Cumulative bonuses**: Each practice builds on previous interval
- **Instant override**: New practice immediately reschedules (no addition to remaining days)
- **Reset on failure**: "Could Not Perform" resets to 1 day

## Maintenance Mode (Level 5+)

**Purpose**: Long-term retention using proven SM2 algorithm

### SM2 Parameters
- **Ease Factor**: 1.3 - 2.5+ (difficulty adjustment)
- **Repetitions**: Success streak counter
- **Interval**: Days until next review

### SM2 Quality Mapping
| Quality | SM2 Response | Ease Factor Change | Interval Effect |
|---------|--------------|-------------------|-----------------|
| 1 (Could Not Perform) | 0 | -0.8 | Reset to 1 day |
| 2 (Hard) | 3 | -0.15 | Reduce interval |
| 3 (Good) | 4 | No change | Standard progression |
| 4 (Very Easy) | 5 | +0.1 | Increase interval |

### Smooth Transition from Acquisition
When skills transition from Acquisition → Maintenance at Level 5:
- **Preserved intervals**: Acquisition intervals are maintained/improved, never regressed
- **Intelligent ease factor**: Initialized based on acquisition performance to prevent interval drops

## Focus Mode (Level 5+)

**Purpose**: Intensive daily practice with gamified XP progression

### Focus Mechanics
- **Daily suggestions**: Always suggests practice regardless of interval
- **XP System**: Gain XP based on practice quality
- **Target XP**: `Math.floor(3 * 2 + level / 3)` per level
- **Level-up readiness**: Automatically suggests level-up when target XP reached
- **Automatic exit**: Returns to Maintenance after 7 days without practice

### XP Rewards
- **Forgotten (1)**: 0 XP
- **Hard (2)**: 1 XP  
- **Good (3)**: 2 XP
- **Very Easy (4)**: 3 XP

## Daily vs Weekly Modes

Each skill can be configured for different practice environments:

### Daily Mode (Default)
- **Use Case**: Home practice, personal training
- **Intervals**: Calculated in days (1, 2, 3, 4, 5...)
- **Scheduling**: Any day of the week

### Weekly Mode  
- **Use Case**: Group classes, scheduled training sessions
- **Intervals**: Calculated in weeks, then mapped to training days
- **Training Schedule**: Configurable (e.g., Tuesday/Thursday)
- **Intelligent Scheduling**: Automatically finds next available training day

## Quality Scale (1-4)

**Consistent across all modes:**

1. **Could Not Perform** - Complete failure, need to restart
2. **Hard** - Difficult, with hesitation or errors  
3. **Good** - Performed correctly with effort
4. **Very Easy** - Effortless, perfect execution

## Implementation Details

### Service Layer
- **SpacedRepetitionService**: Core algorithm logic
- **TrainingScheduleService**: Weekly mode scheduling
- **SkillService**: Business logic integration

### Key Methods
- `calculateNextReview()`: Main scheduling logic
- `updateSM2Parameters()`: SM2 algorithm implementation  
- `checkAutomaticStatusTransitions()`: Status progression
- `handleFocusProgression()`: XP and level-up logic

## Best Practices

### For Users
- **Honest ratings**: Accurate quality assessment improves algorithm effectiveness
- **Consistent practice**: Regular sessions optimize retention
- **Strategic focus mode**: Use for skills needing intensive improvement

### For Developers
- **Status-aware logic**: Always check skill status before applying algorithms
- **Smooth transitions**: Preserve learning progress during status changes
- **Test coverage**: Comprehensive unit tests for algorithm edge cases
- **Performance**: Efficient calculation for large skill collections

## Scientific Foundation

- **SM2 Algorithm**: Proven spaced repetition method from SuperMemo
- **Anki Inspiration**: Acquisition intervals based on Anki's learning phase
- **Gamification**: XP system provides motivation and clear progress indicators
- **Adaptive Scheduling**: Weekly mode accommodates real-world training constraints

---

*This documentation reflects the current implementation as of 2025-08-27. For implementation details, see `SpacedRepetitionService.ts` and related test files.*