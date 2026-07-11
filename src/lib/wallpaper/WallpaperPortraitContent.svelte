<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'
  import { buildThemedSlices, groupSlicesForLegend } from './language-colors'
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
    displayName.length > 22 ? `${displayName.slice(0, 21)}…` : displayName,
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

  // Clears the status bar/clock widgets up top and the home-indicator/gesture bar down below.
  const topSafe = $derived(scaleUnit * 9)
  const bottomSafe = $derived(scaleUnit * 6)
  const contentX = $derived(scaleUnit * 6)
  const contentWidth = $derived(width - contentX * 2)
  const contentTop = $derived(topSafe)
  const contentBottom = $derived(height - bottomSafe)
  const contentHeight = $derived(contentBottom - contentTop)
  const baseBlockGap = $derived(scaleUnit * 3.6)
  // Fixed, not flexible — the logo and name read as a tight lockup instead of stretching apart
  // with the rest of the layout's adaptive spacing.
  const brandNameGap = $derived(scaleUnit * 2.2)

  const brandHeight = $derived(scaleUnit * 7.5)
  const nameHeight = $derived(scaleUnit * 5)
  const handleHeight = $derived(scaleUnit * 1.8)
  const outerRadius = $derived(scaleUnit * 22)
  const legendColumnCount = 2
  const legendRowCount = $derived(Math.ceil(legendRows.length / legendColumnCount))
  const legendColumnWidth = $derived(contentWidth / legendColumnCount)
  const legendPaddingX = $derived(scaleUnit * 2)
  const legendMaxHeight = $derived(outerRadius * 1.5)
  const legendRowStep = $derived(
    legendRowCount > 1 ? Math.min(scaleUnit * 4, legendMaxHeight / (legendRowCount - 1)) : 0,
  )
  const legendFontSize = $derived(
    Math.min(scaleUnit * 1.9, Math.max(legendRowStep * 0.55, scaleUnit * 0.9)),
  )
  const legendHeight = $derived(Math.max(0, legendRowCount - 1) * legendRowStep + scaleUnit * 1.5)
  const topRepoHeight = $derived(hasTopRepo ? scaleUnit * 13 : 0)
  const statValueHeight = $derived(scaleUnit * 7.2)
  const statLabelOffset = $derived(scaleUnit * 1.8)
  const statValueOffset = $derived(scaleUnit * 8.2)
  const statRowStep = $derived(scaleUnit * 12)
  const statGridHeight = $derived(statRowStep + statValueOffset)

  // This format ships at more than one height (Phone 9:16, Tall 9:21) sharing one width, so a
  // fixed gap between elements would fill a shrinking share of contentHeight as it gets taller.
  const elementsHeight = $derived(
    brandHeight +
      nameHeight +
      handleHeight +
      outerRadius * 2 +
      legendHeight +
      topRepoHeight +
      statGridHeight +
      brandNameGap,
  )
  const targetStackHeight = $derived(contentHeight * 0.9)
  const blockGap = $derived(Math.max(baseBlockGap, (targetStackHeight - elementsHeight) / 5))
  const stackHeight = $derived(elementsHeight + blockGap * 5)
  const stackY = $derived(contentTop + Math.max(0, (contentHeight - stackHeight) / 2))

  const brandBaselineY = $derived(stackY + brandHeight * 0.7)
  const nameBaselineY = $derived(stackY + brandHeight + brandNameGap + nameHeight * 0.75)
  const handleBaselineY = $derived(nameBaselineY + handleHeight * 1.2 + scaleUnit * 1.2)
  const ruleY = $derived(handleBaselineY + blockGap * 0.55)
  const donutCenterY = $derived(handleBaselineY + blockGap + outerRadius)
  const donutCenterX = $derived(contentX + contentWidth / 2)
  const innerRadius = $derived(outerRadius * 0.63)

  const legendStartY = $derived(donutCenterY + outerRadius + blockGap + scaleUnit * 1.2)
  const legendEndY = $derived(legendStartY + Math.max(0, legendRowCount - 1) * legendRowStep)
  const topRepoRuleY = $derived(legendEndY + scaleUnit * 5.5)
  const topRepoLabelY = $derived(topRepoRuleY + scaleUnit * 2.8)
  const topRepoValueY = $derived(topRepoLabelY + scaleUnit * 3.8)
  const statGridY = $derived(
    (hasTopRepo ? topRepoValueY + scaleUnit * 3.2 : legendEndY + scaleUnit * 1.5) + blockGap,
  )

  const statLabels = $derived([
    { label: 'Contributions', value: statistics.totalContributions, accent: 'foam' },
    { label: 'Commits', value: statistics.totalCommits, accent: 'iris' },
    { label: 'Stars', value: statistics.totalStars, accent: 'gold' },
    { label: 'Repos', value: statistics.totalRepos, accent: 'pine' },
    { label: 'Followers', value: statistics.followers, accent: 'rose' },
    { label: 'Pull Requests', value: statistics.totalPrs, accent: 'love' },
  ])
  const statColumnWidth = $derived(contentWidth / 3)
