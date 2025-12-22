import type { EasingFunction, EasingName } from '../types/index.js'

export const linear: EasingFunction = time => time

export const easeIn: EasingFunction = time => time * time

export const easeOut: EasingFunction = time => time * (2 - time)

export const easeInOut: EasingFunction = (time) => {
  return time < 0.5
    ? 2 * time * time
    : -1 + (4 - 2 * time) * time
}

export const sineIn: EasingFunction = time => 1 - Math.cos((time * Math.PI) / 2)

export const sineOut: EasingFunction = time => Math.sin((time * Math.PI) / 2)

export const sineInOut: EasingFunction = time => -(Math.cos(Math.PI * time) - 1) / 2

export const easingFunctions: Record<EasingName, EasingFunction> = {
  'linear': linear,
  'ease-in': easeIn,
  'ease-out': easeOut,
  'ease-in-out': easeInOut,
  'sine-in': sineIn,
  'sine-out': sineOut,
  'sine-in-out': sineInOut,
}

export function getEasingFunction(name: EasingName = 'linear'): EasingFunction {
  return easingFunctions[name]
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1)
}

export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}
