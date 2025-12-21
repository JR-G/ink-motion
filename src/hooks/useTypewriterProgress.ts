import { useEffect, useRef, useState } from 'react'

const BASE_CHARACTER_DELAY_MS = 80
const MIN_VARIANCE = 0
const MAX_VARIANCE = 1
const VARIANCE_CENTER = 0.5
const NO_VARIANCE_MULTIPLIER = 1
const FIRST_CHARACTER_INDEX = 0
const INCREMENT_BY_ONE = 1

function calculateCharacterDelay(
  speed: number,
  variance: number,
): number {
  const clampedVariance = Math.min(Math.max(variance, MIN_VARIANCE), MAX_VARIANCE)
  const randomVariance = (Math.random() - VARIANCE_CENTER) * clampedVariance
  return (BASE_CHARACTER_DELAY_MS / speed) * (NO_VARIANCE_MULTIPLIER + randomVariance)
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
      setVisibleCharacters(previous => previous + INCREMENT_BY_ONE)
    }, totalDelay)

    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current)
    }
  }, [visibleCharacters, enabled, speed, variance, initialDelay, hasCompletedTyping, onComplete])

  return visibleCharacters
}
