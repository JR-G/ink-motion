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
 * @param options.enabled - Whether cursor blinking is enabled
 * @param options.isComplete - Whether typing is complete
 * @returns Whether cursor should be visible
 */
export function useCursorBlink({
  enabled,
  isComplete,
}: UseCursorBlinkOptions): boolean {
  const [showCursor, setShowCursor] = useState(true)
  const intervalRef = useRef<Timer | null>(null)

  useEffect(() => {
    if (!enabled || isComplete) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- Intentional: synchronizing cursor visibility with prop changes
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
