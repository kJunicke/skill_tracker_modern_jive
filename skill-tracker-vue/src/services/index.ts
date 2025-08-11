// Core Services
export { SkillService } from './core/SkillService'
export { StorageService } from './core/StorageService'
export { SpacedRepetitionService } from './core/SpacedRepetitionService'
export { AnalyticsService } from './core/AnalyticsService'

// Adapters
export { LocalStorageAdapter } from './adapters/LocalStorageAdapter'

// Types
export type { CreateSkillDto, UpdateSkillDto, PracticeSessionDto, ValidationResult } from './core/SkillService'
export type { StorageAdapter } from './core/StorageService'
export type { SM2Update, FocusProgression } from './core/SpacedRepetitionService'
export type { TrainingStats, SkillsByStatus } from './core/AnalyticsService'

// Service Container
import { SkillService } from './core/SkillService'
import { StorageService } from './core/StorageService'
import { SpacedRepetitionService } from './core/SpacedRepetitionService'
import { AnalyticsService } from './core/AnalyticsService'
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter'

/**
 * Service container tokens for dependency injection
 */
export const SERVICE_TOKENS = {
  SKILL_SERVICE: Symbol('SkillService'),
  STORAGE_SERVICE: Symbol('StorageService'),
  SPACED_REPETITION_SERVICE: Symbol('SpacedRepetitionService'),
  ANALYTICS_SERVICE: Symbol('AnalyticsService'),
  STORAGE_ADAPTER: Symbol('StorageAdapter')
} as const

/**
 * Service container interface
 */
export interface ServiceContainer {
  [SERVICE_TOKENS.SKILL_SERVICE]: SkillService
  [SERVICE_TOKENS.STORAGE_SERVICE]: StorageService
  [SERVICE_TOKENS.SPACED_REPETITION_SERVICE]: SpacedRepetitionService
  [SERVICE_TOKENS.ANALYTICS_SERVICE]: AnalyticsService
  [SERVICE_TOKENS.STORAGE_ADAPTER]: LocalStorageAdapter
}

/**
 * Create and configure the service container
 */
export function createServiceContainer(): ServiceContainer {
  // Create adapter layer
  const storageAdapter = new LocalStorageAdapter()
  
  // Create services
  const storageService = new StorageService(storageAdapter)
  const spacedRepetitionService = new SpacedRepetitionService()
  const analyticsService = new AnalyticsService()
  const skillService = new SkillService(storageService, spacedRepetitionService, analyticsService)

  return {
    [SERVICE_TOKENS.SKILL_SERVICE]: skillService,
    [SERVICE_TOKENS.STORAGE_SERVICE]: storageService,
    [SERVICE_TOKENS.SPACED_REPETITION_SERVICE]: spacedRepetitionService,
    [SERVICE_TOKENS.ANALYTICS_SERVICE]: analyticsService,
    [SERVICE_TOKENS.STORAGE_ADAPTER]: storageAdapter
  }
}

// Global service container instance (singleton)
let serviceContainer: ServiceContainer | null = null

/**
 * Get the global service container instance
 */
export function getServiceContainer(): ServiceContainer {
  if (!serviceContainer) {
    serviceContainer = createServiceContainer()
  }
  return serviceContainer
}

/**
 * Reset the service container (primarily for testing)
 */
export function resetServiceContainer(): void {
  serviceContainer = null
}