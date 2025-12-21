import { Text } from 'ink'
import React, { useMemo } from 'react'
import type { BaseEffectProps, Color } from '../types/index.js'
import { useCursorBlink } from '../hooks/useCursorBlink.js'
import { useTypewriterProgress } from '../hooks/useTypewriterProgress.js'
import { colorize } from '../utils/colors.js'
import { getTextLength, splitChars } from '../utils/text.js'

interface TypewriterProps extends BaseEffectProps {
  /**
   * Text colour
   * @default undefined (inherits)
   * @example 'green'
   */
  color?: Color

  /**
   * Cursor character or false to disable
   * @default '▋'
   * @example '█'
   */
  cursor?: string | boolean

  /**
   * Cursor colour (defaults to text colour)
   * @default undefined
   * @example 'cyan'
   */
  cursorColor?: Color

  /**
   * Typing speed randomness (0-1) for more human-like typing
   * @default 0.3
   */
  variance?: number

  /**
   * Initial delay before typing starts (ms)
   * @default 0
   */
  delay?: number
}

const DEFAULT_CURSOR = '▋'
const DEFAULT_VARIANCE = 0.3
const DEFAULT_DELAY = 0
const DEFAULT_SPEED = 1
const FIRST_CHARACTER_INDEX = 0

function getCursorCharacter(cursor: string | boolean): string {
  return typeof cursor === 'string' ? cursor : DEFAULT_CURSOR
}

function formatCursor(
  cursorCharacter: string,
  cursorColor: Color | undefined,
  textColor: Color | undefined,
): string {
  if (cursorColor)
    return colorize(cursorCharacter, cursorColor)

  if (textColor)
    return colorize(cursorCharacter, textColor)

  return cursorCharacter
}

/**
 * Typewriter effect component that reveals text character by character
 *
 * Simulates typing text with configurable speed, variance for realistic timing,
 * and an optional cursor. The cursor blinks while typing is in progress.
 *
 * @example
 * ```tsx
 * <Typewriter color="green" cursor="█" variance={0.5} speed={2}>
 *   npm install ink-motion
 * </Typewriter>
 * ```
 */
export function Typewriter({
  children,
  color,
  cursor = DEFAULT_CURSOR,
  cursorColor,
  variance = DEFAULT_VARIANCE,
  delay = DEFAULT_DELAY,
  speed = DEFAULT_SPEED,
  enabled = true,
  onComplete,
}: TypewriterProps) {
  const characters = splitChars(children)
  const totalCharacters = getTextLength(children)

  const visibleCharacters = useTypewriterProgress({
    totalCharacters,
    speed,
    variance,
    initialDelay: delay,
    enabled,
    onComplete,
  })

  const hasCompletedTyping = visibleCharacters >= totalCharacters
  const isCursorEnabled = cursor !== false

  const showCursor = useCursorBlink({
    enabled: enabled && isCursorEnabled,
    isComplete: hasCompletedTyping,
  })

  const displayText = useMemo(() => {
    const visibleText = characters.slice(FIRST_CHARACTER_INDEX, visibleCharacters).join('')
    const coloredText = color ? colorize(visibleText, color) : visibleText

    const shouldShowCursor = isCursorEnabled && showCursor && !hasCompletedTyping
    if (!shouldShowCursor)
      return coloredText

    const cursorCharacter = getCursorCharacter(cursor)
    const cursorText = formatCursor(cursorCharacter, cursorColor, color)

    return coloredText + cursorText
  }, [characters, visibleCharacters, color, cursor, cursorColor, showCursor, hasCompletedTyping, isCursorEnabled])

  return <Text>{displayText}</Text>
}
