import type { GitHubLanguage } from '$lib/github/models/github-stats'
import { ACCENT_COLORS, type ThemeTokens } from '$lib/theme/theme-manager'
import {
  buildPieSlices,
  type PieSlice,
} from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'

const ACCENT_TOKENS = ACCENT_COLORS.map((cssVariable) => cssVariable.slice('var(--'.length, -1))

// buildPieSlices() colors each slice via a CSS var() string, which only resolves inside a live
// DOM — resvg needs real hex colors resolved from the theme up front instead.
export function buildThemedSlices(languages: GitHubLanguage[], theme: ThemeTokens): PieSlice[] {
  return buildPieSlices(languages).map((slice, index) => ({
    ...slice,
    color: theme[ACCENT_TOKENS[index % ACCENT_TOKENS.length]],
  }))
}

export interface LegendGrouping {
  displayed: PieSlice[]
  otherPercent: number
  otherCount: number
}

export function groupSlicesForLegend(
  slices: PieSlice[],
  minPercent = 3,
  maxDisplayed = 7,
): LegendGrouping {
  const aboveThreshold = slices.filter((slice) => slice.percentage >= minPercent)
  const displayed = aboveThreshold.slice(0, maxDisplayed)
  const rest = slices.filter((slice) => !displayed.includes(slice))
  const otherPercent = rest.reduce((sum, slice) => sum + slice.percentage, 0)

  return { displayed, otherPercent, otherCount: rest.length }
}
