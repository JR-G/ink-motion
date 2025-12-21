import { Text } from 'ink'
import React, { useMemo } from 'react'
import type { BaseEffectProps, Color } from '../types/index.js'
import { useElapsedTime } from '../hooks/useElapsedTime.js'
import { colorize, interpolateColor } from '../utils/colors.js'
import { mapChars } from '../utils/text.js'

type WaveType = 'brightness' | 'vertical'

interface WaveProps extends BaseEffectProps {
  /**
   * Gradient colours for the wave [dark, bright]
   * @default ['#888888', '#ffffff']
   * @example ['#ec4899', '#8b5cf6']
   */
  colors?: [Color, Color]

  /**
   * Wave height (0-1)
   * @default 0.5
   */
  amplitude?: number

  /**
   * Number of wave cycles across text
   * @default 2
   */
  frequency?: number

  /**
   * Wave effect type
   * @default 'brightness'
   */
  type?: WaveType
}

const DEFAULT_COLORS: [Color, Color] = ['#888888', '#ffffff']
const DEFAULT_AMPLITUDE = 0.5
const DEFAULT_FREQUENCY = 2
const DEFAULT_TYPE: WaveType = 'brightness'
const DEFAULT_SPEED = 1
const FULL_CIRCLE_RADIANS = Math.PI * 2
const WAVE_PERIOD_MS = 2000
const MIN_AMPLITUDE = 0
const MAX_AMPLITUDE = 1
const SINE_WAVE_OFFSET = 1
const SINE_WAVE_NORMALIZE = 0.5
const VERTICAL_SHIFT_THRESHOLD = 0.5

function calculateWaveValue(
  characterIndex: number,
  time: number,
  frequency: number,
  amplitude: number,
): number {
  const clampedAmplitude = Math.min(Math.max(amplitude, MIN_AMPLITUDE), MAX_AMPLITUDE)
  const waveLength = FULL_CIRCLE_RADIANS / frequency
  const spatialComponent = (characterIndex / waveLength) * FULL_CIRCLE_RADIANS
  const temporalComponent = time * FULL_CIRCLE_RADIANS
  const phase = spatialComponent - temporalComponent
  const sineWave = Math.sin(phase)
  const normalizedSine = (sineWave + SINE_WAVE_OFFSET) * SINE_WAVE_NORMALIZE
  const amplitudeComplement = MAX_AMPLITUDE - clampedAmplitude
  return normalizedSine * clampedAmplitude + amplitudeComplement
}

/**
 * Wave effect component that creates a wave motion through text
 *
 * Animates text with a sine wave pattern that can affect brightness or vertical position.
 * The wave continuously flows through the text.
 *
 * @example
 * ```tsx
 * <Wave colors={['#ec4899', '#8b5cf6']} amplitude={0.7} frequency={3}>
 *   ~~ wavy text ~~
 * </Wave>
 * ```
 */
export function Wave({
  children,
  colors = DEFAULT_COLORS,
  amplitude = DEFAULT_AMPLITUDE,
  frequency = DEFAULT_FREQUENCY,
  type = DEFAULT_TYPE,
  speed = DEFAULT_SPEED,
  enabled = true,
}: WaveProps) {
  const elapsedTime = useElapsedTime(enabled, speed)
  const normalizedTime = elapsedTime / WAVE_PERIOD_MS

  const waveText = useMemo(() => {
    if (type === 'brightness') {
      return mapChars(children, (character, index) => {
        const waveValue = calculateWaveValue(index, normalizedTime, frequency, amplitude)
        const [darkColor, brightColor] = colors
        const characterColor = interpolateColor(darkColor, brightColor, waveValue)
        return colorize(character, characterColor)
      })
    }

    return mapChars(children, (character, index) => {
      const waveValue = calculateWaveValue(index, normalizedTime, frequency, amplitude)
      const shouldShift = waveValue > VERTICAL_SHIFT_THRESHOLD
      return shouldShift ? ` ${character}` : character
    })
  }, [children, normalizedTime, colors, amplitude, frequency, type])

  return <Text>{waveText}</Text>
}
