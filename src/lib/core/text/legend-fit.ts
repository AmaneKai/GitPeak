// Legend rows render in JetBrains Mono, whose every glyph advances exactly 0.6em — so a
// character budget is an exact pixel budget, no text measurement needed.
const MONO_ADVANCE_EM = 0.6

// How many characters of a language name fit between the name's left edge and its
// right-anchored percent label, keeping one character of breathing room between the two.
// rowWidth spans from the name's left edge to the percent label's right anchor.
export function monoNameBudget(rowWidth: number, fontSize: number, percentage: number): number {
  return Math.floor(rowWidth / (fontSize * MONO_ADVANCE_EM)) - `${percentage}%`.length - 1
}

// Truncates a language name so it can never run into its right-anchored percent label
// ("Jupyter Notebook" vs "11%").
export function fitLegendName(
  name: string,
  percentage: number,
  rowWidth: number,
  fontSize: number,
): string {
  const maxNameChars = monoNameBudget(rowWidth, fontSize, percentage)
  if (name.length <= maxNameChars) return name
  return `${name.slice(0, Math.max(1, maxNameChars - 1))}…`
}

// Wraps a name onto up to maxLines lines of maxChars each, breaking at a space or hyphen
// when one is in reach; the final line is ellipsized if the remainder still overflows.
export function wrapName(name: string, maxChars: number, maxLines = 2): string[] {
  const budget = Math.max(1, maxChars)
  const lines: string[] = []
  let rest = name.trim()

  while (rest.length > budget && lines.length < maxLines - 1) {
    const window = rest.slice(0, budget + 1)
    const breakAt = Math.max(window.lastIndexOf(' '), window.lastIndexOf('-'))
    if (breakAt <= 0) {
      lines.push(rest.slice(0, budget))
      rest = rest.slice(budget)
    } else {
      // A hyphen stays on the line it ends; a space is dropped.
      lines.push(rest.slice(0, rest[breakAt] === '-' ? breakAt + 1 : breakAt))
      rest = rest.slice(breakAt + 1)
    }
  }

  lines.push(rest.length > budget ? `${rest.slice(0, Math.max(1, budget - 1))}…` : rest)
  return lines
}
