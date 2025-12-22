import type { BaseEffectProps, Color, EasingName } from '../types/index.js'
import { Text } from 'ink'
import { useEffect, useMemo, useState } from 'react'
import { useElapsedTime } from '../hooks/useElapsedTime.js'
import { colorize, interpolateColor } from '../utils/colors.js'
import { getEasingFunction } from '../utils/easing.js'

interface FadeProps extends BaseEffectProps {
  /**
   * Text color
   * @default '#ffffff'
   * @example 'yellow'
   */
  color?: Color

  /**
   * Starting opacity (0-1)
   * @default 0
   */
  from?: number

  /**
   * Ending opacity (0-1)
   * @default 1
   */
  to?: number

  /**
   * Duration in milliseconds
   * @default 1000
   */
  duration?: number

  /**
   * Easing function
   * @default 'ease-out'
   */
  easing?: EasingName

  /**
   * Loop animation continuously
   * @default false
   */
  loop?: boolean
}

const DEFAULT_FROM = 0
const DEFAULT_TO = 1
const DEFAULT_DURATION_MS = 1000
const DEFAULT_EASING: EasingName = 'sine-in-out'
const DEFAULT_LOOP = false
const DEFAULT_SPEED = 1

function calculateOpacity(
  elapsedTime: number,
  duration: number,
  from: number,
  to: number,
  easing: EasingName,
): number {
  const progress = Math.min(elapsedTime / duration, 1)
  const easedProgress = getEasingFunction(easing)(progress)
  return from + (to - from) * easedProgress
}

/**
 * Fade effect component that smoothly transitions text opacity
 *
 * Animates text from one opacity to another using configurable easing functions.
 * Can loop continuously or run once.
 *
 * Note: Optimized for dark terminals. Fades to/from black which appears as true
 * transparency on dark backgrounds. On light terminals, low opacity text may appear
 * visible as dark text. For best results on all terminals, use bright colors.
 *
 * @example
 * ```tsx
 * <Fade color="yellow" from={0} to={1} duration={500} easing="ease-in">
 *   Success!
 * </Fade>
 * ```
 */
export function Fade({
  children,
  color,
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  duration = DEFAULT_DURATION_MS,
  easing = DEFAULT_EASING,
  loop = DEFAULT_LOOP,
  speed = DEFAULT_SPEED,
  enabled = true,
  onComplete,
}: FadeProps) {
  const [hasCompleted, setHasCompleted] = useState(false)
  const elapsedTime = useElapsedTime(enabled && !hasCompleted, speed)

  useEffect(() => {
    if (!enabled)
      return

    const isComplete = elapsedTime >= duration

    if (isComplete && !loop && !hasCompleted) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- Intentional: prevents calling onComplete multiple times by setting completion flag once
      setHasCompleted(true)
      onComplete?.()
    }
  }, [elapsedTime, duration, loop, hasCompleted, enabled, onComplete])

  const fadedText = useMemo(() => {
    let effectiveTime = elapsedTime
    if (loop) {
      const cycleTime = elapsedTime % (duration * 2)
      effectiveTime = cycleTime > duration ? (duration * 2) - cycleTime : cycleTime
    }
    else {
      effectiveTime = Math.min(elapsedTime, duration)
    }

    const opacity = calculateOpacity(effectiveTime, duration, from, to, easing)

    if (opacity < 0.01) {
      return ''
    }

    const baseColor = color ?? '#ffffff'
    const elegantOpacity = opacity ** 1.5
    const fadedColor = interpolateColor('#000000', baseColor, elegantOpacity)

    return colorize(children, fadedColor)
  }, [children, elapsedTime, duration, from, to, easing, color, loop])

  return <Text>{fadedText}</Text>
}
