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

## Color Format

All components accept colors in these formats:

- **Hex**: `'#ff0000'`
- **RGB**: `'rgb(255, 0, 0)'`
- **Named**: `'red'`, `'blue'`, `'green'`, etc. (any valid chalk color)

## Component Props

### Shimmer

```tsx
<Shimmer
  colors={['#666666', '#ffffff', '#666666']}
  width={4}
  intensity={1}
  direction="right"
  speed={1}
  enabled
/>
```

- **`colors?: [Color, Color, Color]`** - Gradient colors `[start, peak, end]`
- **`width?: number`** - Shimmer band width (characters)
- **`intensity?: number`** - Brightness multiplier (0-1)
- **`direction?: 'left' | 'right'`** - Movement direction

### Typewriter

```tsx
<Typewriter
  color="green"
  cursor="▋"
  cursorColor="cyan"
  variance={0.3}
  delay={0}
  speed={1}
  enabled
/>
```

- **`color?: Color`** - Text color
- **`cursor?: string | boolean`** - Cursor character or `false` to disable
- **`cursorColor?: Color`** - Cursor color (defaults to `color`)
- **`variance?: number`** - Typing speed randomness (0-1)
- **`delay?: number`** - Initial delay (ms)

### Fade

```tsx
<Fade
  color="#ffffff"
  from={0}
  to={1}
  duration={1000}
  easing="sine-in-out"
  loop={false}
  speed={1}
  enabled
/>
```

- **`color?: Color`** - Base text color
- **`from?: number`** - Starting opacity (0-1)
- **`to?: number`** - Ending opacity (0-1)
- **`duration?: number`** - Duration (ms)
- **`easing?: EasingName`** - Easing name
- **`loop?: boolean`** - Loop animation

### Wave

```tsx
<Wave
  colors={['#888888', '#ffffff']}
  amplitude={0.5}
  frequency={2}
  type="brightness"
  speed={1}
  enabled
/>
```

- **`colors?: [Color, Color]`** - Gradient colors `[dark, bright]`
- **`amplitude?: number`** - Wave height (0-1)
- **`frequency?: number`** - Number of cycles across text
- **`type?: 'brightness' | 'vertical'`** - Wave effect type

### Flash

```tsx
<Flash
  color="#ffffff"
  minIntensity={0.3}
  maxIntensity={1}
  duration={1000}
  speed={1}
  enabled
/>
```

- **`color?: Color`** - Base text color
- **`minIntensity?: number`** - Minimum brightness (0-1)
- **`maxIntensity?: number`** - Maximum brightness (0-1)
- **`duration?: number`** - Flash cycle duration (ms)

## Easing Functions

The Fade component supports these easing functions:

- **`linear`** - Constant speed
- **`ease-in`** - Slow start, fast end
- **`ease-out`** - Fast start, slow end
- **`ease-in-out`** - Slow start and end, fast middle
- **`sine-in-out`** - Smooth sine curve

## Performance Tips

1. **Avoid unnecessary re-renders**: Wrap component props in `useMemo` if they're computed
2. **Use `enabled` prop**: Disable animations when not visible
3. **Optimise colors**: Hex colors (`#rrggbb`) are faster than RGB strings
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

All components are fully typed with strict TypeScript support. Import types as needed:

```tsx
import type { Color, EasingName, BaseEffectProps } from 'ink-motion'
```

See the exported types in `src/types/index.ts` for full type definitions.
