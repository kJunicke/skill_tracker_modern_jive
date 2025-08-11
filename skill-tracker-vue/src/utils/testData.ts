import type { SkillData } from '@/types/skill'

export function createTestSkills(): SkillData[] {
  const now = new Date().toISOString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90)

  return [
    // BACKLOG STATUS - Future learning goals
    {
      id: 'skill_test_1',
      name: 'Salsa Cross-Training',
      tags: ['Move', 'Musicality'],
      level: 0,
      status: 'backlog',
      notes: `# Salsa Integration Goals

Want to learn salsa techniques that could enhance my **Modern Jive** dancing.

## Key Areas to Explore
- **Hip movement** and body isolation
- *Latin rhythm* interpretation  
- Sharp vs. smooth transitions
- **Syncopation** and musical breaks

### Research Notes
> Many dancers say salsa helps with musicality and body awareness

#### Benefits for Modern Jive
1. **Better body movement** - More expressive styling
2. **Enhanced musicality** - Improved rhythm interpretation
3. **Improved lead/follow** - Different connection styles
4. **Diverse styling** - Latin flair options

### Prerequisites
- [ ] Master current focus skills first
- [ ] Find good salsa instructor
- [ ] Practice basic salsa timing

**Priority:** Medium  
*Timeline:* After completing Catapult focus training

---
*Added to backlog: ${new Date().toISOString().split('T')[0]}*`,
      dateCreated: now,
      dateModified: now,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      progressionHistory: [],
      practiceLog: [],
      quickNotes: []
    },

    // ACQUISITION STATUS - Currently learning
    {
      id: 'skill_test_2',
      name: 'Texas Tommy',
      tags: ['Move', 'Leading', 'Following'],
      level: 2,
      status: 'acquisition',
      notes: `# Texas Tommy - Partner Exchange Move

A **classic** Modern Jive move involving partner rotation and smooth transitions.

## Learning Progress
Currently working on the **leader's technique** - the follower part is coming along nicely!

### Key Components
1. **Setup**: Standard two-hand hold
2. **Signal**: Clear lead to initiate rotation  
3. **Guide**: Support follower through turn
4. **Reset**: Return to original position

### Current Challenges
- Timing the release correctly
- Maintaining connection during rotation
- *Smooth transitions* in and out

> 💡 **Tip from instructor**: Keep the movement compact and controlled

### Practice Log
\`\`\`
Week 1: Basic footwork ✓
Week 2: Added rotation (current)
Week 3: Polish and styling (planned)
\`\`\`

#### Next Session Goals
- [ ] Practice with different partners
- [ ] Work on musical timing
- [ ] Add subtle styling elements

---
*Started learning: ${twoWeeksAgo.toISOString().split('T')[0]}*`,
      dateCreated: twoWeeksAgo.toISOString(),
      dateModified: now,
      easeFactor: 2.4,
      interval: 2,
      repetitions: 3,
      lastPracticed: yesterday.toISOString(),
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [
        {
          level: 1,
          date: twoWeeksAgo.toISOString(),
          comment: 'First attempt - got basic concept but needs lots of practice',
          previousLevel: 0
        },
        {
          level: 2,
          date: lastWeek.toISOString(),
          comment: 'Much smoother! Can execute consistently with practice partners',
          previousLevel: 1
        }
      ],
      practiceLog: [
        {
          date: twoWeeksAgo.toISOString(),
          quality: 0,
          qualityText: 'Completely Forgotten',
          note: 'First time learning - very confusing!'
        },
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 1,
          qualityText: 'Hard',
          note: 'Getting the basic steps but timing is off'
        },
        {
          date: lastWeek.toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Breakthrough session! Finally clicked with the rotation'
        },
        {
          date: yesterday.toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Consistent execution, ready to add styling'
        }
      ]
    },

    // MAINTENANCE STATUS - Well-established skill
    {
      id: 'skill_test_3',
      name: 'First Move',
      tags: ['Move', 'Leading', 'Communication'],
      level: 4,
      status: 'maintenance',
      notes: `# First Move Fundamentals

The **foundation** of Modern Jive - this move establishes connection and sets the tone for the entire dance.

## Mastery Level Achieved ✅

This skill is now **second nature** - can execute perfectly without conscious thought.

### Key Technique Points (Mastered)
- **Prep Position**: ✓ Perfect frame and posture
- **Lead Clarity**: ✓ Crystal clear signals
- **Connection**: ✓ *Gentle but firm* hand connection
- **Timing**: ✓ Natural musical interpretation
- **Flow**: ✓ Seamless transitions to next moves

### Maintenance Focus
> 🎯 **Goal**: Keep sharp with minimal practice while helping others learn

#### Teaching Notes
When helping beginners:
1. **Break it down** - Show prep position first
2. **Emphasize timing** - Count out loud initially  
3. **Build confidence** - Start slow, build speed
4. **Connection quality** - Firm but gentle

### Advanced Variations Mastered
- Musical breaks and pauses
- Different styling approaches
- Smooth flow into complex combinations
- Leading with minimal hand pressure

\`\`\`
Current Skill Level: MASTERED
Maintenance Schedule: Weekly check-ins
Next Review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
\`\`\`

---
*Achieved mastery: ${monthAgo.toISOString().split('T')[0]} - Now helping others learn!*`,
      dateCreated: threeMonthsAgo.toISOString(),
      dateModified: yesterday.toISOString(),
      easeFactor: 2.8,
      interval: 7,
      repetitions: 12,
      lastPracticed: yesterday.toISOString(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [
        {
          level: 1,
          date: threeMonthsAgo.toISOString(),
          comment: 'First lesson - learned basic footwork and timing',
          previousLevel: 0
        },
        {
          level: 2,
          date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Added proper lead technique and partner connection',
          previousLevel: 1
        },
        {
          level: 3,
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Flows naturally with musical phrasing',
          previousLevel: 2
        },
        {
          level: 4,
          date: monthAgo.toISOString(),
          comment: 'Achieved mastery level - can now help teach beginners',
          previousLevel: 3
        }
      ],
      practiceLog: [
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Perfect execution while helping Sarah learn'
        },
        {
          date: lastWeek.toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Demonstrated for beginners class - felt completely natural'
        },
        {
          date: yesterday.toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Maintenance practice - still perfect, ready for next level goals'
        }
      ]
    },

    // FOCUS STATUS - Intensive skill development with gamification
    {
      id: 'skill_test_4',
      name: 'Catapult',
      tags: ['Move', 'Communication', 'Control'],
      level: 5,
      status: 'focus',
      notes: `# Catapult - Dynamic Release Move 🎯

A **high-energy** move that requires precise timing and strong communication between partners.

## 🔥 FOCUS MODE ACTIVE 🔥

> **Current XP**: 85/100 (85%) - *Almost ready for level up!*  
> **Consecutive Good Sessions**: 4  
> **Target**: Reach level 6 through consistent execution

### Technique Breakdown

#### Leader Responsibilities
1. **Setup**: Establish solid two-hand hold
2. **Signal**: Clear backward lean to indicate catapult
3. **Release**: Controlled release with proper tension
4. **Catch**: Ready to re-establish connection smoothly

#### Follower Technique  
- **Trust**: Lean into the leader's support
- **Momentum**: Use the energy for smooth travel
- **Control**: Maintain balance during release phase
- **Return**: Graceful re-connection with leader

### Recent Breakthrough! 🚀

**Major improvement** this week - partners now report feeling completely secure during the move!

#### This Week's Achievements
- ✅ **Reduced prep time** - More natural setup
- ✅ **Smoother catch** - Perfect timing on re-connection  
- ✅ **Partner comfort** - 100% positive feedback
- ✅ **Consistent quality** - No more "hard" sessions

### Partner Feedback
> "WOW! That felt amazing - I actually enjoyed the release part!" - *Emma, yesterday's session*

> "You can tell you've been practicing this intensively. The timing is perfect now." - *Lisa, practice partner*

#### Instructor Notes
- **Mike (Advanced Instructor)**: *"Ready for competition level execution"*
- **Sarah (Teaching Assistant)**: *"Great example to show other students"*

### Focus Training Stats
\`\`\`
Training Period: 3 weeks intensive
Sessions Completed: 18
Quality Trend: ↗️ Steadily improving
Current Streak: 4 consecutive "Good" or better
Ready for Level Up: Almost! (15 XP needed)
\`\`\`

### Next Practice Session
**Tomorrow 7 PM** with competition team
- Focus: Musical timing variations
- Goal: Achieve final XP for level 6
- Partners: Emma and Lisa (advanced level)

---
**Status**: 🔥 *Intensive Focus Training*  
**Achievement Unlocked**: *Partner Comfort Master* 🏆`,
      dateCreated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: now,
      easeFactor: 2.2,
      interval: 1,
      repetitions: 18,
      lastPracticed: now,
      nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      focusData: {
        consecutiveGoodSessions: 4,
        totalSessions: 18,
        currentXP: 85,
        targetXP: 100,
        lastQuality: 3,
        readyForLevelUp: false
      },
      progressionHistory: [
        {
          level: 3,
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Started intensive focus training on this challenging move',
          previousLevel: 2
        },
        {
          level: 4,
          date: twoWeeksAgo.toISOString(),
          comment: 'Breakthrough in timing and partner communication',
          previousLevel: 3
        },
        {
          level: 5,
          date: lastWeek.toISOString(),
          comment: 'Consistent execution, partners report feeling completely secure',
          previousLevel: 4
        }
      ],
      practiceLog: [
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Good session, timing is much more natural now'
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 2,
          qualityText: 'Good',
          note: 'Emma said it felt smooth and secure - big improvement!'
        },
        {
          date: yesterday.toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Excellent! Multiple partners loved it. Perfect timing and control.'
        },
        {
          date: now,
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Competition-ready level! Ready for level 6 soon!'
        }
      ]
    },

    // ARCHIVED STATUS - Mastered skill
    {
      id: 'skill_test_5',
      name: 'Basic Steps',
      tags: ['Move'],
      level: 6,
      status: 'archived',
      notes: `# Basic Steps - MASTERED ✅

The fundamental **6-count basic step** of Modern Jive - now completely mastered.

## Achievement Status: LEGENDARY

This skill has been **perfected** and no longer requires active practice. It's become as natural as walking!

### Mastery Achievements
- ✅ **Perfect timing** in all musical styles
- ✅ **Natural flow** with zero conscious thought
- ✅ **Teaching ability** - can demonstrate flawlessly for students  
- ✅ **Styling variations** - multiple approaches mastered
- ✅ **Musical interpretation** - adapts automatically to any song

### Historical Journey
Started as a complete beginner and progressively mastered every aspect:

1. **Basic counting** and footwork
2. **Musical timing** and rhythm
3. **Natural flow** and body movement  
4. **Advanced styling** and personal flair
5. **Teaching competency** for helping others
6. **Mastery level** - unconscious competence

> 🏆 **Status**: PERMANENTLY MASTERED - No further practice needed

### Teaching Notes
When demonstrating to students:
- Show the basic 6-count clearly
- Emphasize weight transfer
- Build confidence before adding complexity
- Use as foundation for all other moves

\`\`\`
Mastery Date: ${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
Current Status: ARCHIVED (Mastered)
Practice Required: None
Next Review: Never (Permanent Skill)
\`\`\`

---
*Graduated to permanent mastery level - Foundation for all Modern Jive dancing! 🎉*`,
      dateCreated: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      easeFactor: 3.5,
      interval: 999,
      repetitions: 50,
      progressionHistory: [
        {
          level: 1,
          date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'First lesson - learned the basic 6-count pattern',
          previousLevel: 0
        },
        {
          level: 2,
          date: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Added proper weight transfer and posture',
          previousLevel: 1
        },
        {
          level: 3,
          date: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Natural timing with music, no more counting needed',
          previousLevel: 2
        },
        {
          level: 4,
          date: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Added personal styling and body movement',
          previousLevel: 3
        },
        {
          level: 5,
          date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Teaching level competency - can demonstrate perfectly',
          previousLevel: 4
        },
        {
          level: 6,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'MASTERY ACHIEVED - Unconscious competence level',
          previousLevel: 5
        }
      ],
      practiceLog: []
    },

    // HIGH-LEVEL MAINTENANCE - Advanced skill
    {
      id: 'skill_test_6',
      name: 'Advanced Musicality',
      tags: ['Musicality', 'Charisma', 'Communication'],
      level: 8,
      status: 'maintenance',
      notes: `# Advanced Musicality - Musical Interpretation Master

The art of **dancing to the music** rather than just with the beat - expressing musical phrases, breaks, and emotions through movement.

## Expert Level Achieved 🎵

Advanced musical interpretation skills including:
- **Phrase awareness** and musical structure
- **Dynamic changes** in energy and style
- **Break recognition** and creative fills
- **Emotional expression** through movement

### Core Competencies
1. **Musical Structure Recognition**
   - Verse, chorus, bridge identification
   - 8-count and 16-count phrase awareness
   - Build-ups and breakdowns

2. **Dynamic Interpretation**
   - Energy matching with music intensity  
   - *Smooth vs. sharp* movement choices
   - Speed variations within phrases

3. **Creative Expression**
   - Personal style development
   - **Emotional storytelling** through dance
   - Improvisation during musical breaks

### Recent Focus Areas
> Working on **Latin music interpretation** - different rhythmic patterns and cultural styling

#### Musical Styles Mastered
- ✅ **Blues & Soul**: Smooth, grounded movement
- ✅ **Pop/Top 40**: Energetic, mainstream appeal  
- ✅ **Jazz**: Syncopated, playful interpretation
- 🎯 **Latin** (current focus): Rhythm and cultural styling
- 📋 **Electronic/EDM** (future): Build-ups and drops

### Practice Approach
\`\`\`
Listen → Analyze → Feel → Express
1. Musical analysis (structure, rhythm, mood)
2. Movement experimentation  
3. Partner feedback and refinement
4. Performance integration
\`\`\`

#### Performance Opportunities
- **Monthly social dances**: Regular practice with variety
- **Workshops**: Learning from guest instructors
- **Competitions**: Advanced level showcasing

---
*Expertise Level*: Teaching workshops on musicality interpretation 🎼`,
      dateCreated: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: lastWeek.toISOString(),
      easeFactor: 3.2,
      interval: 14,
      repetitions: 25,
      lastPracticed: lastWeek.toISOString(),
      nextReview: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      progressionHistory: [
        {
          level: 5,
          date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Started focusing seriously on musical interpretation',
          previousLevel: 4
        },
        {
          level: 6,
          date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Can identify and dance to most musical structures',
          previousLevel: 5
        },
        {
          level: 7,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Added emotional expression and personal style',
          previousLevel: 6
        },
        {
          level: 8,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Expert level - now teaching musicality workshops',
          previousLevel: 7
        }
      ],
      practiceLog: [
        {
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Led musicality workshop - great student feedback on Latin rhythm section'
        },
        {
          date: lastWeek.toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Social dance night - effortless adaptation to all musical styles'
        }
      ]
    },

    // ULTRA-HIGH LEVEL - Competition/Master level
    {
      id: 'skill_test_7',
      name: 'Competition Performance',
      tags: ['Charisma', 'Communication', 'Leading', 'Following'],
      level: 15,
      status: 'focus',
      notes: `# Competition Performance - Elite Level 🏆

**Competition-grade** performance skills combining technical mastery with stage presence and artistic expression.

## 🥇 ELITE FOCUS TRAINING 🥇

> **Championship Goal**: Place top 3 in Regional Championships  
> **Current XP**: 92/120 (77%)  
> **Performance Level**: Semi-Professional

### Competition Elements

#### Technical Mastery ✅
- **Flawless execution** of advanced moves
- **Perfect timing** and musical interpretation  
- **Seamless transitions** between complex combinations
- **Advanced partner connection** and communication

#### Artistic Expression 🎭
- **Stage presence** and audience engagement
- **Storytelling** through movement
- **Character development** and emotional range
- **Personal style** and creative choreography

#### Performance Psychology 🧠
- **Confidence under pressure** - competition nerves management
- **Flow state** achievement during performance
- **Recovery skills** - handling mistakes gracefully
- **Audience connection** - performing beyond just technique

### Competition Preparation

#### Recent Competitions
1. **City Championships** (2 months ago) - *2nd Place Advanced*
2. **Regional Qualifier** (1 month ago) - *1st Place Advanced*  
3. **National Qualifier** (next month) - *Target: Top 3*

#### Training Schedule
\`\`\`
Monday: Technical drilling (2 hours)
Wednesday: Choreography refinement (2 hours)  
Friday: Performance practice with music (1.5 hours)
Saturday: Partner training intensive (3 hours)
Sunday: Competition simulation (1 hour)
\`\`\`

### Judge Feedback Analysis

> **Technical Judge**: "Exceptional skill level. Clean execution throughout. Work on maintaining energy in final third of routine."

> **Artistic Judge**: "Beautiful storytelling and emotional connection. Consider varying dynamics more in middle section."

> **Overall**: "Championship potential. Consistency and stamina are key areas for final improvement."

### Focus Training Targets
- [ ] **Stamina building** - Maintain peak performance through full routine
- [ ] **Dynamic variation** - More contrast in energy levels  
- [ ] **Pressure training** - Competition simulation practice
- [x] **Technical polish** - All moves at competition standard

---
**Status**: 🏆 *Elite Competition Training*  
**Next Event**: Regional Championships in 3 weeks`,
      dateCreated: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      dateModified: now,
      easeFactor: 4.2,
      interval: 3,
      repetitions: 75,
      lastPracticed: now,
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      focusData: {
        consecutiveGoodSessions: 8,
        totalSessions: 45,
        currentXP: 92,
        targetXP: 120,
        lastQuality: 3,
        readyForLevelUp: false
      },
      progressionHistory: [
        {
          level: 10,
          date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Started serious competition training - advanced level',
          previousLevel: 9
        },
        {
          level: 12,
          date: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'First competition placement - 3rd in local championship',
          previousLevel: 10
        },
        {
          level: 13,
          date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Consistent top 3 placements, improved stage presence',
          previousLevel: 12
        },
        {
          level: 14,
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Regional level competitor - 2nd place at city championships',
          previousLevel: 13
        },
        {
          level: 15,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          comment: 'Elite level achieved - qualified for nationals',
          previousLevel: 14
        }
      ],
      practiceLog: [
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Perfect run-through of competition routine. Ready for nationals!'
        },
        {
          date: yesterday.toISOString(),
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Competition simulation with judges - scored 9.2/10 average'
        },
        {
          date: now,
          quality: 3,
          qualityText: 'Very Easy',
          note: 'Peak performance achieved! Feeling ready for championship level'
        }
      ]
    }
  ]
}