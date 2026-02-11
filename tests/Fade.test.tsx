import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Fade } from '../src/components/Fade.js'
import { stripAnsi } from './utils.js'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV }
  process.env.INK_MOTION_BACKGROUND_COLOR = '#000000'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('Fade', () => {
  describe('rendering', () => {
    it('should render children text with fade effect', () => {
      const { lastFrame } = render(<Fade from={0.1}>Fading Text</Fade>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Fading Text')
    })

    it('should render with frozen animation when disabled', () => {
      const { lastFrame } = render(<Fade enabled={false} from={0.1}>Static Fade</Fade>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Static Fade')
    })

    it('should handle empty children', () => {
      const consoleError = console.error
      console.error = () => { }
      const { lastFrame } = render(<Fade from={0.1}>{'' as any}</Fade>)
      console.error = consoleError
      const frame = lastFrame() ?? ''
      expect(frame).toBe('')
    })

    it('should handle Unicode characters', () => {
      const { lastFrame } = render(<Fade from={0.1}>Fade 💫 Effect</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toContain('💫')
    })

    it('should handle special characters', () => {
      const { lastFrame } = render(<Fade from={0.1}>Test @#$% & *</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Test @#$% & *')
    })
  })

  describe('fade with colors', () => {
    it('should apply fade with default color', () => {
      const { lastFrame } = render(<Fade from={0.1}>Default Color</Fade>)
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Default Color')
    })

    it('should apply fade with custom color', () => {
      const { lastFrame } = render(
        <Fade color="#ff0000" from={0.1}>Red Fade</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Red Fade')
    })

    it('should apply fade with named color', () => {
      const { lastFrame } = render(
        <Fade color="yellow" from={0.1}>Yellow Fade</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Yellow Fade')
    })
  })

  describe('opacity parameters', () => {
    it('should handle default opacity range (0 to 1)', () => {
      const { lastFrame } = render(<Fade from={0.1}>Default Range</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Default Range')
    })

    it('should handle custom from opacity', () => {
      const { lastFrame } = render(
        <Fade from={0.2}>Custom From</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Custom From')
    })

    it('should handle custom to opacity', () => {
      const { lastFrame } = render(
        <Fade from={0.1} to={0.8}>Custom To</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Custom To')
    })

    it('should handle custom from and to opacity', () => {
      const { lastFrame } = render(
        <Fade from={0.2} to={0.8}>Partial Fade</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Partial Fade')
    })

    it('should handle reverse fade (from 1 to 0)', () => {
      const { lastFrame } = render(
        <Fade from={1} to={0}>Fade Out</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Fade Out')
    })

    it('should handle same from and to opacity', () => {
      const { lastFrame } = render(
        <Fade from={0.5} to={0.5}>Static Opacity</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Static Opacity')
    })
  })

  describe('duration and timing', () => {
    it('should handle default duration', () => {
      const { lastFrame } = render(<Fade from={0.1}>Default Duration</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Default Duration')
    })

    it('should handle custom short duration', () => {
      const { lastFrame } = render(
        <Fade duration={100} from={0.1}>Fast Fade</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Fast Fade')
    })

    it('should handle custom long duration', () => {
      const { lastFrame } = render(
        <Fade duration={5000} from={0.1}>Slow Fade</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Slow Fade')
    })

    it('should handle custom speed multiplier', () => {
      const { lastFrame } = render(
        <Fade speed={2} from={0.1}>Double Speed</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Double Speed')
    })
  })

  describe('easing functions', () => {
    it('should handle ease-in easing', () => {
      const { lastFrame } = render(
        <Fade easing="ease-in" from={0.1}>Ease In</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Ease In')
    })

    it('should handle ease-out easing', () => {
      const { lastFrame } = render(
        <Fade easing="ease-out" from={0.1}>Ease Out</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Ease Out')
    })

    it('should handle ease-in-out easing', () => {
      const { lastFrame } = render(
        <Fade easing="ease-in-out" from={0.1}>Ease In Out</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Ease In Out')
    })

    it('should handle linear easing', () => {
      const { lastFrame } = render(
        <Fade easing="linear" from={0.1}>Linear</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Linear')
    })
  })

  describe('loop mode', () => {
    it('should handle loop mode enabled', () => {
      const { lastFrame } = render(
        <Fade loop from={0.1}>Looping Fade</Fade>,
      )
      const frame = lastFrame() ?? ''
      expect(stripAnsi(frame)).toBe('Looping Fade')
    })

    it('should handle loop mode disabled', () => {
      const { lastFrame } = render(
        <Fade loop={false} from={0.1}>Single Fade</Fade>,
      )
      expect(stripAnsi(lastFrame() ?? '')).toBe('Single Fade')
    })

    it('should continuously loop when loop is enabled', async () => {
      const { lastFrame, rerender } = render(<Fade loop duration={100} from={0.1}>Test</Fade>)
      const initialFrame = lastFrame()

      // Wait for more than one cycle
      await new Promise(resolve => setTimeout(resolve, 250))
      rerender(<Fade loop duration={100} from={0.1}>Test</Fade>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })
  })

  describe('animation behavior', () => {
    it('should animate fade effect over time', async () => {
      const { lastFrame, rerender } = render(<Fade from={0.1}>Test</Fade>)
      const initialFrame = lastFrame()

      await new Promise(resolve => setTimeout(resolve, 100))
      rerender(<Fade from={0.1}>Test</Fade>)

      const laterFrame = lastFrame()

      expect(stripAnsi(initialFrame ?? '')).toBe('Test')
      expect(stripAnsi(laterFrame ?? '')).toBe('Test')
    })
  })

  describe('edge cases', () => {
    it('should handle single character', () => {
      const { lastFrame } = render(<Fade from={0.1}>X</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('X')
    })

    it('should handle very long text', () => {
      const longText = 'Fade'.repeat(100)
      const { lastFrame } = render(<Fade from={0.1}>{longText}</Fade>)
      const frame = stripAnsi(lastFrame() ?? '')
      expect(frame.replace(/\n/g, '')).toBe(longText)
    })

    it('should handle text with spaces', () => {
      const { lastFrame } = render(<Fade from={0.1}>Text With Spaces</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Text With Spaces')
    })

    it('should handle text with newlines', () => {
      const { lastFrame } = render(
        <Fade from={0.1}>{`Line 1\nLine 2`}</Fade>,
      )
      const stripped = stripAnsi(lastFrame() ?? '')
      expect(stripped).toContain('Line 1')
      expect(stripped).toContain('Line 2')
    })

    it('should handle zero duration', () => {
      const { lastFrame } = render(<Fade duration={0} from={0.1}>Instant</Fade>)
      expect(stripAnsi(lastFrame() ?? '')).toBe('Instant')
    })
  })
})
