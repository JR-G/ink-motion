import { Box, render, Text } from 'ink'
import React, { useState } from 'react'
import { Fade, Shimmer, Typewriter, Wave } from '../src/index.js'

function Demo() {
  const [typewriterKey, setTypewriterKey] = useState(0)

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>ink-motion Demo</Text>
      </Box>

      <Box flexDirection="column" gap={1}>
        <Box>
          <Text dimColor>Shimmer: </Text>
          <Shimmer colors={['#60a5fa', '#3b82f6', '#60a5fa']} intensity={0.8} speed={1.5}>
            Loading your data...
          </Shimmer>
        </Box>

        <Box>
          <Text dimColor>Typewriter: </Text>
          <Typewriter
            key={typewriterKey}
            color="green"
            cursor="█"
            variance={0.4}
            speed={2}
            onComplete={() => {
              setTimeout(() => setTypewriterKey(previous => previous + 1), 1000)
            }}
          >
            bun add ink-motion
          </Typewriter>
        </Box>

        <Box>
          <Text dimColor>Fade: </Text>
          <Fade color="#fbbf24" from={0.2} to={1} duration={1500} loop easing="ease-in-out">
            Success!
          </Fade>
        </Box>

        <Box>
          <Text dimColor>Wave: </Text>
          <Wave colors={['#0000ff', '#ffff00']} amplitude={0.8} frequency={1} speed={2}>
            ~~~~~~~~ flowing wave ~~~~~~~~
          </Wave>
        </Box>
      </Box>
    </Box>
  )
}

render(<Demo />)
