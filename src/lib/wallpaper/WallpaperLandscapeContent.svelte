<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'
  import { buildThemedSlices, groupSlicesForLegend } from './language-colors'
  import { monoNameBudget, wrapName } from '$lib/core/text/legend-fit'
  import { containsCjk } from '$lib/core/text/script-segments'
  import WallpaperDonut from './WallpaperDonut.svelte'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
    width,
    height,
    scaleUnit,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
    width: number
    height: number
    scaleUnit: number
  } = $props()

  const displayName = $derived(statistics.displayName || username)
  const truncatedName = $derived(
    displayName.length > 24 ? `${displayName.slice(0, 23)}…` : displayName,
  )
  const nameFontFamily = $derived(containsCjk(truncatedName) ? "'Noto Serif JP'" : undefined)
  const allSlices = $derived(buildThemedSlices(statistics.languages ?? [], theme))
  const legendGrouping = $derived(groupSlicesForLegend(allSlices))
  const legendRows: {
    name: string
    percentage: number
    color: string
    muted: boolean
  }[] = $derived([
    ...legendGrouping.displayed.map((slice) => ({
      name: slice.name,
      percentage: slice.percentage,
      color: slice.color,
      muted: false,
    })),
    ...(legendGrouping.otherCount > 0
      ? [
          {
            name: `+${legendGrouping.otherCount} more`,
            percentage: legendGrouping.otherPercent,
            color: theme.muted,
            muted: true,
          },
        ]
      : []),
  ])
  const hasTopRepo = $derived(!!statistics.mostStarredRepo)

  const PADDING = $derived(scaleUnit * 6)
  const contentX = $derived(PADDING)
  const contentY = $derived(PADDING)
  const contentWidth = $derived(width - PADDING * 2)
  const contentHeight = $derived(height - PADDING * 2)

  // Name spans the full width above the two-column body — keeps it clear of the donut's
  // vertical range so a long display name can never overlap the ring.
  const columnGap = $derived(scaleUnit * 6)
  const leftColumnWidth = $derived(contentWidth * 0.38)
  const rightColumnX = $derived(contentX + leftColumnWidth + columnGap)
  const rightColumnWidth = $derived(contentWidth - leftColumnWidth - columnGap)

  const nameBaselineY = $derived(contentY + scaleUnit * 4.4)
  const handleBaselineY = $derived(nameBaselineY + scaleUnit * 2.1)
  const brandBaselineY = $derived(contentY + scaleUnit * 1.6)

  const ruleY = $derived(handleBaselineY + scaleUnit * 2.6)
  const bodyTop = $derived(ruleY + scaleUnit * 3)
  const bodyBottom = $derived(contentY + contentHeight - scaleUnit * 2)
  const dividerX = $derived(contentX + leftColumnWidth + columnGap / 2)

  const statLabels = $derived([
    { label: 'Contributions', value: statistics.totalContributions, accent: 'foam' },
    { label: 'Commits', value: statistics.totalCommits, accent: 'iris' },
    { label: 'Stars', value: statistics.totalStars, accent: 'gold' },
    { label: 'Repos', value: statistics.totalRepos, accent: 'pine' },
    { label: 'Followers', value: statistics.followers, accent: 'rose' },
    { label: 'Pull Requests', value: statistics.totalPrs, accent: 'love' },
  ])

  const statRowStep = $derived(scaleUnit * 8.6)
  const labelValueGap = $derived(scaleUnit * 3)
  const statsTop = $derived(bodyTop + scaleUnit * 2)
  const statColumnWidth = $derived(leftColumnWidth / 2)

  const topRepoValueY = $derived(bodyBottom - scaleUnit * 0.4)
  const topRepoLabelY = $derived(topRepoValueY - scaleUnit * 3.4)

  const outerRadius = $derived(scaleUnit * 16.5)
  const innerRadius = $derived(outerRadius * 0.63)
  const legendGap = $derived(scaleUnit * 4)
  const legendWidth = $derived(scaleUnit * 11)
  const heroGroupWidth = $derived(outerRadius * 2 + legendGap + legendWidth)
  const heroLeftX = $derived(rightColumnX + Math.max(0, (rightColumnWidth - heroGroupWidth) / 2))
  const donutCenterX = $derived(heroLeftX + outerRadius)
  const donutCenterY = $derived((bodyTop + bodyBottom) / 2)

  const legendX = $derived(donutCenterX + outerRadius + legendGap)
  const legendMaxHeight = $derived(outerRadius * 1.9)
  const legendRowStep = $derived(
    legendRows.length > 1
      ? Math.min(scaleUnit * 2.3, legendMaxHeight / (legendRows.length - 1))
      : 0,
  )
  const legendFontSize = $derived(
    Math.min(scaleUnit * 1.1, Math.max(legendRowStep * 0.7, scaleUnit * 0.55)),
  )
  // Long names ("Jupyter Notebook") wrap onto a second, tighter line instead of running into
  // their percent label, so each row carries its own vertical offset.
  const legendLineHeight = $derived(legendFontSize * 1.35)
  const legendEntries = $derived.by(() => {
    let offsetY = 0
    return legendRows.map((row) => {
      const lines = wrapName(
        row.name,
        monoNameBudget(legendWidth - scaleUnit, legendFontSize, row.percentage),
      )
      const entry = { ...row, lines, offsetY }
      offsetY += legendRowStep + (lines.length - 1) * legendLineHeight
      return entry
    })
  })
  // Baseline-to-baseline height of the whole legend, wrapped lines included.
  const legendSpan = $derived.by(() => {
    const lastEntry = legendEntries.at(-1)
    return lastEntry ? lastEntry.offsetY + (lastEntry.lines.length - 1) * legendLineHeight : 0
  })
  const legendStartY = $derived(donutCenterY - legendSpan / 2)
