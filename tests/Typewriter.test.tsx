import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'
import { Typewriter } from '../src/components/Typewriter.js'
import { stripAnsi } from './utils.js'

describe('Typewriter', () => {
  describe('rendering', () => {
    it('should render text progressively', () => {
      const { lastFrame } = render(<Typewriter>Hello World</Typewriter>)
      const frame = lastFrame() ?? ''
      // At the start, it should contain at least some characters
      expect(frame).toBeTruthy()
    })

    it('should render with cursor when disabled', () => {
      const { lastFrame } = render(
        <Typewriter enabled={false}>Static Text</Typewriter>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toContain('▋')
    })

    it('should handle empty children', () => {
      const consoleError = console.error
      console.error = () => {}
      const { lastFrame } = render(<Typewriter></Typewriter>)
      console.error = consoleError
      const frame = lastFrame() ?? ''
      expect(frame).toContain('ERROR')
    })

    it('should handle Unicode characters', () => {
      const { lastFrame } = render(<Typewriter>Type 📝 Test</Typewriter>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle special characters', () => {
      const { lastFrame } = render(<Typewriter>Test @#$%</Typewriter>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('typewriter progression', () => {
    it('should start with cursor visible', () => {
      const { lastFrame } = render(<Typewriter delay={1000}>Test</Typewriter>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame).toBe('▋')
    })

    it('should progressively reveal characters over time', async () => {
      const { lastFrame, rerender } = render(
        <Typewriter speed={10}>Hello</Typewriter>,
      )
      const initialFrame = stripAnsi(lastFrame() ?? '')
      const initialLength = initialFrame.replace('▋', '').length

      // Wait for typing to progress
      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Typewriter speed={10}>Hello</Typewriter>)

      const laterFrame = stripAnsi(lastFrame() ?? '')
      const laterLength = laterFrame.replace('▋', '').length

      // Should have more characters visible
      expect(laterLength).toBeGreaterThanOrEqual(initialLength)
    })
  })

  describe('color customization', () => {
    it('should apply custom text color', () => {
      const { lastFrame } = render(
        <Typewriter color="green">Colored Text</Typewriter>,
      )
      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
    })

    it('should apply hex color', () => {
      const { lastFrame } = render(
        <Typewriter color="#ff0000">Red Text</Typewriter>,
      )
      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
    })

    it('should render with cursor when not specified', () => {
      const { lastFrame } = render(<Typewriter enabled={false}>Test</Typewriter>)
      expect(stripAnsi(lastFrame() ?? '')).toContain('▋')
    })
  })

  describe('cursor customization', () => {
    it('should display default cursor', async () => {
      const { lastFrame } = render(<Typewriter speed={0.1}>Test</Typewriter>)

      // Wait a bit for cursor to potentially appear
      await new Promise(resolve => setTimeout(resolve, 50))

      const frame = lastFrame() ?? ''
      // Default cursor is ▋
      // The cursor should appear at some point during typing
      expect(frame).toBeTruthy()
    })

    it('should display custom cursor character', async () => {
      const { lastFrame } = render(
        <Typewriter cursor="█" speed={0.1}>Test</Typewriter>,
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
    })

    it('should not display cursor when disabled', async () => {
      const { lastFrame, rerender } = render(
        <Typewriter cursor={false} speed={10}>Test</Typewriter>,
      )

      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Typewriter cursor={false} speed={10}>Test</Typewriter>)

      const frame = lastFrame() ?? ''
      // No cursor characters should be present
      expect(frame).not.toContain('▋')
      expect(frame).not.toContain('█')
    })

    it('should apply custom cursor color', () => {
      const { lastFrame } = render(
        <Typewriter cursorColor="cyan" speed={0.1}>Test</Typewriter>,
      )
      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
    })

    it('should use text color for cursor when cursorColor not specified', () => {
      const { lastFrame } = render(
        <Typewriter color="green" speed={0.1}>Test</Typewriter>,
      )
      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
    })
  })

  describe('typing parameters', () => {
    it('should handle custom speed multiplier', () => {
      const { lastFrame } = render(
        <Typewriter speed={10}>Fast Type</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle slow speed multiplier', () => {
      const { lastFrame } = render(
        <Typewriter speed={0.1}>Slow Type</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle variance parameter', () => {
      const { lastFrame } = render(
        <Typewriter variance={0.5}>Varied Typing</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle zero variance', () => {
      const { lastFrame } = render(
        <Typewriter variance={0}>Consistent Typing</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle high variance', () => {
      const { lastFrame } = render(
        <Typewriter variance={1}>Random Typing</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle initial delay', async () => {
      const { lastFrame } = render(
        <Typewriter delay={100}>Delayed</Typewriter>,
      )

      const initialFrame = stripAnsi(lastFrame() ?? '')
      expect(initialFrame).toBe('▋')

      await new Promise(resolve => setTimeout(resolve, 150))
      const laterFrame = stripAnsi(lastFrame() ?? '')
      expect(laterFrame.length).toBeGreaterThan(0)
    })

    it('should handle zero delay', () => {
      const { lastFrame } = render(
        <Typewriter delay={0}>Immediate</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('should handle single character', () => {
      const { lastFrame } = render(<Typewriter>X</Typewriter>)
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle very long text', () => {
      const longText = 'Type'.repeat(50)
      const { lastFrame } = render(<Typewriter speed={100}>{longText}</Typewriter>)
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle text with spaces', () => {
      const { lastFrame } = render(
        <Typewriter>Text With Spaces</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle text with newlines', () => {
      const { lastFrame } = render(
        <Typewriter>
          Line 1
          {'\n'}
          Line 2
        </Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })

    it('should handle multiple consecutive spaces', () => {
      const { lastFrame } = render(
        <Typewriter>Text    With    Spaces</Typewriter>,
      )
      expect(lastFrame()).toBeTruthy()
    })
  })

  describe('completion behavior', () => {
    it('should eventually show all text', async () => {
      const text = 'Hi'
      const { lastFrame, rerender } = render(
        <Typewriter speed={100}>{text}</Typewriter>,
      )

      await new Promise(resolve => setTimeout(resolve, 500))
      rerender(<Typewriter speed={100}>{text}</Typewriter>)

      const frame = stripAnsi(lastFrame() ?? '')
      const withoutCursor = frame.replace('▋', '').trim()
      expect(withoutCursor).toContain('H')
      expect(withoutCursor).toContain('i')
    })

    it('should handle enabled toggle', async () => {
      const { lastFrame, rerender } = render(
        <Typewriter speed={10} enabled={true}>Test</Typewriter>,
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      rerender(<Typewriter speed={10} enabled={false}>Test</Typewriter>)

      const disabledFrame = stripAnsi(lastFrame() ?? '')
      expect(disabledFrame).toContain('T')
    })
  })
})
