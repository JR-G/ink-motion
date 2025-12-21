import { useEffect, useRef } from 'react'

/**
 * Runs a callback on every animation frame using requestAnimationFrame
 *
 * @param callback - Function called each frame with delta time in ms
 * @param enabled - Whether animation is active
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  enabled: boolean = true,
): void {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      previousTimeRef.current = undefined
      return
    }

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callbackRef.current(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [enabled])
}
