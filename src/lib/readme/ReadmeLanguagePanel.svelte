<script lang="ts">
  import type { GitHubLanguage, MostStarredRepo } from '$lib/github/models/github-stats'
  import { ACCENT_COLORS, type ThemeTokens } from '$lib/theme/theme-manager'
  import {
    buildPieSlices,
    getDimensions,
    generateArcPath,
  } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'
  import { buildSweepRevealMask } from './sweep-reveal-mask'
  import ReadmeTopRepo from './ReadmeTopRepo.svelte'

  let {
    languages,
    mostStarredRepo,
    theme,
    avatarDataUri,
    x,
    y,
    width,
    height,
  }: {
    languages: GitHubLanguage[]
    mostStarredRepo: MostStarredRepo | null
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    y: number
    width: number
    height: number
  } = $props()

  const TOP_REPO_HEIGHT = 72
  const BOTTOM_MARGIN = 20
  const DIVIDER_GAP = 24

  const NAME_MAX_CHARACTERS = 13
  const LEGEND_ROW_HEIGHT = 28
  const MAX_LEGEND_ROWS = 8
  const ACCENT_TOKENS = ACCENT_COLORS.map((cssVariable) => cssVariable.slice('var(--'.length, -1))

  const dimensions = getDimensions(true)
  const donutX = $derived(x + 24)
  const donutY = $derived(y + 64)
  const centerX = $derived(donutX + dimensions.sizePixels / 2)
  const centerY = $derived(donutY + dimensions.sizePixels / 2)
  const avatarRadius = dimensions.innerRadiusPixels - 4

  const slices = $derived(
    buildPieSlices(languages)
      .filter((slice) => slice.percentage > 0)
      .map((slice, index) => ({
        ...slice,
        color: theme[ACCENT_TOKENS[index % ACCENT_TOKENS.length]],
      })),
  )
  const legendSlices = $derived(slices.slice(0, MAX_LEGEND_ROWS))
  const legendX = $derived(donutX + dimensions.sizePixels + 24)

  const SWEEP_BEGIN_SECONDS = 0.4

  const sweepMaskRadius = dimensions.outerRadiusPixels + 4
  const sweepMask = $derived(buildSweepRevealMask(centerX, centerY, sweepMaskRadius))
  const sweepMaskBox = $derived({
    x: centerX - sweepMaskRadius,
    y: centerY - sweepMaskRadius,
    size: sweepMaskRadius * 2,
  })

  // Mirrors the cubic ease-out sweep's own timing, so each slice's little pop/settle
  // lands right as the mask sweep reveals it — combining the true arc-growth
  // construction with the earlier per-slice "pop in" flourish.
  function sweepDelaySeconds(startAngleDegrees: number): number {
    const easedProgress = Math.min(Math.max((startAngleDegrees + 90) / 360, 0), 1)
    const linearProgress = 1 - Math.cbrt(1 - easedProgress)
    return SWEEP_BEGIN_SECONDS + linearProgress * sweepMask.durSeconds
  }

  const topRepoY = $derived(y + height - BOTTOM_MARGIN - TOP_REPO_HEIGHT)
  const dividerY = $derived(topRepoY - DIVIDER_GAP)

  function truncateName(name: string): string {
    return name.length > NAME_MAX_CHARACTERS ? `${name.slice(0, NAME_MAX_CHARACTERS - 1)}…` : name
  }
</script>

<rect
  {x}
  {y}
  {width}
  {height}
  rx="18"
  fill={theme.surface}
  fill-opacity="0.6"
  stroke={theme.subtle}
  stroke-opacity="0.15"
  filter="url(#glass-shadow)"
/>
<text x={x + 24} y={y + 38} class="text-subtle">Languages</text>
<rect
  x={x + width - 84}
  y={y + 22}
  width="60"
  height="20"
  rx="10"
  fill={theme.iris}
  fill-opacity="0.1"
  stroke={theme.iris}
  stroke-opacity="0.2"
/>
<text
  x={x + width - 54}
  y={y + 36}
  class="text-main"
  fill={theme.iris}
  font-size="10"
  text-anchor="middle"
>
  {slices.length} used
</text>

<circle
  cx={centerX}
  cy={centerY}
  r={(dimensions.outerRadiusPixels + dimensions.innerRadiusPixels) / 2}
  fill="none"
  stroke={theme.subtle}
  stroke-opacity="0.06"
  stroke-width={dimensions.outerRadiusPixels - dimensions.innerRadiusPixels + 1}
/>

{#if slices.length > 0}
  <mask
    id="lang-sweep-mask"
    maskUnits="userSpaceOnUse"
    x={sweepMaskBox.x}
    y={sweepMaskBox.y}
    width={sweepMaskBox.size}
    height={sweepMaskBox.size}
  >
    <rect
      x={sweepMaskBox.x}
      y={sweepMaskBox.y}
      width={sweepMaskBox.size}
      height={sweepMaskBox.size}
      fill="black"
    />
    <path d={sweepMask.baseD} fill="white">
      <animate
        attributeName="d"
        values={sweepMask.values}
        keyTimes={sweepMask.keyTimes}
        dur="{sweepMask.durSeconds}s"
        begin="{SWEEP_BEGIN_SECONDS}s"
        fill="freeze"
        calcMode="discrete"
      />
    </path>
  </mask>

  <g mask="url(#lang-sweep-mask)">
    {#each slices as slice (slice.name)}
      {@const pathD = generateArcPath(
        centerX,
        centerY,
        dimensions.outerRadiusPixels,
        dimensions.innerRadiusPixels,
        slice.startAngleDegrees,
        slice.endAngleDegrees,
      )}
      <path
        d={pathD}
        fill={slice.color}
        class="anim-slice"
        style="transform-origin:{centerX}px {centerY}px; animation-delay:{sweepDelaySeconds(
          slice.startAngleDegrees,
        )}s"
      />
    {/each}
  </g>
{/if}

<clipPath id="lang-avatar-clip">
  <circle cx={centerX} cy={centerY} r={avatarRadius} />
</clipPath>
{#if avatarDataUri}
  <image
    x={centerX - avatarRadius}
    y={centerY - avatarRadius}
    width={avatarRadius * 2}
    height={avatarRadius * 2}
    href={avatarDataUri}
    clip-path="url(#lang-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<circle
  cx={centerX}
  cy={centerY}
  r={avatarRadius}
  fill="none"
  stroke={theme.surface}
  stroke-width="3"
/>

{#each legendSlices as slice, index (slice.name)}
  {@const rowY = donutY + index * LEGEND_ROW_HEIGHT + 10}

  <g class="anim-row" style="animation-delay:{0.5 + index * 0.06}s">
    <circle cx={legendX} cy={rowY - 4} r="4" fill={slice.color} />
    <text x={legendX + 12} y={rowY} class="text-main" font-size="12">
      {truncateName(slice.name)}
    </text>
    <text
      x={x + width - 24}
      y={rowY}
      class="text-main"
      font-size="12"
      font-weight="600"
      fill={slice.color}
      text-anchor="end"
    >
      {Math.round(slice.percentage)}%
    </text>
  </g>
{/each}

{#if mostStarredRepo}
  <line
    x1={x + 24}
    x2={x + width - 24}
    y1={dividerY}
    y2={dividerY}
    stroke={theme.subtle}
    stroke-opacity="0.15"
  />
  <g class="anim-row" style="animation-delay:0.9s">
    <ReadmeTopRepo
      repository={mostStarredRepo}
      {theme}
      x={x + 24}
      y={topRepoY}
      width={width - 48}
      height={TOP_REPO_HEIGHT}
      nested
    />
  </g>
{/if}
