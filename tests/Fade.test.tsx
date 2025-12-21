import { render } from 'ink-testing-library'
import React from 'react'
import { describe, expect, it } from 'bun:test'
import { Fade } from '../src/components/Fade.js'

describe('Fade', () => {
  it('renders children text', () => {
    const { lastFrame } = render(<Fade>Fading Text</Fade>)
    const frame = lastFrame()
    expect(frame).toContain('Fading')
  })

  it('applies fade with custom colour', () => {
    const { lastFrame } = render(
      <Fade color="#ff0000">
        Red Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Red')
  })

  it('handles custom from and to opacity', () => {
    const { lastFrame } = render(
      <Fade from={0.2} to={0.8}>
        Partial Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Partial')
  })

  it('handles custom duration', () => {
    const { lastFrame } = render(
      <Fade duration={500}>
        Fast Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Fast')
  })

  it('handles different easing functions', () => {
    const { lastFrame } = render(
      <Fade easing="ease-in-out">
        Eased Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Eased')
  })

  it('handles loop mode', () => {
    const { lastFrame } = render(
      <Fade loop>
        Looping Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Looping')
  })

  it('respects enabled prop', () => {
    const { lastFrame } = render(
      <Fade enabled={false}>
        Static Fade
      </Fade>,
    )
    expect(lastFrame()).toContain('Static')
  })
})
