import { describe, expect, it } from 'bun:test'
import { render } from 'ink-testing-library'
import { Shimmer } from '../src/components/Shimmer.js'

describe('Shimmer', () => {
  it('renders children text', () => {
    const { lastFrame } = render(<Shimmer>Hello World</Shimmer>)
    const frame = lastFrame()
    expect(frame).toContain('Hello')
    expect(frame).toContain('World')
  })

  it('applies shimmer effect with custom colours', () => {
    const { lastFrame } = render(
      <Shimmer colors={['#ff0000', '#00ff00', '#0000ff']}>
        Test
      </Shimmer>,
    )
    expect(lastFrame()).toBeTruthy()
    expect(lastFrame()).toContain('Test')
  })

  it('respects enabled prop', () => {
    const { lastFrame } = render(
      <Shimmer enabled={false}>
        Static Text
      </Shimmer>,
    )
    expect(lastFrame()).toContain('Static')
  })

  it('handles custom width', () => {
    const { lastFrame } = render(
      <Shimmer width={8}>
        Custom Width
      </Shimmer>,
    )
    expect(lastFrame()).toContain('Custom')
  })

  it('handles custom intensity', () => {
    const { lastFrame } = render(
      <Shimmer intensity={0.5}>
        Half Intensity
      </Shimmer>,
    )
    expect(lastFrame()).toContain('Half')
  })

  it('animates in right direction', () => {
    const { lastFrame } = render(
      <Shimmer direction="right">
        Right Direction
      </Shimmer>,
    )
    expect(lastFrame()).toContain('Right')
  })

  it('animates in left direction', () => {
    const { lastFrame } = render(
      <Shimmer direction="left">
        Left Direction
      </Shimmer>,
    )
    expect(lastFrame()).toContain('Left')
  })
})
