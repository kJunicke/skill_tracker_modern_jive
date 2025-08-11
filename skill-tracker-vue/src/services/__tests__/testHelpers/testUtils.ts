import { vi, expect } from 'vitest'
import type { StorageAdapter } from '../../core/StorageService'

/**
 * Create a mock storage adapter for testing
 */
export function createMockStorageAdapter(): StorageAdapter {
  return {
    load: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined)
  }
}

/**
 * Create a mock storage adapter that simulates errors
 */
export function createFailingStorageAdapter(): StorageAdapter {
  return {
    load: vi.fn().mockRejectedValue(new Error('Storage load failed')),
    save: vi.fn().mockRejectedValue(new Error('Storage save failed')),
    remove: vi.fn().mockRejectedValue(new Error('Storage remove failed')),
    clear: vi.fn().mockRejectedValue(new Error('Storage clear failed'))
  }
}

/**
 * Utility to create a date string relative to now
 */
export function getDateRelativeToNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

/**
 * Utility to create a date string for testing
 */
export function createTestDate(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toISOString()
}

/**
 * Wait for next tick (useful for async testing)
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Test constants for consistent values
 */
export const TEST_CONSTANTS = {
  SKILL_ID: 'test_skill_123',
  USER_ID: 'test_user_456',
  BASE_DATE: '2023-01-01T00:00:00.000Z',
  FUTURE_DATE: '2023-12-31T23:59:59.999Z',
  PAST_DATE: '2022-01-01T00:00:00.000Z',
  QUALITY_LEVELS: {
    FORGOTTEN: 0,
    HARD: 1,
    GOOD: 2,
    VERY_EASY: 3
  },
  DEFAULT_EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 3.0
} as const

/**
 * Helper to assert error throwing in async functions
 */
export async function expectAsyncError<T>(
  asyncFn: () => Promise<T>,
  expectedError: string | RegExp
): Promise<void> {
  try {
    await asyncFn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (error instanceof Error) {
      if (typeof expectedError === 'string') {
        expect(error.message).toBe(expectedError)
      } else {
        expect(error.message).toMatch(expectedError)
      }
    } else {
      throw error
    }
  }
}

/**
 * Helper to spy on console methods and restore them
 */
export function spyOnConsole() {
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info
  }

  const spies = {
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {})
  }

  const restore = () => {
    Object.values(spies).forEach(spy => {
      spy.mockRestore()
    })
  }

  return { spies, restore, originalConsole }
}

/**
 * Helper to create a range of numbers for testing
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Helper to generate unique IDs for testing
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}