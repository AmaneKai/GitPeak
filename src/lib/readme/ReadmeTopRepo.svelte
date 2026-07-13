<script lang="ts">
  import type { MostStarredRepo } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { formatNumber } from '$lib/core/formatting/number-formatting'

  let {
    repository,
    nameLines = [repository.name],
    theme,
    x,
    y,
    width,
    height = 100,
    nested = false,
  }: {
    repository: MostStarredRepo
    // Pre-wrapped by the parent (which owns the width math); defaults to a single line.
    nameLines?: string[]
    theme: ThemeTokens
    x: number
    y: number
    width: number
    height?: number
    nested?: boolean
  } = $props()

  const NAME_FIRST_LINE_Y = 60
  const NAME_LINE_HEIGHT = 26
  const starY = $derived(y + NAME_FIRST_LINE_Y + nameLines.length * NAME_LINE_HEIGHT + 2)
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
{/if}
<rect {x} {y} width="5" {height} rx="2.5" fill={theme.gold} />
<text x={x + 24} y={y + 26} class="text-subtle">★ Top Repository</text>
{#each nameLines as line, lineIndex (lineIndex)}
  <text
    x={x + 24}
    y={y + NAME_FIRST_LINE_Y + lineIndex * NAME_LINE_HEIGHT}
    class="text-serif"
    font-size="22"
  >
    {line}
  </text>
{/each}
<!-- Star count sits on its own line: a long repo name can never collide with it. -->
<text x={x + 24} y={starY} class="text-main" fill={theme.gold} font-weight="bold" font-size="15">
  ★ {formatNumber(repository.stars)}
</text>
