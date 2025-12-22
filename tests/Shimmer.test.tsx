import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'
import { Shimmer } from '../src/components/Shimmer.js'
import { stripAnsi } from './utils.js'

describe('Shimmer', () => {
  describe('rendering', () => {
    it('should render children text with shimmer effect', () => {
      const { lastFrame } = render(<Shimmer>Hello World</Shimmer>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Hello World')
    })

    it('should render with frozen animation when disabled', () => {
      const { lastFrame } = render(
        <Shimmer enabled={false}>Static Text</Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Static Text')
    })

    it('should handle empty children', () => {
      const consoleError = console.error
      console.error = () => { }
      const { lastFrame } = render(<Shimmer>{'' as any}</Shimmer>)
      console.error = consoleError
      const frame = lastFrame() ?? ''
      expect(frame).toBe('')
    })

    it('should handle Unicode characters', () => {
      const { lastFrame } = render(<Shimmer>Shimmer ✨ Effect</Shimmer>)
      expect(stripAnsi(lastFrame() ?? '')).toContain('✨')
    })

    it('should handle special characters', () => {
      const { lastFrame } = render(<Shimmer>Test @#$% & *</Shimmer>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Test @#$% & *')
    })
  })

  describe('shimmer effect with colors', () => {
    it('should apply shimmer effect with default colors', () => {
      const { lastFrame } = render(<Shimmer>Default Colors</Shimmer>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Default Colors')
    })

    it('should apply shimmer effect with custom colors', () => {
      const { lastFrame } = render(
        <Shimmer colors={['#ff0000', '#00ff00', '#0000ff']}>
          Custom Colors
        </Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Custom Colors')
    })

    it('should apply shimmer with three color gradient', () => {
      const { lastFrame } = render(
        <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']}>
          Gradient
        </Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Gradient')
    })
  })

  describe('shimmer parameters', () => {
    it('should handle custom shimmer width', () => {
      const { lastFrame } = render(
        <Shimmer width={8}>Custom Width</Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Custom Width')
    })

    it('should handle minimum width of 1', () => {
      const { lastFrame } = render(
        <Shimmer width={1}>Narrow Shimmer</Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Narrow Shimmer')
    })

    it('should handle large width', () => {
      const { lastFrame } = render(
        <Shimmer width={20}>Wide Shimmer</Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Wide Shimmer')
    })

    it('should handle custom intensity of 0.5', () => {
      const { lastFrame } = render(
        <Shimmer intensity={0.5}>Half Intensity</Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Half Intensity')
    })

    it('should handle minimum intensity of 0', () => {
      const { lastFrame } = render(
        <Shimmer intensity={0}>Zero Intensity</Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Zero Intensity')
    })

    it('should handle maximum intensity of 1', () => {
      const { lastFrame } = render(
        <Shimmer intensity={1}>Full Intensity</Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Full Intensity')
    })

    it('should handle custom speed multiplier', () => {
      const { lastFrame } = render(
        <Shimmer speed={2}>Fast Shimmer</Shimmer>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Fast Shimmer')
    })
  })

  describe('shimmer direction', () => {
    it('should animate in right direction by default', () => {
      const { lastFrame } = render(<Shimmer>Right Direction</Shimmer>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Right Direction')
    })

    it('should animate in right direction when specified', () => {
      const { lastFrame } = render(
        <Shimmer direction="right">Right Direction</Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Right Direction')
    })

    it('should animate in left direction when specified', () => {
      const { lastFrame } = render(
        <Shimmer direction="left">Left Direction</Shimmer>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Left Direction')
    })
  })

  describe('animation behavior', () => {
    it('should animate shimmer effect over time', async () => {
      const { lastFrame, rerender } = render(<Shimmer>Test</Shimmer>)
      const initialFrame = lastFrame()

      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Shimmer>Test</Shimmer>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })
  })

  describe('edge cases', () => {
    it('should handle single character', () => {
      const { lastFrame } = render(<Shimmer>X</Shimmer>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('X')
    })

    it('should handle very long text', () => {
      const longText = 'Shimmer'.repeat(100)
      const { lastFrame } = render(<Shimmer>{longText}</Shimmer>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.replace(/\n/g, '')).toBe(longText)
    })

    it('should handle text with spaces', () => {
      const { lastFrame } = render(<Shimmer>Text With Spaces</Shimmer>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Text With Spaces')
    })

    it('should handle text with newlines', () => {
      const { lastFrame } = render(
        <Shimmer>{`Line 1\nLine 2`}</Shimmer>,
      )
      const stripped = stripAnsi(lastFrame() ?? '')
      expect(stripped).toContain('Line 1')
      expect(stripped).toContain('Line 2')
    })
  })
})
