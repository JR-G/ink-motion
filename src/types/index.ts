/**
 * Color value as hex (#ff0000), rgb (rgb(255,0,0)), or named (red, blue, etc.)
 */
export type Color = string

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
