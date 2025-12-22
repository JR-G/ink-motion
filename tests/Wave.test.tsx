import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Wave } from '../src/components/Wave.js'

describe('Wave', () => {
  it('renders children text', () => {
    const { lastFrame } = render(<Wave>Wavy Text</Wave>)
    const frame = lastFrame()
    expect(frame).toContain('Wavy')
    expect(frame).toContain('Text')
  })

  it('applies brightness wave with custom colours', () => {
    const { lastFrame } = render(
      <Wave type="brightness" colors={['#ff0000', '#00ff00']}>
        Bright Wave
      </Wave>,
    )
    expect(lastFrame()).toContain('Bright')
  })

  it('applies vertical wave', () => {
    const { lastFrame } = render(
      <Wave type="vertical">
        Vertical Wave
      </Wave>,
    )
    expect(lastFrame()).toBeTruthy()
  })

  it('handles custom amplitude', () => {
    const { lastFrame } = render(
      <Wave amplitude={0.8}>
        High Amplitude
      </Wave>,
    )
    expect(lastFrame()).toContain('High')
  })

  it('handles custom frequency', () => {
    const { lastFrame } = render(
      <Wave frequency={5}>
        High Frequency
      </Wave>,
    )
    expect(lastFrame()).toContain('Frequency')
  })

  it('respects enabled prop', () => {
    const { lastFrame } = render(
      <Wave enabled={false}>
        Static Wave
      </Wave>,
    )
    expect(lastFrame()).toContain('Static')
  })
})
