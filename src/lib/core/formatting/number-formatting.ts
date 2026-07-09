export function formatNumber(value: number): string {
  if (value < 1000) return value.toString()

  if (value < 1000000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`

  return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}m`
}
