import process from 'node:process'

const AUTO_BACKGROUND_FALLBACK_WARNING = '[ink-motion/Fade] Could not auto-detect terminal background. Using fallback dim/hide fade. Set `backgroundColor` or INK_MOTION_BACKGROUND_COLOR for exact blending.'

let hasWarnedAutoBackgroundFallback = false

/**
 * Emits the auto-background fallback warning once in debug/dev contexts.
 */
export function warnAutoBackgroundFallbackOnce(): void {
  const shouldWarn = process.env.NODE_ENV === 'development' || process.env.INK_MOTION_DEBUG === '1'
  if (!shouldWarn || hasWarnedAutoBackgroundFallback)
    return

  hasWarnedAutoBackgroundFallback = true
  console.warn(AUTO_BACKGROUND_FALLBACK_WARNING)
}

/**
 * Test hook to reset warning state between test cases.
 */
export function __resetFadeWarningsForTests(): void {
  hasWarnedAutoBackgroundFallback = false
}
