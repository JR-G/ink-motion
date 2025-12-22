import type { BaseEffectProps, Colour, EasingName } from '../types/index.js'
import { Text } from 'ink'
import { useEffect, useMemo, useState } from 'react'
import { useElapsedTime } from '../hooks/useElapsedTime.js'
import { applyOpacity, colorize } from '../utils/colors.js'
import { getEasingFunction } from '../utils/easing.js'

interface FadeProps extends BaseEffectProps {
  /**
   * Text colour
   * @default '#ffffff'
   * @example 'yellow'
   */
  color?: Colour

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
const DEFAULT_EASING: EasingName = 'ease-out'
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
    const effectiveTime = loop ? elapsedTime % duration : Math.min(elapsedTime, duration)
    const opacity = calculateOpacity(effectiveTime, duration, from, to, easing)

    const baseColor = color ?? '#ffffff'
    const fadedColor = applyOpacity(baseColor, opacity)

    return colorize(children, fadedColor)
  }, [children, elapsedTime, duration, from, to, easing, color, loop])

  return <Text>{fadedText}</Text>
}
