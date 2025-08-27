/**
 * Unified quality helpers to avoid code duplication across components
 * Centralizes all quality-related transformations and mappings
 */

export type QualityLevel = 1 | 2 | 3 | 4

export interface QualityConfig {
  text: string
  color: string
  bgColor: string
  icon: string
}

/**
 * Quality configuration mapping (1-4 scale)
 * 1 = Forgotten, 2 = Hard, 3 = Good, 4 = Very Easy
 */
const QUALITY_CONFIG: Record<QualityLevel, QualityConfig> = {
  1: {
    text: 'Forgotten',
    color: 'danger',
    bgColor: 'bg-danger',
    icon: 'bi-x-circle'
  },
  2: {
    text: 'Hard',
    color: 'warning', 
    bgColor: 'bg-warning',
    icon: 'bi-exclamation-triangle'
  },
  3: {
    text: 'Good',
    color: 'success',
    bgColor: 'bg-success', 
    icon: 'bi-check-circle'
  },
  4: {
    text: 'Very Easy',
    color: 'primary',
    bgColor: 'bg-primary',
    icon: 'bi-star-fill'
  }
}

/**
 * Fallback configuration for invalid quality values
 */
const FALLBACK_CONFIG: QualityConfig = {
  text: 'Unknown',
  color: 'secondary',
  bgColor: 'bg-secondary',
  icon: 'bi-circle'
}

/**
 * Get quality configuration for a given quality level
 */
function getQualityConfig(quality: number): QualityConfig {
  const config = QUALITY_CONFIG[quality as QualityLevel]
  if (!config) {
    console.warn(`[FALLBACK] qualityUtils.getQualityConfig: Invalid quality value "${quality}", using fallback config. Expected 1-4.`)
    return FALLBACK_CONFIG
  }
  return config
}

/**
 * Quality helper functions - centralized to avoid duplication
 */
export const QualityHelpers = {
  /**
   * Get quality text (e.g., 'Good', 'Hard')
   */
  getText: (quality: number): string => {
    return getQualityConfig(quality).text
  },

  /**
   * Get quality color name (e.g., 'success', 'warning')
   */
  getColor: (quality: number): string => {
    return getQualityConfig(quality).color
  },

  /**
   * Get quality background color class (e.g., 'bg-success', 'bg-warning')
   */
  getBgColor: (quality: number): string => {
    return getQualityConfig(quality).bgColor
  },

  /**
   * Get quality icon class (e.g., 'bi-check-circle', 'bi-exclamation-triangle')
   */
  getIcon: (quality: number): string => {
    return getQualityConfig(quality).icon
  },

  /**
   * Get complete quality configuration
   */
  getConfig: (quality: number): QualityConfig => {
    return getQualityConfig(quality)
  },

  /**
   * Get all quality configurations (useful for generating UI lists)
   */
  getAllConfigs: (): Record<QualityLevel, QualityConfig> => {
    return { ...QUALITY_CONFIG }
  },

  /**
   * Validate quality level
   */
  isValidQuality: (quality: number): quality is QualityLevel => {
    return quality >= 1 && quality <= 4 && Number.isInteger(quality)
  },

  /**
   * Get quality level from text
   */
  getQualityFromText: (text: string): QualityLevel | null => {
    const entry = Object.entries(QUALITY_CONFIG).find(([, config]) => 
      config.text.toLowerCase() === text.toLowerCase()
    )
    return entry ? parseInt(entry[0]) as QualityLevel : null
  }
}