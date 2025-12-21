export function splitChars(text: string): string[] {
  return [...text]
}

export function getTextLength(text: string): number {
  return [...text].length
}

export function mapChars(
  text: string,
  fn: (char: string, index: number) => string,
): string {
  return splitChars(text).map(fn).join('')
}

export function repeat(str: string, times: number): string {
  return str.repeat(Math.max(0, times))
}

export function pad(
  str: string,
  length: number,
  char = ' ',
  direction: 'left' | 'right' | 'center' = 'right',
): string {
  const currentLength = getTextLength(str)
  const padLength = Math.max(0, length - currentLength)

  if (direction === 'left') {
    return repeat(char, padLength) + str
  }
  else if (direction === 'center') {
    const leftPad = Math.floor(padLength / 2)
    const rightPad = padLength - leftPad
    return repeat(char, leftPad) + str + repeat(char, rightPad)
  }
  else {
    return str + repeat(char, padLength)
  }
}
