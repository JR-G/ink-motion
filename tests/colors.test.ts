import { afterEach, describe, expect, it } from 'bun:test'
import { __resetTerminalColorDetectionCacheForTests, detectTerminalBackgroundColor } from '../src/utils/colors.js'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  __resetTerminalColorDetectionCacheForTests()
})

describe('detectTerminalBackgroundColor', () => {
  it('uses explicit INK_MOTION_BACKGROUND_COLOR override when set', () => {
    process.env.INK_MOTION_BACKGROUND_COLOR = '#123456'
    process.env.COLORFGBG = '15;0'
    expect(detectTerminalBackgroundColor()).toBe('#123456')
  })

  it('uses COLORFGBG when available', () => {
    delete process.env.INK_MOTION_BACKGROUND_COLOR
    process.env.COLORFGBG = '15;0'
    expect(detectTerminalBackgroundColor()).toBe('#000000')

    process.env.COLORFGBG = '0;15'
    expect(detectTerminalBackgroundColor()).toBe('#ffffff')
  })

  it('supports COLORFGBG values in the ANSI 256 range', () => {
    delete process.env.INK_MOTION_BACKGROUND_COLOR
    process.env.COLORFGBG = '15;237'
    expect(detectTerminalBackgroundColor()).toBe('#3a3a3a')

    process.env.COLORFGBG = '15;231'
    expect(detectTerminalBackgroundColor()).toBe('#ffffff')
  })

  it('falls back to TERM_THEME hint', () => {
    delete process.env.INK_MOTION_BACKGROUND_COLOR
    delete process.env.COLORFGBG
    process.env.TERM_THEME = 'light'
    expect(detectTerminalBackgroundColor()).toBe('#ffffff')
  })

  it('defaults to dark when no signal exists', () => {
    delete process.env.INK_MOTION_BACKGROUND_COLOR
    delete process.env.COLORFGBG
    delete process.env.TERM_THEME
    delete process.env.VSCODE_THEME_KIND
    delete process.env.GHOSTTY_BIN_DIR
    expect(detectTerminalBackgroundColor()).toBeNull()
  })
})
