# Development Workflow Guide

## Mandatory Development Workflow (CRITICAL)

**⚠️ IMPORTANT**: To prevent regressions and broken functionality, ALL development work MUST follow this workflow:

### Pre-Development Phase
1. **ALWAYS run existing tests first**: `npm run test:unit` to verify current state
2. **ALWAYS check type safety**: `npm run type-check` to ensure no existing type errors
3. **ALWAYS verify app runs**: `npm run dev` to confirm functionality before changes

### During Development Phase  
1. **Test-Driven Development MANDATORY**: Write failing tests BEFORE implementing changes
2. **Incremental Testing**: Run tests after each significant change, not just at the end
3. **Component Testing**: Test component functionality in isolation with proper mocking
4. **Event Chain Testing**: Verify event propagation through component hierarchy
5. **Type Safety**: Ensure all TypeScript interfaces are properly implemented

### Post-Development Phase (MANDATORY CHECKS)
1. **Run full test suite**: `npm run test:unit` - ALL tests must pass
2. **Type checking**: `npm run type-check` - NO type errors allowed
3. **Linting**: `npm run lint` - NO linting errors allowed  
4. **Functional verification**: `npm run dev` - Verify app starts and core functionality works
5. **Regression testing**: Test the specific functionality you changed manually in browser

### Refactoring Safety Protocol
When refactoring existing components:
1. **NEVER refactor without comprehensive tests first**
2. **Write regression tests** covering existing functionality before any code changes
3. **Test event propagation** through the entire component hierarchy
4. **Verify reactive data flow** - ensure Vue reactivity isn't broken by refactoring
5. **Test edge cases** like undefined props, empty arrays, and invalid states

### Critical Bug Prevention Patterns
Based on recent fixes, always check for:
- **Safe property access**: Use computed properties with fallbacks for undefined/invalid data
- **Event parameter consistency**: Ensure event emitters and handlers use matching parameter structures  
- **Reactive data flow**: Use `toRef()` when passing props to composables that use computed()
- **Type completeness**: Mock objects in tests must match complete interface definitions
- **Component hierarchy**: Verify event emission works through all parent-child relationships

### Test Coverage Requirements
- **90%+ coverage** for all service layer functions
- **Component tests** for all UI components with user interactions
- **Integration tests** for event chains spanning multiple components
- **Regression tests** for any bug fixes to prevent future occurrences
- **Edge case tests** for undefined states, empty data, and error conditions

**FAILURE TO FOLLOW THIS WORKFLOW WILL RESULT IN BROKEN FUNCTIONALITY AND REGRESSIONS**

## Test-Driven Development Strategy

**CRITICAL**: All new features and refactoring MUST include comprehensive tests

### Testing Requirements
- **Unit Tests**: MANDATORY for all service layer functions with 90%+ coverage
- **Component Tests**: Required for all new Vue components and major component changes
- **Integration Tests**: Required when components interact with services or stores
- **Regression Tests**: MUST be added when fixing bugs to prevent recurrence

### Service Layer Testing Standards
- **Business Logic**: Every service method MUST have unit tests covering:
  - Happy path scenarios
  - Error handling and edge cases
  - Input validation
  - State transitions
- **Mock Dependencies**: Use dependency injection pattern for testable services
- **Coverage Target**: Maintain 90%+ code coverage for all service classes

### Component Testing Guidelines
- **Vue Components**: Test user interactions, prop changes, and computed properties
- **Composables**: Unit test all reactive logic and side effects
- **Event Handling**: Verify proper event emission and handling
- **Accessibility**: Include basic accessibility tests (ARIA, keyboard navigation)

### Test Implementation Workflow
1. **Before Implementation**: Write failing tests for new functionality (TDD approach)
2. **During Implementation**: Ensure tests pass as features are built
3. **After Implementation**: Add edge case tests and improve coverage
4. **Refactoring**: Update existing tests and add regression tests
5. **Code Review**: Verify test quality and coverage before merging

### Testing Tools & Setup
- **Framework**: Vitest for unit and integration tests
- **Vue Testing**: @vue/test-utils for component testing
- **Mocking**: vi.fn() for mocking dependencies and external services
- **Coverage**: Istanbul/c8 for code coverage reporting
- **CI/CD**: Tests MUST pass in automated pipeline before deployment

### Test Quality Standards
- **Clear Test Names**: Use descriptive test names that explain the scenario
- **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
- **Single Responsibility**: Each test should verify one specific behavior
- **No Test Interdependence**: Tests MUST be able to run in any order
- **Fast Execution**: Unit tests should complete in milliseconds, not seconds

### Test File Organization
```
src/
├── services/
│   ├── __tests__/
│   │   ├── ServiceName.test.ts      // Unit tests for services
│   │   └── testHelpers/             // Shared test utilities
├── components/
│   ├── __tests__/
│   │   ├── ComponentName.test.vue   // Component tests
│   │   └── ComponentName.spec.ts    // Complex component logic tests
└── composables/
    └── __tests__/
        └── useComposableName.test.ts // Composable unit tests
```