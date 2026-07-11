<script lang="ts">
  import type { PieSlice } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'
  import { generateArcPath } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'
  import type { ThemeTokens } from '$lib/theme/theme-manager'

  let {
    slices,
    theme,
    avatarDataUri,
    centerX,
    centerY,
    outerRadius,
    innerRadius,
    filterId,
  }: {
    slices: PieSlice[]
    theme: ThemeTokens
    avatarDataUri: string
    centerX: number
    centerY: number
    outerRadius: number
    innerRadius: number
    filterId: string
  } = $props()

  const glowStd = $derived((outerRadius - innerRadius) * 0.4)
  const avatarRadius = $derived(innerRadius - Math.max(3, (outerRadius - innerRadius) * 0.12))
  const clipId = $derived(`${filterId}-avatar-clip`)
</script>

<defs>
  <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation={glowStd} result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <clipPath id={clipId}>
    <circle cx={centerX} cy={centerY} r={avatarRadius} />
  </clipPath>
</defs>

<circle
  cx={centerX}
  cy={centerY}
  r={(outerRadius + innerRadius) / 2}
  fill="none"
  stroke={theme.text}
  stroke-opacity="0.06"
  stroke-width={outerRadius - innerRadius}
/>

{#if slices.length}
  <g filter="url(#{filterId})">
    {#each slices as slice (slice.name)}
      <path
        d={generateArcPath(
          centerX,
          centerY,
          outerRadius,
          innerRadius,
          slice.startAngleDegrees,
          slice.endAngleDegrees,
        )}
        fill={slice.color}
        stroke="rgba(0,0,0,0.25)"
        stroke-width="1"
      />
    {/each}
  </g>
{/if}

<circle cx={centerX} cy={centerY} r={avatarRadius} fill={theme.base} fill-opacity="0.4" />
{#if avatarDataUri}
  <image
    x={centerX - avatarRadius}
    y={centerY - avatarRadius}
    width={avatarRadius * 2}
    height={avatarRadius * 2}
    href={avatarDataUri}
    clip-path="url(#{clipId})"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<circle
  cx={centerX}
  cy={centerY}
  r={avatarRadius}
  fill="none"
  stroke={theme.base}
  stroke-width="3"
/>
