import type { BaseEffectProps, Color } from '../types/index.js'
import { Text } from 'ink'
import { useMemo } from 'react'
import { useElapsedTime } from '../hooks/useElapsedTime.js'
import { applyOpacity, colorize } from '../utils/colors.js'
import { clamp } from '../utils/easing.js'

interface FlashProps extends BaseEffectProps {
  /**
   * Base color
   * @default '#ffffff'
   * @example 'cyan'
   */
  color?: Color

  /**
   * Minimum brightness (0-1)
   * @default 0.3
   */
  minIntensity?: number

  /**
   * Maximum brightness (0-1)
   * @default 1
   */
  maxIntensity?: number

  /**
   * Flash cycle duration in milliseconds
   * @default 1000
   */
  duration?: number
}

const DEFAULT_COLOR = '#ffffff'
const DEFAULT_MIN_INTENSITY = 0.3
const DEFAULT_MAX_INTENSITY = 1
const DEFAULT_DURATION_MS = 1000
const DEFAULT_SPEED = 1
const FULL_CIRCLE_RADIANS = Math.PI * 2
const SINE_WAVE_OFFSET = 1
const SINE_WAVE_NORMALIZE = 0.5
const MIN_INTENSITY = 0
const MAX_INTENSITY = 1

function calculateFlashIntensity(
  time: number,
  duration: number,
  minIntensity: number,
  maxIntensity: number,
): number {
  const clampedMin = clamp(minIntensity, MIN_INTENSITY, MAX_INTENSITY)
  const clampedMax = clamp(maxIntensity, MIN_INTENSITY, MAX_INTENSITY)
  const normalizedTime = time / duration
  const phase = normalizedTime * FULL_CIRCLE_RADIANS
  const sineWave = Math.sin(phase)
  const normalizedSine = (sineWave + SINE_WAVE_OFFSET) * SINE_WAVE_NORMALIZE
  const intensityRange = clampedMax - clampedMin
  return clampedMin + normalizedSine * intensityRange
}

/**
 * Flash effect component that creates a pulsing neon-like glow
 *
 * Animates text with a continuous brightness pulse that oscillates
 * between minimum and maximum intensity levels, creating a flashing
 * or glowing neon effect.
 *
 * @example
 * ```tsx
 * <Flash color="cyan" minIntensity={0.3} maxIntensity={1} duration={800}>
 *   ⚡ NEON GLOW ⚡
 * </Flash>
 * ```
 */
export function Flash({
  children,
  color = DEFAULT_COLOR,
  minIntensity = DEFAULT_MIN_INTENSITY,
  maxIntensity = DEFAULT_MAX_INTENSITY,
  duration = DEFAULT_DURATION_MS,
  speed = DEFAULT_SPEED,
  enabled = true,
}: FlashProps) {
  const elapsedTime = useElapsedTime(enabled, speed)
  const cycleTime = elapsedTime % duration

  const flashText = useMemo(() => {
    const intensity = calculateFlashIntensity(cycleTime, duration, minIntensity, maxIntensity)
    const adjustedColor = applyOpacity(color, intensity)
    return colorize(children, adjustedColor)
  }, [children, cycleTime, duration, minIntensity, maxIntensity, color])

  return <Text>{flashText}</Text>
}
