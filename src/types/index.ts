/**
 * Colour value as hex (#ff0000), rgb (rgb(255,0,0)), or named (red, blue, etc.)
 */
export type Color = string

/**
 * Branded opacity value (0-1)
 */
export type Opacity = number & { readonly __brand: 'Opacity' }

/**
 * Branded speed value (>0)
 */
export type Speed = number & { readonly __brand: 'Speed' }

/**
 * Branded intensity value (0-1)
 */
export type Intensity = number & { readonly __brand: 'Intensity' }

/**
 * Easing function that takes normalised time (0-1) and returns eased value (0-1)
 */
export type EasingFunction = (time: number) => number

/**
 * Named easing functions
 */
export type EasingName = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

/**
 * Base props shared by all effect components
 */
export interface BaseEffectProps {
  /**
   * Text to animate (required)
   */
  children: string

  /**
   * Animation speed multiplier
   * @default 1
   * @example 0.5 // half speed
   * @example 2 // double speed
   */
  speed?: number

  /**
   * Enable/disable animation
   * @default true
   */
  enabled?: boolean

  /**
   * Callback when animation completes
   */
  onComplete?: () => void
}

/**
 * Creates a validated Opacity value
 * @param value - Number between 0 and 1
 * @throws {Error} If value is outside 0-1 range
 */
export function createOpacity(value: number): Opacity {
  if (value < 0 || value > 1)
    throw new Error(`Opacity must be between 0 and 1, got ${value}`)
  return value as Opacity
}

/**
 * Creates a validated Speed value
 * @param value - Number greater than 0
 * @throws {Error} If value is not positive
 */
export function createSpeed(value: number): Speed {
  if (value <= 0)
    throw new Error(`Speed must be greater than 0, got ${value}`)
  return value as Speed
}

/**
 * Creates a validated Intensity value
 * @param value - Number between 0 and 1
 * @throws {Error} If value is outside 0-1 range
 */
export function createIntensity(value: number): Intensity {
  if (value < 0 || value > 1)
    throw new Error(`Intensity must be between 0 and 1, got ${value}`)
  return value as Intensity
}
