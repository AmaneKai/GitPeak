<script lang="ts">
  import type { MostStarredRepo } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { formatNumber } from '$lib/core/formatting/number-formatting'

  let {
    repository,
    theme,
    x,
    y,
    width,
    height = 68,
    nested = false,
  }: {
    repository: MostStarredRepo
    theme: ThemeTokens
    x: number
    y: number
    width: number
    height?: number
    nested?: boolean
  } = $props()
</script>

{#if !nested}
  <rect
    {x}
    {y}
    {width}
    {height}
    rx="14"
    fill={theme.surface}
    fill-opacity="0.6"
    stroke={theme.subtle}
    stroke-opacity="0.15"
    filter="url(#glass-shadow)"
  />
  <rect
    x={x + 1}
    y={y + 1}
    width={width - 2}
    height="1"
    rx="13"
    fill={theme.text}
    fill-opacity="0.06"
  />
{/if}
<rect x={x} y={y} width="5" height={height} rx="2.5" fill={theme.gold} />
<text x={x + 24} y={y + 26} class="text-subtle">★ Top Repository</text>
<text x={x + 24} y={y + 52} class="text-serif" font-size="22">{repository.name}</text>
<text
  x={x + width - 24}
  y={y + 44}
  class="text-main"
  fill={theme.gold}
  font-weight="bold"
  font-size="18"
  text-anchor="end"
>
  ★ {formatNumber(repository.stars)}
</text>
