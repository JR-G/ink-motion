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
