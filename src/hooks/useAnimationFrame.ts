import { useEffect, useRef } from 'react'

const TARGET_FPS = 60
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS

/**
 * Runs a callback on every animation frame using setInterval
 *
 * @param callback - Function called each frame with delta time in ms
 * @param enabled - Whether animation is active
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true,
): void {
  const intervalRef = useRef<Timer | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      previousTimeRef.current = null
      return
    }

    intervalRef.current = setInterval(() => {
      const currentTime = Date.now()
      if (previousTimeRef.current !== null) {
        const deltaTime = currentTime - previousTimeRef.current
        callbackRef.current(deltaTime)
      }
      previousTimeRef.current = currentTime
    }, FRAME_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled])
}
