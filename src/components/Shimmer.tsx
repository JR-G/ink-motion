import { Text } from 'ink'
import React, { useMemo, useState } from 'react'
import type { BaseEffectProps, Color } from '../types/index.js'
import { useAnimationFrame } from '../hooks/useAnimationFrame.js'
import { colorize, interpolateColor } from '../utils/colors.js'
import { getTextLength, mapChars } from '../utils/text.js'

type ShimmerDirection = 'left' | 'right'

interface ShimmerProps extends BaseEffectProps {
  colors?: [Color, Color, Color]
  width?: number
  intensity?: number
  direction?: ShimmerDirection
}

const DEFAULT_COLORS: [Color, Color, Color] = ['#ffffff40', '#ffffff', '#ffffff40']
const DEFAULT_WIDTH = 4
const DEFAULT_INTENSITY = 1
const DEFAULT_DIRECTION: ShimmerDirection = 'right'
const DEFAULT_SPEED = 1
const ANIMATION_CYCLE_MS = 2000
const COLOUR_TRANSITION_MIDPOINT = 0.5
const COLOUR_PROGRESS_MULTIPLIER = 2
const MIN_INTENSITY = 0
const MAX_INTENSITY = 1

/**
 * Shimmer effect component that creates a moving highlight across text
 *
 * Creates a shimmering animation by interpolating through a gradient of colours
 * that sweeps across the text from left to right or right to left.
 *
 * @example
 * ```tsx
 * <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']} intensity={0.8}>
 *   Loading...
 * </Shimmer>
 * ```
 */
export function Shimmer({
  children,
  colors = DEFAULT_COLORS,
  width = DEFAULT_WIDTH,
  intensity = DEFAULT_INTENSITY,
  direction = DEFAULT_DIRECTION,
  speed = DEFAULT_SPEED,
  enabled = true,
  onComplete,
}: ShimmerProps) {
  const [offset, setOffset] = useState(0)
  const textLength = getTextLength(children)
  const totalWidth = textLength + width

  useAnimationFrame((deltaTime) => {
    setOffset((previousOffset) => {
      const movement = (deltaTime / ANIMATION_CYCLE_MS) * speed
      const newOffset = direction === 'right'
        ? previousOffset + movement
        : previousOffset - movement

      const hasCompletedCycle = Math.abs(newOffset) >= totalWidth
      if (hasCompletedCycle) {
        onComplete?.()
        return 0
      }

      return newOffset
    })
  }, enabled)

  const shimmerText = useMemo(() => {
    return mapChars(children, (char, index) => {
      const normalizedOffset = direction === 'right' ? offset : totalWidth - offset
      const distance = Math.abs(index - normalizedOffset)

      const isWithinShimmerWidth = distance < width
      const colorProgress = isWithinShimmerWidth
        ? distance / width
        : 1

      const [startColor, peakColor, endColor] = colors
      const adjustedIntensity = Math.min(Math.max(intensity, MIN_INTENSITY), MAX_INTENSITY)

      const isFirstHalf = colorProgress < COLOUR_TRANSITION_MIDPOINT
      const currentColor = isFirstHalf
        ? interpolateColor(
          startColor,
          peakColor,
          colorProgress * COLOUR_PROGRESS_MULTIPLIER * adjustedIntensity,
        )
        : interpolateColor(
          peakColor,
          endColor,
          (colorProgress - COLOUR_TRANSITION_MIDPOINT) * COLOUR_PROGRESS_MULTIPLIER * adjustedIntensity,
        )

      return colorize(char, currentColor)
    })
  }, [children, offset, colors, width, intensity, direction, totalWidth])

  return <Text>{shimmerText}</Text>
}