</script>

<text
  x={contentX + contentWidth / 2}
  y={brandBaselineY}
  class="text-serif"
  font-size={brandHeight}
  text-anchor="middle"
  style="fill:url(#brand-gradient)"
>
  GitPeak
</text>

<text
  x={contentX + contentWidth / 2}
  y={nameBaselineY}
  class="text-serif"
  font-size={nameHeight}
  font-weight="700"
  text-anchor="middle"
  style={nameFontFamily ? `font-family:${nameFontFamily}` : undefined}
>
  {truncatedName}
</text>
<text
  x={contentX + contentWidth / 2}
  y={handleBaselineY}
  class="text-main"
  font-size={handleHeight}
  text-anchor="middle"
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

{#if allSlices.length}
  <WallpaperDonut
    slices={allSlices}
    {theme}
    {avatarDataUri}
    centerX={donutCenterX}
    centerY={donutCenterY}
    {outerRadius}
    {innerRadius}
    filterId="wp-donut-glow-pt"
  />

  {#each legendRows as slice, index (slice.name)}
    {@const column = index % legendColumnCount}
    {@const row = Math.floor(index / legendColumnCount)}
    {@const columnX = contentX + column * legendColumnWidth}
    {@const rowY = legendStartY + row * legendRowStep}
    <circle
      cx={columnX + legendPaddingX}
      cy={rowY - legendFontSize * 0.32}
      r={legendFontSize * 0.4}
      fill={slice.color}
      opacity={slice.muted ? 0.6 : 1}
    />
    <text
      x={columnX + legendPaddingX + scaleUnit * 1.6}
      y={rowY}
      class="text-main"
      font-size={legendFontSize}
      opacity={slice.muted ? 0.6 : 0.9}
    >
      {slice.name}
    </text>
    <text
      x={columnX + legendColumnWidth - legendPaddingX}
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

  {#if hasTopRepo}
    {@const repo = statistics.mostStarredRepo!}
    <line
      x1={contentX + contentWidth * 0.3}
      y1={topRepoRuleY}
      x2={contentX + contentWidth * 0.7}
      y2={topRepoRuleY}
      stroke={theme.muted}
      stroke-opacity="0.25"
      stroke-width={scaleUnit * 0.06}
    />
    <text
      x={contentX + contentWidth / 2}
      y={topRepoLabelY}
      class="text-main"
      font-size={scaleUnit * 1.7}
      letter-spacing="0.14em"
      font-weight="600"
      text-anchor="middle"
      style="fill:{theme.subtle}"
    >
      TOP REPOSITORY
    </text>
    <!-- ★ isn't in Gelasio or JetBrains Mono — same per-chunk font defect as containsCjk, just
         triggered by a symbol. Noto Serif JP covers both, so pin the whole line to it. -->
    <text
      x={contentX + contentWidth / 2}
      y={topRepoValueY}
      class="text-serif"
      font-size={scaleUnit * 3.6}
      font-weight="700"
      text-anchor="middle"
      style="font-family:'Noto Serif JP'"
    >
      {repo.name}
      <tspan fill={theme.gold} dx={scaleUnit * 1} font-size={scaleUnit * 2.8}
        >★ {formatNumber(repo.stars)}</tspan
      >
    </text>
  {/if}
{/if}

{#each statLabels as item, index (item.label)}
  {@const column = index % 3}
  {@const row = Math.floor(index / 3)}
  {@const columnX = contentX + column * statColumnWidth + statColumnWidth / 2}
  {@const rowY = statGridY + row * statRowStep}
  {@const accent = theme[item.accent]}

  <text
    x={columnX}
    y={rowY + statLabelOffset}
    class="text-main"
    font-size={scaleUnit * 2}
    letter-spacing="0.08em"
    font-weight="600"
    text-anchor="middle"
    style="fill:{theme.subtle}"
  >
    {item.label.toUpperCase()}
  </text>
  <text
    x={columnX}
    y={rowY + statValueOffset}
    class="text-serif"
    font-size={statValueHeight}
    font-weight="700"
    text-anchor="middle"
    style="fill:{accent}"
  >
    {formatNumber(item.value)}
  </text>
{/each}
