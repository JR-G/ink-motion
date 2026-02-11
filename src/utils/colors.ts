import type { Buffer } from 'node:buffer'
import type { Color } from '../types/index.js'
import { execFileSync } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'

const HEX_BASE = 16
const DECIMAL_BASE = 10
const HEX_BYTE_LENGTH = 2
const HEX_PAD_CHARACTER = '0'
const MIN_RGB_COMPONENTS = 3
const INTERPOLATION_MIDPOINT = 0.5
const ANSI_256_MAX = 255
const THEME_DARK = 'dark'
const THEME_LIGHT = 'light'
const ANSI_16_COUNT = 16
const ANSI_256_CUBE_START = 16
const ANSI_256_CUBE_STRIDE = 36
const ANSI_256_CUBE_ROW = 6
const ANSI_256_LEVELS = [0, 95, 135, 175, 215, 255] as const
const ANSI_256_GRAYSCALE_START = 232
const ANSI_256_GRAYSCALE_BASE = 8
const ANSI_256_GRAYSCALE_STEP = 10
const OSC_QUERY_TIMEOUT_MS = 120
const OSC_11_PREFIX = '\u001B]11;rgb:'
const OSC_BELL_SUFFIX = '\u0007'
const OSC_ST_SUFFIX = '\u001B\\'

const ANSI_16_TO_HEX: Record<number, string> = {
  0: '#000000',
  1: '#800000',
  2: '#008000',
  3: '#808000',
  4: '#000080',
  5: '#800080',
  6: '#008080',
  7: '#c0c0c0',
  8: '#808080',
  9: '#ff0000',
  10: '#00ff00',
  11: '#ffff00',
  12: '#0000ff',
  13: '#ff00ff',
  14: '#00ffff',
  15: '#ffffff',
}

const HEX_COLOR_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
const RGB_NUMBERS_REGEX = /\d+/g
let cachedOscBackgroundColor: Color | null | undefined
let oscQueryPromise: Promise<Color | null> | null = null
let cachedGhosttyBackgroundColor: Color | null | undefined

function parseColorFgbgBackgroundIndex(colorFgbg: string): number | null {
  const tokens = colorFgbg.split(';')
  const backgroundToken = tokens.at(-1)
  if (!backgroundToken)
    return null

  const parsed = Number.parseInt(backgroundToken, DECIMAL_BASE)
  if (Number.isNaN(parsed))
    return null

  if (parsed < 0 || parsed > ANSI_256_MAX)
    return null

  return parsed
}

function ansiIndexToHex(index: number): string {
  if (index < ANSI_16_COUNT)
    return ANSI_16_TO_HEX[index] ?? '#000000'

  if (index >= ANSI_256_GRAYSCALE_START) {
    const gray = ANSI_256_GRAYSCALE_BASE + ((index - ANSI_256_GRAYSCALE_START) * ANSI_256_GRAYSCALE_STEP)
    return rgbToHex(gray, gray, gray)
  }

  const cube = index - ANSI_256_CUBE_START
  const redLevel = Math.floor(cube / ANSI_256_CUBE_STRIDE)
  const greenLevel = Math.floor((cube % ANSI_256_CUBE_STRIDE) / ANSI_256_CUBE_ROW)
  const blueLevel = cube % ANSI_256_CUBE_ROW

  const red = ANSI_256_LEVELS[redLevel] ?? 0
  const green = ANSI_256_LEVELS[greenLevel] ?? 0
  const blue = ANSI_256_LEVELS[blueLevel] ?? 0

  return rgbToHex(red, green, blue)
}

function normalizeOscChannel(channelHex: string): number {
  const parsed = Number.parseInt(channelHex, HEX_BASE)
  if (Number.isNaN(parsed))
    return 0

  if (channelHex.length <= HEX_BYTE_LENGTH)
    return parsed

  const fullScale = (16 ** channelHex.length) - 1
  return Math.round((parsed / fullScale) * 255)
}

function parseOsc11Response(buffer: string): Color | null {
  const startIndex = buffer.indexOf(OSC_11_PREFIX)
  if (startIndex < 0)
    return null

  const payloadStart = startIndex + OSC_11_PREFIX.length
  const bellEnd = buffer.indexOf(OSC_BELL_SUFFIX, payloadStart)
  const stEnd = buffer.indexOf(OSC_ST_SUFFIX, payloadStart)

  let payloadEnd = -1
  if (bellEnd >= 0 && stEnd >= 0)
    payloadEnd = Math.min(bellEnd, stEnd)
  else if (bellEnd >= 0)
    payloadEnd = bellEnd
  else if (stEnd >= 0)
    payloadEnd = stEnd

  if (payloadEnd < 0)
    return null

  const payload = buffer.slice(payloadStart, payloadEnd)
  const [redHex, greenHex, blueHex] = payload.split('/')
  if (!redHex || !greenHex || !blueHex)
    return null

  const red = normalizeOscChannel(redHex)
  const green = normalizeOscChannel(greenHex)
  const blue = normalizeOscChannel(blueHex)
  return rgbToHex(red, green, blue)
}

function buildOsc11QuerySequence(): string {
  const osc11Query = '\u001B]11;?\u0007'
  if (!process.env.TMUX)
    return osc11Query

  // tmux passthrough wrapper so the terminal receives OSC query.
  return `\u001BPtmux;\u001B${osc11Query}\u001B\\`
}

