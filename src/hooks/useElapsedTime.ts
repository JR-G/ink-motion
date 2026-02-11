import { useState } from 'react'
import { useAnimationFrame } from './useAnimationFrame.js'

/**
 * Hook that tracks elapsed time since mount or last reset
 *
 * @param enabled - Whether to track time
 * @param speed - Speed multiplier (default: 1)
 * @returns Elapsed time in milliseconds
 */
export function useElapsedTime(
  enabled: boolean = true,
  speed: number = 1,
  maxElapsedTime?: number,
): number {
  const [elapsedTime, setElapsedTime] = useState(0)

  useAnimationFrame((deltaTime) => {
    setElapsedTime((prev) => {
      if (maxElapsedTime !== undefined && prev >= maxElapsedTime)
        return prev

      const next = prev + (deltaTime * speed)
      if (maxElapsedTime === undefined)
        return next

      return Math.min(next, maxElapsedTime)
    })
  }, enabled)

  return elapsedTime
}
