import type { Color } from '../types/index.js'
import chalk from 'chalk'

const HEX_BASE = 16
const DECIMAL_BASE = 10
const HEX_BYTE_LENGTH = 2
const HEX_PAD_CHARACTER = '0'
const MIN_RGB_COMPONENTS = 3
const INTERPOLATION_MIDPOINT = 0.5
const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
const RGB_NUMBERS_REGEX = /\d+/g

export function rgbToHex(red: number, green: number, blue: number): string {
  const redHex = red.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const greenHex = green.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const blueHex = blue.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  return `#${redHex}${greenHex}${blueHex}`
}

/**
 * Converts a hex color string to RGB values.
 *
 * @param hex - Hex color string (with or without `#`).
 * @returns Tuple of `[red, green, blue]` values (0-255) or `null` if invalid.
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = HEX_COLOR_REGEX.exec(hex)
  if (!result)
    return null

  const [, redHex, greenHex, blueHex] = result
  if (!redHex || !greenHex || !blueHex)
    return null

  return [
    Number.parseInt(redHex, HEX_BASE),
    Number.parseInt(greenHex, HEX_BASE),
    Number.parseInt(blueHex, HEX_BASE),
  ]
}

/**
 * Applies color to text using chalk.
 *
 * @param text - Text to colorize.
 * @param color - Color as hex (`#ff0000`), rgb (`rgb(255,0,0)`), or named color (`red`, `blue`, etc).
 * @returns Colorized text with ANSI escape codes.
 */
export function colorize(text: string, color: Color): string {
  try {
    if (color.startsWith('#'))
      return chalk.hex(color)(text)

    if (color.startsWith('rgb')) {
      const match = color.match(RGB_NUMBERS_REGEX)
      if (!match || match.length < MIN_RGB_COMPONENTS)
        return text

      const [redStr, greenStr, blueStr] = match
      if (!redStr || !greenStr || !blueStr)
        return text

      const red = Number.parseInt(redStr, DECIMAL_BASE)
      const green = Number.parseInt(greenStr, DECIMAL_BASE)
      const blue = Number.parseInt(blueStr, DECIMAL_BASE)

      if (Number.isNaN(red) || Number.isNaN(green) || Number.isNaN(blue))
        return text

      return chalk.rgb(red, green, blue)(text)
    }

    const chalkColor = (chalk as any)[color]
    if (typeof chalkColor === 'function')
      return chalkColor(text)

    return text
  }
  catch {
    return text
  }
}

/**
 * Applies opacity to a hex color by darkening it.
 * Note: terminal approximation only; true alpha blending is not supported.
 *
 * @param color - Hex color string.
 * @param opacity - Opacity value from `0` (transparent/black) to `1` (fully opaque).
 * @returns Adjusted hex color or original color if input is not hex.
 */
export function applyOpacity(color: Color, opacity: number): Color {
  if (!color.startsWith('#'))
    return color

  const rgb = hexToRgb(color)
  if (!rgb)
    return color

  const [red, green, blue] = rgb
  const adjustedRed = Math.round(red * opacity)
  const adjustedGreen = Math.round(green * opacity)
  const adjustedBlue = Math.round(blue * opacity)

  return rgbToHex(adjustedRed, adjustedGreen, adjustedBlue)
}

/**
 * Interpolates between two colors.
 *
 * @param color1 - Starting color.
 * @param color2 - Ending color.
 * @param progress - Interpolation progress from `0` to `1`.
 * @returns Interpolated color (hex if both inputs are hex; otherwise nearest endpoint).
 */
export function interpolateColor(
  color1: Color,
  color2: Color,
  progress: number,
): Color {
  const isColor1Hex = color1.startsWith('#')
  const isColor2Hex = color2.startsWith('#')

  if (!isColor1Hex || !isColor2Hex)
    return progress < INTERPOLATION_MIDPOINT ? color1 : color2

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2)
    return progress < INTERPOLATION_MIDPOINT ? color1 : color2

  const [red1, green1, blue1] = rgb1
  const [red2, green2, blue2] = rgb2

  const red = Math.round(red1 + (red2 - red1) * progress)
  const green = Math.round(green1 + (green2 - green1) * progress)
  const blue = Math.round(blue1 + (blue2 - blue1) * progress)

  return rgbToHex(red, green, blue)
}

export {
  __resetTerminalColorDetectionCacheForTests,
  detectTerminalBackgroundColor,
  queryTerminalBackgroundColor,
} from '../fade/background-detection.js'
