# ink-motion

Beautiful, performant text effects and animations for [Ink](https://github.com/vadimdemedes/ink) CLI applications.

## Features

- 🎨 **Rich text effects**: Shimmer, Typewriter, Fade, Wave, Flash
- ⚡ **Performant**: Optimised animations with minimal re-renders
- 🔧 **Highly customisable**: Control colours, speed, intensity, and more
- 📦 **Type-safe**: Full TypeScript support with strict types
- 🪶 **Lightweight**: Minimal dependencies

## Installation

```bash
bun add ink-motion
npm install ink-motion
pnpm add ink-motion
```

## Quick Start

```tsx
import { render } from 'ink'
import { Shimmer, Typewriter } from 'ink-motion'

function App() {
  return (
    <>
      <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']}>
        Loading...
      </Shimmer>

      <Typewriter speed={2} cursor="█">
        bun add ink-motion
      </Typewriter>
    </>
  )
}

render(<App />)
```

## Components

- **Shimmer** - Shimmering highlight effect
- **Typewriter** - Character-by-character typing animation
- **Fade** - Smooth fade in/out transitions
- **Wave** - Wave motion through text
- **Flash** - Pulsing neon-like glow effect

## Demo

See all effects in action:

```bash
git clone https://github.com/JR-G/ink-motion
cd ink-motion
bun install
bun run demo
```

## Documentation

See [Guide](./docs/guide.md) for advanced usage patterns and TypeScript types.

## License

MIT
