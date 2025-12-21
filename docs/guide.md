# Guide

## Shared Props

All components share these common props:

### BaseEffectProps

- **`children: string`** (required) - The text to animate
- **`speed?: number`** - Animation speed multiplier (default: `1`)
  - `0.5` = half speed
  - `2` = double speed
- **`enabled?: boolean`** - Enable/disable animation (default: `true`)
- **`onComplete?: () => void`** - Callback when animation completes (if applicable)

## Colour Format

All components accept colours in these formats:

- **Hex**: `'#ff0000'`
- **RGB**: `'rgb(255, 0, 0)'`
- **Named**: `'red'`, `'blue'`, `'green'`, etc. (any valid chalk colour)

## Easing Functions

The Fade component supports these easing functions:

- **`linear`** - Constant speed
- **`ease-in`** - Slow start, fast end
- **`ease-out`** - Fast start, slow end (default)
- **`ease-in-out`** - Slow start and end, fast middle

## Performance Tips

1. **Avoid unnecessary re-renders**: Wrap component props in `useMemo` if they're computed
2. **Use `enabled` prop**: Disable animations when not visible
3. **Optimise colours**: Hex colours (`#rrggbb`) are faster than RGB strings
4. **Adjust speed**: Lower speeds (< 1) reduce CPU usage

## Advanced Patterns

### Looping Animations

Use the `key` prop to restart an animation:

```tsx
const [key, setKey] = useState(0)

<Typewriter
  key={key}
  onComplete={() => {
    setTimeout(() => setKey(prev => prev + 1), 1000)
  }}
>
  This repeats
</Typewriter>
```

### Conditional Animations

Control animations based on state:

```tsx
const [loading, setLoading] = useState(true)

<Shimmer enabled={loading}>
  {loading ? 'Loading...' : 'Ready'}
</Shimmer>
```

### Composing Effects

Combine multiple effects for richer animations:

```tsx
<Box flexDirection="column">
  <Fade from={0} to={1} duration={500}>
    <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']}>
      Fading shimmer
    </Shimmer>
  </Fade>
</Box>
```

## TypeScript

All components are fully typed. Import types from the package:

```tsx
import type { Color, EasingName } from 'ink-motion'
```

### Available Types

- `Color` - String type for colour values
- `Opacity` - Branded number type (0-1) for opacity values
- `Speed` - Branded number type (>0) for speed values
- `Intensity` - Branded number type (0-1) for intensity values
- `EasingName` - Union type of easing function names
- `EasingFunction` - Function type for easing functions
- `BaseEffectProps` - Shared props interface

### Type Validators

Use these functions to create branded types with runtime validation:

```tsx
import { createOpacity, createSpeed, createIntensity } from 'ink-motion'

const opacity = createOpacity(0.5)
const speed = createSpeed(2)
const intensity = createIntensity(0.8)
```
