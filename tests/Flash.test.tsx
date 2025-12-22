import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'
import { Flash } from '../src/components/Flash.js'
import { stripAnsi } from './utils.js'

describe('Flash', () => {
  describe('rendering', () => {
    it('should render children text with flash effect', () => {
      const { lastFrame } = render(<Flash>Flashing Text</Flash>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Flashing Text')
    })

    it('should render with frozen animation when disabled', () => {
      const { lastFrame } = render(<Flash enabled={false}>Static Flash</Flash>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Static Flash')
    })

    it('should handle empty children', () => {
      const { lastFrame } = render(<Flash>{'' as any}</Flash>)
      const frame = lastFrame() ?? ''
      expect(frame).toBe('')
    })

    it('should handle Unicode characters', () => {
      const { lastFrame } = render(<Flash>Flash ⚡ Effect</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toContain('⚡')
    })

    it('should handle special characters', () => {
      const { lastFrame } = render(<Flash>Test @#$% & *</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Test @#$% & *')
    })
  })

  describe('flash with colors', () => {
    it('should apply flash with default color', () => {
      const { lastFrame } = render(<Flash>Default Color</Flash>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Default Color')
    })

    it('should apply flash with custom hex color', () => {
      const { lastFrame } = render(
        <Flash color="#00ffff">Cyan Flash</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Cyan Flash')
    })

    it('should apply flash with named color', () => {
      const { lastFrame } = render(
        <Flash color="magenta">Magenta Flash</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Magenta Flash')
    })
  })

  describe('intensity parameters', () => {
    it('should handle default intensity range', () => {
      const { lastFrame } = render(<Flash>Default Intensity</Flash>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Default Intensity')
    })

    it('should handle custom minimum intensity', () => {
      const { lastFrame } = render(
        <Flash minIntensity={0.5}>High Min</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('High Min')
    })

    it('should handle custom maximum intensity', () => {
      const { lastFrame } = render(
        <Flash maxIntensity={0.8}>Low Max</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Low Max')
    })

    it('should handle custom intensity range', () => {
      const { lastFrame } = render(
        <Flash minIntensity={0.5} maxIntensity={1}>
          Bright Flash
        </Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Bright Flash')
    })

    it('should handle low intensity range', () => {
      const { lastFrame } = render(
        <Flash minIntensity={0.1} maxIntensity={0.3}>
          Dim Flash
        </Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Dim Flash')
    })

    it('should handle minimum intensity of 0', () => {
      const { lastFrame } = render(
        <Flash minIntensity={0}>Zero Min</Flash>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Zero Min')
    })

    it('should handle maximum intensity of 1', () => {
      const { lastFrame } = render(
        <Flash maxIntensity={1}>Full Max</Flash>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Full Max')
    })

    it('should handle same min and max intensity', () => {
      const { lastFrame } = render(
        <Flash minIntensity={0.5} maxIntensity={0.5}>
          Static Intensity
        </Flash>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Static Intensity')
    })
  })

  describe('duration and speed', () => {
    it('should handle default duration', () => {
      const { lastFrame } = render(<Flash>Default Duration</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Default Duration')
    })

    it('should handle custom short duration', () => {
      const { lastFrame } = render(
        <Flash duration={500}>Fast Flash</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Fast Flash')
    })

    it('should handle custom long duration', () => {
      const { lastFrame } = render(
        <Flash duration={3000}>Slow Flash</Flash>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Slow Flash')
    })

    it('should handle custom speed multiplier', () => {
      const { lastFrame } = render(
        <Flash speed={2}>Double Speed Flash</Flash>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Double Speed Flash')
    })

    it('should handle slow speed multiplier', () => {
      const { lastFrame } = render(
        <Flash speed={0.5}>Half Speed</Flash>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Half Speed')
    })
  })

  describe('animation behavior', () => {
    it('should continuously cycle flash effect', async () => {
      const { lastFrame, rerender } = render(<Flash duration={100}>Test</Flash>)
      const initialFrame = lastFrame()

      await new Promise(resolve => setTimeout(resolve, 250))
      rerender(<Flash duration={100}>Test</Flash>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })

    it('should animate flash effect over time', async () => {
      const { lastFrame, rerender } = render(<Flash>Test</Flash>)
      const initialFrame = lastFrame()

      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Flash>Test</Flash>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })
  })

  describe('edge cases', () => {
    it('should handle single character', () => {
      const { lastFrame } = render(<Flash>X</Flash>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('X')
    })

    it('should handle very long text', () => {
      const longText = 'Flash'.repeat(100)
      const { lastFrame } = render(<Flash>{longText}</Flash>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.replace(/\n/g, '')).toBe(longText)
    })

    it('should handle text with spaces', () => {
      const { lastFrame } = render(<Flash>Text With Spaces</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Text With Spaces')
    })

    it('should handle text with newlines', () => {
      const { lastFrame } = render(
        <Flash>{`Line 1\nLine 2`}</Flash>,
      )
      const stripped = stripAnsi(lastFrame() ?? '')
      expect(stripped).toContain('Line 1')
      expect(stripped).toContain('Line 2')
    })

    it('should handle zero duration', () => {
      const { lastFrame } = render(<Flash duration={0}>Zero Duration</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Zero Duration')
    })

    it('should handle very small duration', () => {
      const { lastFrame } = render(<Flash duration={1}>Tiny Duration</Flash>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Tiny Duration')
    })
  })
})
