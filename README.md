# ink-motion

Beautiful, performant text effects and animations for [Ink](https://github.com/vadimdemedes/ink) CLI applications.

## Features

- 🎨 **Rich text effects**: Shimmer, Typewriter, Fade, Wave
- ⚡ **Performance-focused**: RAF-based rendering with optimized re-renders
- 🔧 **Highly customizable**: Control colors, speed, intensity, and more
- 📦 **Type-safe**: Full TypeScript support with strict types
- 🪶 **Lightweight**: Minimal dependencies

## Installation

```bash
bun add ink-motion
```

## Quick Start

```tsx
import { Shimmer, Typewriter, Fade, Wave } from 'ink-motion'

function App() {
  return (
    <>
      <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']}>
        Loading...
      </Shimmer>

      <Typewriter speed={1.5} cursor="█">
        Hello, world!
      </Typewriter>
    </>
  )
}
```

## Components

- **Shimmer** - Shimmering highlight effect
- **Typewriter** - Character-by-character typing animation
- **Fade** - Smooth fade in/out transitions
- **Wave** - Wave motion through text

## License

MIT
