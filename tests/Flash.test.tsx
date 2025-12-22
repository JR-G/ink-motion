import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Flash } from '../src/components/Flash.js'

describe('Flash', () => {
  it('renders children text', () => {
    const { lastFrame } = render(<Flash>Flashing Text</Flash>)
    const frame = lastFrame()
    expect(frame).toContain('Flashing')
  })

  it('applies flash with custom colour', () => {
    const { lastFrame } = render(
      <Flash color="#00ffff">
        Cyan Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Cyan')
  })

  it('handles custom intensity range', () => {
    const { lastFrame } = render(
      <Flash minIntensity={0.5} maxIntensity={1}>
        Bright Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Bright')
  })

  it('handles custom duration', () => {
    const { lastFrame } = render(
      <Flash duration={500}>
        Fast Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Fast')
  })

  it('handles custom speed multiplier', () => {
    const { lastFrame } = render(
      <Flash speed={2}>
        Double Speed Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Double')
  })

  it('respects enabled prop', () => {
    const { lastFrame } = render(
      <Flash enabled={false}>
        Static Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Static')
  })

  it('handles low intensity range', () => {
    const { lastFrame } = render(
      <Flash minIntensity={0.1} maxIntensity={0.3}>
        Dim Flash
      </Flash>,
    )
    expect(lastFrame()).toContain('Dim')
  })
})
