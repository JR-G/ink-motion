// eslint-disable-next-line no-control-regex
export const ansiRegex = /[\u001B\u009B][[()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[\dA-ORZcf-nqry=><]/g

export function stripAnsi(text: string): string {
  return text.replace(ansiRegex, '')
}

export function hasAnsiCodes(text: string): boolean {
  return ansiRegex.test(text)
}

export function waitForFrames(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
