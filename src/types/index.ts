export type Color = string

export type Opacity = number & { readonly __brand: 'Opacity' }
export type Speed = number & { readonly __brand: 'Speed' }
export type Intensity = number & { readonly __brand: 'Intensity' }

export type EasingFunction = (time: number) => number

export type EasingName = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

export interface BaseEffectProps {
  children: string
  speed?: number
  enabled?: boolean
  onComplete?: () => void
}

export function createOpacity(value: number): Opacity {
  if (value < 0 || value > 1)
    throw new Error(`Opacity must be between 0 and 1, got ${value}`)
  return value as Opacity
}

export function createSpeed(value: number): Speed {
  if (value <= 0)
    throw new Error(`Speed must be greater than 0, got ${value}`)
  return value as Speed
}

export function createIntensity(value: number): Intensity {
  if (value < 0 || value > 1)
    throw new Error(`Intensity must be between 0 and 1, got ${value}`)
  return value as Intensity
}
