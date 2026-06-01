<script lang="ts">
  import { generateArcPath, calculateSegmentOffset } from './useLanguagePie.svelte'
  import type { PieSlice } from './useLanguagePie.svelte'
  import { cn } from '$lib/ui/styling/class-merger'

  let {
    animatedSlices,
    hoveredIndex = $bindable(),
    centerX,
    centerY,
    outerRadiusPixels,
    innerRadiusPixels,
  }: {
    animatedSlices: PieSlice[]
    hoveredIndex: number | null
    centerX: number
    centerY: number
    outerRadiusPixels: number
    innerRadiusPixels: number
  } = $props()
</script>

<g class="transition-opacity duration-300 ease-in-out">
  {#each animatedSlices as slice, index (slice.name)}
    {@const isHovered = hoveredIndex === index}
    {@const isDimmed = hoveredIndex !== null && !isHovered}
    {@const offset = isHovered ? calculateSegmentOffset(slice) : { offsetX: 0, offsetY: 0 }}

    <path
      d={generateArcPath(
        centerX,
        centerY,
        outerRadiusPixels,
        innerRadiusPixels,
        slice.startAngleDegrees,
        slice.endAngleDegrees,
        offset.offsetX,
        offset.offsetY,
      )}
      fill={slice.color}
      class={cn(
        'cursor-pointer touch-manipulation transition-all duration-200',
        isDimmed ? 'opacity-20 saturate-50' : 'opacity-100',
      )}
      style={isHovered ? `filter: drop-shadow(0 0 12px ${slice.color}60);` : ''}
      onmouseenter={() => (hoveredIndex = index)}
      onmouseleave={() => (hoveredIndex = null)}
      role="presentation"
    />
  {/each}
</g>
