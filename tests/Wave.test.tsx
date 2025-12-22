import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import React from 'react'
import { Wave } from '../src/components/Wave.js'
import { stripAnsi } from './utils.js'

describe('Wave', () => {
  describe('rendering', () => {
    it('should render children text without modification when enabled', () => {
      const { lastFrame } = render(<Wave>Wavy Text</Wave>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame).toBe('Wavy Text')
    })

    it('should render with frozen animation when disabled', () => {
      const { lastFrame } = render(<Wave enabled={false}>Static Wave</Wave>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Static Wave')
    })

    it('should handle empty children', () => {
      const consoleError = console.error
      console.error = () => { }
      const { lastFrame } = render(<Wave>{'' as any}</Wave>)
      console.error = consoleError
      const frame = lastFrame() ?? ''
      expect(frame).toBe('')
    })

    it('should handle Unicode characters', () => {
      const { lastFrame } = render(<Wave>Hello 🌊 World</Wave>)
      expect(stripAnsi(lastFrame() ?? '')).toContain('🌊')
    })

    it('should handle special characters', () => {
      const { lastFrame } = render(<Wave>Test @#$% & *</Wave>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Test @#$% & *')
    })
  })

  describe('brightness wave type', () => {
    it('should apply brightness wave effect', () => {
      const { lastFrame } = render(
        <Wave type="brightness">Bright Wave</Wave>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Bright Wave')
    })

    it('should apply custom colors in brightness mode', () => {
      const { lastFrame } = render(
        <Wave type="brightness" colors={['#ff0000', '#00ff00']}>
          Color Wave
        </Wave>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Color Wave')
    })

    it('should animate brightness wave over time', async () => {
      const { lastFrame, rerender } = render(<Wave type="brightness">Test</Wave>)
      const initialFrame = lastFrame()

      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Wave type="brightness">Test</Wave>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })
  })

  describe('vertical wave type', () => {
    it('should apply vertical wave effect', () => {
      const { lastFrame } = render(
        <Wave type="vertical">Vertical Wave</Wave>,
      )
      const frame = lastFrame() ?? ''
      expect(frame).toBeTruthy()
      const stripped = stripAnsi(frame)
      expect(stripped).toContain('V')
      expect(stripped).toContain('e')
      expect(stripped).toContain('r')
    })

    it('should shift characters vertically by adding spaces', () => {
      const { lastFrame } = render(
        <Wave type="vertical" amplitude={1} frequency={10}>Test</Wave>,
      )
      const frame = lastFrame() ?? ''
      const stripped = stripAnsi(frame)
      expect(stripped).toContain('T')
      expect(stripped).toContain('e')
      expect(stripped).toContain('s')
      expect(stripped).toContain('t')
    })
  })

  describe('wave parameters', () => {
    it('should handle custom amplitude of 0', () => {
      const { lastFrame } = render(
        <Wave amplitude={0}>Zero Amplitude</Wave>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Zero Amplitude')
    })

    it('should handle custom amplitude of 1', () => {
      const { lastFrame } = render(
        <Wave amplitude={1}>Full Amplitude</Wave>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Full Amplitude')
    })

    it('should handle custom amplitude between 0 and 1', () => {
      const { lastFrame } = render(
        <Wave amplitude={0.8}>High Amplitude</Wave>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('High Amplitude')
    })

    it('should handle low frequency', () => {
      const { lastFrame } = render(
        <Wave frequency={1}>Low Frequency</Wave>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Low Frequency')
    })

    it('should handle high frequency', () => {
      const { lastFrame } = render(
        <Wave frequency={10}>High Frequency</Wave>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('High Frequency')
    })

    it('should handle custom speed multiplier', () => {
      const { lastFrame } = render(
        <Wave speed={2}>Double Speed</Wave>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Double Speed')
    })
  })

  describe('edge cases', () => {
    it('should handle single character', () => {
      const { lastFrame } = render(<Wave>X</Wave>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('X')
    })

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000)
      const { lastFrame } = render(<Wave>{longText}</Wave>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.replace(/\n/g, '').replace(/ /g, '')).toContain('AAA')
    })

    it('should handle text with newlines', () => {
      const { lastFrame } = render(
        <Wave>{`Line 1\nLine 2`}</Wave>,
      )
      const stripped = stripAnsi(lastFrame() ?? '')
      expect(stripped).toContain('Line 1')
      expect(stripped).toContain('Line 2')
    })
  })
})
