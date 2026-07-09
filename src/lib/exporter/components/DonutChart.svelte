<script lang="ts">
  import type { PieSlice } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'
  import { generateArcPath as arcPath } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'

  let {
    size,
    ro,
    ri,
    slices,
    scaleUnit,
    variant = 'landscape',
  }: {
    size: number
    ro: number
    ri: number
    slices: PieSlice[]
    scaleUnit: number
    variant?: 'landscape' | 'portrait'
  } = $props()

  const portrait = $derived(variant === 'portrait')
  const cx = $derived(size / 2)
  const cy = $derived(size / 2)
  const filterId = $derived(portrait ? 'glow-p' : 'glow-l')
  const glowStd = $derived(portrait ? scaleUnit * 1.2 : scaleUnit * 0.9)
  const countSize = $derived(portrait ? scaleUnit * 1.1 : scaleUnit * 0.85)
  const countY = $derived(portrait ? cy - scaleUnit * 0.8 : cy - scaleUnit * 0.6)
  const labelSize = $derived(portrait ? scaleUnit * 0.9 : scaleUnit * 0.68)
  const labelY = $derived(portrait ? cy + scaleUnit * 1.5 : cy + scaleUnit * 1.1)

  // Track radius sits exactly at the midpoint of the ring
  const trackR = $derived((ro + ri) / 2)
  // Track stroke width matches the ring thickness exactly — no overlap
  const trackWidth = $derived(ro - ri)
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="donut-svg">
  <defs>
    <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={glowStd} result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Sunken track — sits exactly behind the slices, no bleed -->
  <circle
    {cx}
    {cy}
    r={trackR}
    fill="none"
    stroke="rgba(144,140,170,0.08)"
    stroke-width={trackWidth}
  />

  <!-- Colored slices with glow -->
  <g filter="url(#{filterId})">
    {#each slices as sl (sl.name)}
      <path
        d={arcPath(cx, cy, ro, ri, sl.startAngleDegrees, sl.endAngleDegrees)}
        fill={sl.color}
        stroke="rgba(0,0,0,0.25)"
        stroke-width="1.2"
      />
    {/each}
  </g>

  <!-- Inner hole fill - slightly darkened to ground the center -->
  <circle {cx} {cy} r={ri - 1} fill="rgba(0,0,0,0.15)" />

  <!-- Subtle inner ring -->
  <circle {cx} {cy} r={ri - 1} fill="none" stroke-width="0.8" stroke="rgba(255,255,255,0.06)" />

  <!-- Slice count -->
  <text
    x={cx}
    y={countY}
    text-anchor="middle"
    dominant-baseline="middle"
    font-size={countSize}
    font-family="DM Mono,monospace"
    font-weight="600"
    letter-spacing="0.04em"
    fill="var(--text)"
    opacity="0.9">{slices.length}</text
  >

  <!-- Label -->
  <text
    x={cx}
    y={labelY}
    text-anchor="middle"
    dominant-baseline="middle"
    font-size={labelSize}
    font-family="DM Mono,monospace"
    letter-spacing="0.16em"
    fill="var(--muted)"
    font-weight="500">LANGUAGES</text
  >
</svg>

<style>
  .donut-svg {
    flex-shrink: 0;
    overflow: visible;
  }
</style>
