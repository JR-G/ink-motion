import { useEffect, useRef, useState } from 'react'
import { clamp } from '../utils/easing.js'

const BASE_CHARACTER_DELAY_MS = 80
const MIN_VARIANCE = 0
const MAX_VARIANCE = 1
const FIRST_CHARACTER_INDEX = 0

function calculateCharacterDelay(
  speed: number,
  variance: number,
): number {
  const clampedVariance = clamp(variance, MIN_VARIANCE, MAX_VARIANCE)
  const randomVariance = (Math.random() - 0.5) * clampedVariance
  return (BASE_CHARACTER_DELAY_MS / speed) * (1 + randomVariance)
}

interface UseTypewriterProgressOptions {
  totalCharacters: number
  speed: number
  variance: number
  initialDelay: number
  enabled: boolean
  onComplete?: () => void
}

/**
 * Hook that manages typewriter character reveal timing
 *
 * @param options - Configuration for typewriter progress
 * @param options.totalCharacters - Total number of characters to reveal
 * @param options.speed - Animation speed multiplier
 * @param options.variance - Typing variance for human-like timing (0-1)
 * @param options.initialDelay - Delay before typing starts in milliseconds
 * @param options.enabled - Whether the animation is enabled
 * @param options.onComplete - Callback when typing completes
 * @returns Number of characters to display
 */
export function useTypewriterProgress({
  totalCharacters,
  speed,
  variance,
  initialDelay,
  enabled,
  onComplete,
}: UseTypewriterProgressOptions): number {
  const [visibleCharacters, setVisibleCharacters] = useState(0)
  const timeoutRef = useRef<Timer>()
  const hasCompletedTyping = visibleCharacters >= totalCharacters

  useEffect(() => {
    if (!enabled)
      return

    if (hasCompletedTyping) {
      onComplete?.()
      return
    }

    const characterDelay = calculateCharacterDelay(speed, variance)
    const isFirstCharacter = visibleCharacters === FIRST_CHARACTER_INDEX
    const totalDelay = isFirstCharacter ? initialDelay + characterDelay : characterDelay

    timeoutRef.current = setTimeout(() => {
      setVisibleCharacters(previous => previous + 1)
    }, totalDelay)

    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current)
    }
  }, [visibleCharacters, enabled, speed, variance, initialDelay, hasCompletedTyping, onComplete])

  return visibleCharacters
}