</script>

<text
  x={contentX}
  y={nameBaselineY}
  class="text-serif"
  font-size={scaleUnit * 4.2}
  font-weight="700"
  style={nameFontFamily ? `font-family:${nameFontFamily}` : undefined}
>
  {truncatedName}
</text>
<text
  x={contentX}
  y={handleBaselineY}
  class="text-main"
  font-size={scaleUnit * 1.15}
  opacity="0.85"
  style="fill:{theme.subtle}"
>
  @{username} · {accountAge(statistics.accountCreatedAt)} on GitHub
</text>

<line
  x1={contentX}
  y1={ruleY}
  x2={contentX + contentWidth}
  y2={ruleY}
  stroke={theme.muted}
  stroke-opacity="0.25"
  stroke-width={scaleUnit * 0.06}
/>
<line
  x1={dividerX}
  y1={bodyTop}
  x2={dividerX}
  y2={bodyBottom}
  stroke={theme.muted}
  stroke-opacity="0.18"
  stroke-width={scaleUnit * 0.06}
/>

<text
  x={contentX + contentWidth}
  y={brandBaselineY}
  class="text-serif"
  font-size={scaleUnit * 1.4}
  text-anchor="end"
  style="fill:url(#brand-gradient)"
>
  GitPeak
</text>

{#if allSlices.length}
  <WallpaperDonut
    slices={allSlices}
    {theme}
    {avatarDataUri}
    centerX={donutCenterX}
    centerY={donutCenterY}
    {outerRadius}
    {innerRadius}
    filterId="wp-donut-glow-ls"
  />

  {#each legendEntries as slice (slice.name)}
    {@const rowY = legendStartY + slice.offsetY}
    <circle
      cx={legendX}
      cy={rowY - legendFontSize * 0.32}
      r={legendFontSize * 0.36}
      fill={slice.color}
      opacity={slice.muted ? 0.6 : 1}
    />
    {#each slice.lines as line, lineIndex (lineIndex)}
      <text
        x={legendX + scaleUnit}
        y={rowY + lineIndex * legendLineHeight}
        class="text-main"
        font-size={legendFontSize}
        opacity={slice.muted ? 0.6 : 0.9}
      >
        {line}
      </text>
    {/each}
    <text
      x={legendX + legendWidth}
      y={rowY}
      class="text-main"
      font-size={legendFontSize}
      font-weight="600"
      text-anchor="end"
      opacity={slice.muted ? 0.6 : 1}
      style="fill:{slice.color}"
    >
      {slice.percentage}%
    </text>
  {/each}
{/if}

{#each statLabels as item, index (item.label)}
  {@const column = index % 2}
  {@const row = Math.floor(index / 2)}
  {@const columnX = contentX + column * statColumnWidth}
  {@const labelY = statsTop + row * statRowStep}
  {@const valueY = labelY + labelValueGap}
  {@const accent = theme[item.accent]}

  <text
    x={columnX}
    y={labelY}
    class="text-main"
    font-size={scaleUnit * 0.95}
    letter-spacing="0.14em"
    font-weight="600"
    opacity="0.8"
  >
    {item.label.toUpperCase()}
  </text>
  <text
    x={columnX}
    y={valueY}
    class="text-serif"
    font-size={scaleUnit * 2.9}
    font-weight="700"
    style="fill:{accent}"
  >
    {formatNumber(item.value)}
  </text>
{/each}

{#if hasTopRepo}
  {@const repo = statistics.mostStarredRepo!}
  <text
    x={contentX}
    y={topRepoLabelY}
    class="text-main"
    font-size={scaleUnit * 0.95}
    letter-spacing="0.14em"
    font-weight="600"
    opacity="0.8"
  >
    TOP REPOSITORY
  </text>
  <!-- ★ isn't in Gelasio or JetBrains Mono — same per-chunk font defect as containsCjk, just
       triggered by a symbol. Noto Serif JP covers both, so pin the whole line to it. -->
  <text
    x={contentX}
    y={topRepoValueY}
    class="text-serif"
    font-size={scaleUnit * 1.9}
    font-weight="700"
    style="font-family:'Noto Serif JP'"
  >
    {repo.name}
    <tspan fill={theme.gold} dx={scaleUnit * 0.8} font-size={scaleUnit * 1.5}
      >★ {formatNumber(repo.stars)}</tspan
    >
  </text>
{/if}
