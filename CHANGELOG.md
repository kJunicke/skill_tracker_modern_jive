# Changelog

All notable changes to the Modern Jive Skill Tracker project will be documented in this file.

## [Unreleased]

### 📱 Responsive Design Improvements
- **Mobile Dropdown Fix**: Fixed dropdown menus overflowing beyond screen boundaries on mobile devices
- **Action Bar Layout**: Improved button layout in main action bar to wrap properly on small screens
- **Responsive Positioning**: Dropdown menus now align left on mobile and right on desktop for optimal viewing
- **Mobile-First CSS**: Added comprehensive mobile styles for screens ≤ 575.98px width
- **Container Padding**: Added proper spacing to prevent content from touching screen edges
- **Button Flexibility**: Ensured action buttons maintain readable sizes and proper spacing on all screen sizes

### 🛠️ Technical Changes
- **SkillCardHeader.vue**: Changed `dropdown-menu-end` to `dropdown-menu-sm-end` for responsive alignment
- **AppActionBar.vue**: Implemented flex-column on mobile, flex-row on desktop with flex-wrap support
- **base.css**: Added mobile-specific styles for dropdown positioning and container constraints
- **Cross-Device Testing**: Verified responsive behavior across different viewport sizes

### 👤 User Experience
- **Mobile-Friendly Interface**: All UI elements now properly contained within viewport boundaries
- **Improved Touch Targets**: Better button spacing and sizing for mobile interaction
- **Consistent Layout**: Responsive design maintains visual hierarchy across all screen sizes
- **No Content Overflow**: Eliminated horizontal scrolling issues on small screens

### <� Timeline UI Improvements
- **Unified Timeline Experience**: Removed differences between sidebar and modal timeline views - both now use the same clean card-based layout
- **Date-Based Grouping**: Timeline entries are now grouped by date with clear headers showing activity counts (e.g., "Today - 3 activities")
- **Compact Layout**: Reduced vertical and horizontal spacing for better space utilization while maintaining readability
- **Purple Level Ups**: Changed level up indicator color from warning/success to distinctive purple (primary) for better visual hierarchy
- **Integrated Action Bar**: Moved "Mark as transferred" checkbox from bottom of cards to the action bar alongside edit/delete buttons
- **Universal Add to Notes**: "Add to notes" button now available in all timeline views for all event types
- **Streamlined Practice Sessions**: Removed XP display from practice session cards to reduce visual clutter
- **Enhanced Readability**: Improved date header styling with better contrast and cleaner typography
- **Individual Date Removal**: Removed redundant individual dates from timeline entries since they're now grouped by date headers

### =� Technical Improvements
- **New Component**: Created `TimelineGroupedView.vue` for centralized timeline rendering logic
- **Enhanced Composable**: Extended `useSkillTimeline.ts` with date grouping functionality (`groupEventsByDate()` and `formatGroupDate()`)
- **Code Consolidation**: Simplified timeline rendering by removing conditional compact/modal view logic
- **Maintained Test Coverage**: All 230+ unit tests continue to pass with timeline refactoring

### =� User Experience
- **Consistent Interface**: Timeline behavior is now identical across all views (sidebar, modal, notes editor)
- **Improved Scanning**: Date-based grouping makes it easier to find activities from specific time periods
- **Better Space Usage**: More compact design allows viewing more content in limited screen space
- **Clearer Visual Hierarchy**: Purple level ups stand out clearly from other activity types
- **Streamlined Actions**: All timeline actions are now consistently grouped and easily accessible

---

*Timeline improvements implemented on feature branch `feature/timeline-ui-improvements`*