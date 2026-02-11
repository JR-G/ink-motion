import type { Buffer } from 'node:buffer'
import type { Color } from '../types/index.js'
import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { hexToRgb } from '../utils/colors.js'

const DECIMAL_BASE = 10
const HEX_BASE = 16
const HEX_BYTE_LENGTH = 2
const HEX_PAD_CHARACTER = '0'
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
const DEFAULT_OSC_QUERY_TIMEOUT_MS = 120
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

let cachedOscBackgroundColor: Color | null | undefined
let oscQueryPromise: Promise<Color | null> | null = null
let cachedGhosttyBackgroundColor: Color | null | undefined

function rgbToHex(red: number, green: number, blue: number): string {
  const redHex = red.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const greenHex = green.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  const blueHex = blue.toString(HEX_BASE).padStart(HEX_BYTE_LENGTH, HEX_PAD_CHARACTER)
  return `#${redHex}${greenHex}${blueHex}`
}

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

  if (channelHex.length === HEX_BYTE_LENGTH)
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
  if (vscodeTheme?.endsWith(THEME_DARK))
    return THEME_DARK
  if (vscodeTheme?.endsWith(THEME_LIGHT))
    return THEME_LIGHT

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
    const backgroundValue = output
      .split('\n')
      .map((candidate) => {
        const [key, value] = candidate.split('=')
        if (!key || !value)
          return null
        return key.trim() === 'background' ? value.trim() : null
      })
      .find((value): value is string => value !== null)
    const parsed = parseHexColorOrNull(backgroundValue)
    cachedGhosttyBackgroundColor = parsed
    return parsed
  }
  catch {
    cachedGhosttyBackgroundColor = null
    return null
  }
}

/**
 * Detects terminal background color using synchronous environment/provider hints.
 *
 * Detection order:
 * 1) `INK_MOTION_BACKGROUND_COLOR`
 * 2) `COLORFGBG`
 * 3) `TERM_THEME` / `VSCODE_THEME_KIND`
 * 4) provider-specific hint (Ghostty)
 * 5) unknown (`null`)
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

/**
 * Queries terminal background color via OSC 11 when direct detection is unavailable.
 * Results are cached for process lifetime.
 *
 * @param timeoutMs - Query timeout in milliseconds.
 */
export function queryTerminalBackgroundColor(timeoutMs: number = DEFAULT_OSC_QUERY_TIMEOUT_MS): Promise<Color | null> {
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

/**
 * Test hook to reset cached background-detection state between test cases.
 */
export function __resetTerminalColorDetectionCacheForTests(): void {
  cachedOscBackgroundColor = undefined
  oscQueryPromise = null
  cachedGhosttyBackgroundColor = undefined
}
