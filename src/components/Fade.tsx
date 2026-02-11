import type { BaseEffectProps, Color, EasingName } from '../types/index.js'
import chalk from 'chalk'
import { Text } from 'ink'
import { useEffect, useMemo, useRef, useState } from 'react'
import { detectTerminalBackgroundColor, queryTerminalBackgroundColor } from '../fade/background-detection.js'
import { warnAutoBackgroundFallbackOnce } from '../fade/logger.js'
import { useElapsedTime } from '../hooks/useElapsedTime.js'
import { colorize, interpolateColor } from '../utils/colors.js'
import { getEasingFunction } from '../utils/easing.js'

interface FadeProps extends BaseEffectProps {
  /**
   * Text color.
   *
   * @default '#ffffff'
   * @example 'yellow'
   */
  color?: Color

  /**
   * Background color used as the fade target.
   * Set to `'auto'` to detect terminal background from runtime hints.
   *
   * @default 'auto'
   */
  backgroundColor?: Color | 'auto'

  /**
   * Starting opacity (0-1).
   * @default 0
   */
  from?: number

  /**
   * Ending opacity (0-1).
   * @default 1
   */
  to?: number

  /**
   * Duration in milliseconds.
   * @default 1000
   */
  duration?: number

  /**
   * Easing function.
   * @default 'ease-out'
   */
  easing?: EasingName

  /**
   * Loop animation continuously.
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
const DEFAULT_BACKGROUND_COLOR = 'auto'
const FALLBACK_FADE_DIM_1 = 0.66
const FALLBACK_FADE_DIM_2 = 0.33
const FALLBACK_FADE_HIDE = 0.12

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
 * Fade effect component that smoothly transitions text opacity.
 *
 * By default, this component fades text toward the detected terminal background color.
 * When detection is unavailable, it uses a graceful dim/hide fallback to avoid abrupt
 * transitions on unknown themes.
 */
export function Fade({
  children,
  color,
  backgroundColor = DEFAULT_BACKGROUND_COLOR,
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  duration = DEFAULT_DURATION_MS,
  easing = DEFAULT_EASING,
  loop = DEFAULT_LOOP,
  speed = DEFAULT_SPEED,
  enabled = true,
  onComplete,
}: FadeProps) {
  const hasCalledOnCompleteRef = useRef(false)
  const elapsedTime = useElapsedTime(enabled, speed, loop ? undefined : duration)
  const [autoDetectedBackground, setAutoDetectedBackground] = useState<Color | null>(() => {
    if (backgroundColor !== 'auto')
      return null

    return detectTerminalBackgroundColor()
  })

  const fadeTargetColor = useMemo(() => {
    if (backgroundColor !== 'auto')
      return backgroundColor

    return autoDetectedBackground
  }, [backgroundColor, autoDetectedBackground])

  useEffect(() => {
    if (backgroundColor !== 'auto')
      return

    if (autoDetectedBackground !== null)
      return

    let cancelled = false
    queryTerminalBackgroundColor().then((queriedColor) => {
      if (cancelled)
        return

      if (queriedColor === null) {
        warnAutoBackgroundFallbackOnce()
        return
      }

      setAutoDetectedBackground(queriedColor)
    })

    return () => {
      cancelled = true
    }
  }, [backgroundColor, autoDetectedBackground])

  useEffect(() => {
    if (!enabled)
      return

    const isComplete = elapsedTime >= duration

    if (isComplete && !loop && !hasCalledOnCompleteRef.current) {
      hasCalledOnCompleteRef.current = true
      onComplete?.()
    }
  }, [elapsedTime, duration, loop, enabled, onComplete])

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

    if (opacity <= 0)
      return ''

    const baseColor = color ?? '#ffffff'
    const clampedOpacity = Math.min(Math.max(opacity, 0), 1)
    if (fadeTargetColor === null) {
      if (clampedOpacity <= FALLBACK_FADE_HIDE)
        return ''

      const base = colorize(children, baseColor)
      if (clampedOpacity >= FALLBACK_FADE_DIM_1)
        return base
      if (clampedOpacity >= FALLBACK_FADE_DIM_2)
        return chalk.dim(base)
      return chalk.dim(chalk.dim(base))
    }

    const fadedColor = interpolateColor(fadeTargetColor, baseColor, clampedOpacity)

    return colorize(children, fadedColor)
  }, [children, elapsedTime, duration, from, to, easing, color, loop, fadeTargetColor])

  return <Text>{fadedText}</Text>
}
