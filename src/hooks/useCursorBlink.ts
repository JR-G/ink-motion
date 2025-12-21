import { useEffect, useRef, useState } from 'react'

const CURSOR_BLINK_INTERVAL_MS = 500

interface UseCursorBlinkOptions {
  enabled: boolean
  isComplete: boolean
}

/**
 * Hook that manages cursor blinking state
 *
 * @param options - Configuration for cursor blink
 * @returns Whether cursor should be visible
 */
export function useCursorBlink({
  enabled,
  isComplete,
}: UseCursorBlinkOptions): boolean {
  const [showCursor, setShowCursor] = useState(true)
  const intervalRef = useRef<Timer>()

  useEffect(() => {
    if (!enabled || isComplete) {
      setShowCursor(false)
      return
    }

    intervalRef.current = setInterval(() => {
      setShowCursor(previous => !previous)
    }, CURSOR_BLINK_INTERVAL_MS)

    return () => {
      if (intervalRef.current)
        clearInterval(intervalRef.current)
    }
  }, [enabled, isComplete])

  return showCursor
}