function getTerminalThemeHint(): 'dark' | 'light' | null {
  const rawTheme = process.env.TERM_THEME?.toLowerCase()
  if (rawTheme === THEME_DARK || rawTheme === THEME_LIGHT)
    return rawTheme

  const vscodeTheme = process.env.VSCODE_THEME_KIND?.toLowerCase()
  if (vscodeTheme === THEME_DARK || vscodeTheme === THEME_LIGHT)
    return vscodeTheme

  return null
}

function parseHexColorOrNull(color: string | undefined): Color | null {
  if (!color)
    return null

  const value = color.trim()
  if (!value.startsWith('#'))
    return null

  return hexToRgb(value) ? value : null
}

function detectGhosttyBackgroundColor(): Color | null {
  if (cachedGhosttyBackgroundColor !== undefined)
    return cachedGhosttyBackgroundColor

  const ghosttyBinDir = process.env.GHOSTTY_BIN_DIR
  if (!ghosttyBinDir) {
    cachedGhosttyBackgroundColor = null
    return null
  }

  try {
    const output = execFileSync(`${ghosttyBinDir}/ghostty`, ['+show-config', '--default'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 500,
    })
    const line = output.split('\n').find(candidate => candidate.trim().startsWith('background'))
    const parsed = parseHexColorOrNull(line?.split('=').at(-1))
    cachedGhosttyBackgroundColor = parsed
    return parsed
  }
  catch {
    cachedGhosttyBackgroundColor = null
    return null
  }
}

/**
 * Best-effort terminal background color detection.
 *
 * Detection order:
 * 1) Explicit env override (`INK_MOTION_BACKGROUND_COLOR`)
 * 2) COLORFGBG index mapping
 * 3) Theme hints (TERM_THEME / VSCODE_THEME_KIND)
 * 4) Terminal-specific providers when detectable (e.g. Ghostty)
 * 5) Unknown -> null
 */
export function detectTerminalBackgroundColor(): Color | null {
  const explicitBackground = parseHexColorOrNull(process.env.INK_MOTION_BACKGROUND_COLOR)
  if (explicitBackground)
    return explicitBackground

  const colorFgbg = process.env.COLORFGBG
  if (colorFgbg) {
    const backgroundIndex = parseColorFgbgBackgroundIndex(colorFgbg)
    if (backgroundIndex !== null)
      return ansiIndexToHex(backgroundIndex)
  }

  const themeHint = getTerminalThemeHint()
  if (themeHint === THEME_LIGHT)
    return '#ffffff'
  if (themeHint === THEME_DARK)
    return '#000000'

  const ghosttyBackground = detectGhosttyBackgroundColor()
  if (ghosttyBackground)
    return ghosttyBackground

  return null
}

export function queryTerminalBackgroundColor(timeoutMs: number = OSC_QUERY_TIMEOUT_MS): Promise<Color | null> {
  if (cachedOscBackgroundColor !== undefined)
    return Promise.resolve(cachedOscBackgroundColor)

  if (oscQueryPromise)
    return oscQueryPromise

  if (!process.stdout.isTTY || !process.stdin.isTTY) {
    cachedOscBackgroundColor = null
    return Promise.resolve(null)
  }

  oscQueryPromise = new Promise((resolve) => {
    let buffer = ''
    let finished = false
    let timeout: ReturnType<typeof setTimeout>
    let onData: ((chunk: Buffer | string) => void) | null = null

    const finish = (color: Color | null) => {
      if (finished)
        return
      finished = true
      cachedOscBackgroundColor = color
      if (onData)
        process.stdin.off('data', onData)
      clearTimeout(timeout)
      oscQueryPromise = null
      resolve(color)
    }

    onData = (chunk: Buffer | string) => {
      buffer += chunk.toString()
      const parsedColor = parseOsc11Response(buffer)
      if (parsedColor)
        finish(parsedColor)
    }

    timeout = setTimeout(() => finish(null), timeoutMs)
    process.stdin.on('data', onData)

    try {
      process.stdout.write(buildOsc11QuerySequence())
    }
    catch {
      finish(null)
    }
  })

  return oscQueryPromise
}

// Test hook: resets cached detection state between test cases.
export function __resetTerminalColorDetectionCacheForTests(): void {
  cachedOscBackgroundColor = undefined
  oscQueryPromise = null
  cachedGhosttyBackgroundColor = undefined
}

function rgbToHex(red: number, green: number, blue: number): string {
  const redHex = red.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const greenHex = green.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const blueHex = blue.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  return `#${redHex}${greenHex}${blueHex}`
}

/**
 * Converts a hex color string to RGB values
 *
 * @param hex - Hex color string (with or without #)
 * @returns Tuple of [red, green, blue] values (0-255) or null if invalid
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
 * Applies color to text using chalk
 *
 * @param text - Text to colorize
 * @param color - Color as hex (#ff0000), rgb(255,0,0), or named color (red, blue, etc)
 * @returns Colorized text with ANSI escape codes
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
 * Applies opacity to a hex color by darkening it
 * Note: Terminal approximation - true opacity not possible in most terminals
 *
 * @param color - Hex color string
 * @param opacity - Opacity value from 0 (transparent/black) to 1 (fully opaque)
 * @returns Adjusted hex color or original color if not hex format
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
 * Interpolates between two colors
 *
 * @param color1 - Starting color
 * @param color2 - Ending color
 * @param progress - Interpolation progress from 0 to 1
 * @returns Interpolated color (hex if both inputs are hex, otherwise snaps to nearest)
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
