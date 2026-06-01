<script lang="ts">
  import type { PieSlice } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte.ts'

  let {
    slices,
    scaleUnit,
  }: {
    slices: PieSlice[]
    scaleUnit: number
  } = $props()

  // Calculate dots distribution
  // We want a 10x10 grid (100 dots total)
  const totalDots = 100
  
  const dotMatrix = $derived.by(() => {
    if (!slices.length) return []
    
    // First pass: integer counts
    const counts = slices.map(s => ({
      ...s,
      dotCount: Math.floor((s.percentage / 100) * totalDots)
    }))
    
    // Distribute remainders to reach exactly totalDots
    let currentTotal = counts.reduce((sum, c) => sum + c.dotCount, 0)
    const remainders = slices.map((s, i) => ({
      index: i,
      rem: ((s.percentage / 100) * totalDots) % 1
    })).sort((a, b) => b.rem - a.rem)
    
    let remIdx = 0
    while (currentTotal < totalDots && remIdx < remainders.length) {
      counts[remainders[remIdx].index].dotCount++
      currentTotal++
      remIdx++
    }
    
    // Create the actual flat array of 100 dot colors
    const matrix: string[] = []
    counts.forEach(c => {
      for (let i = 0; i < c.dotCount; i++) {
        matrix.push(c.color)
      }
    })
    
    return matrix
  })

  const dotSize = $derived(scaleUnit * 0.75)
  const gap = $derived(scaleUnit * 0.45)
  // 10x10 grid size
  const gridSize = $derived(10 * dotSize + 9 * gap)
</script>

<div 
  class="matrix-grid" 
  style="
    width: {gridSize}px; 
    height: {gridSize}px; 
    gap: {gap}px;
    grid-template-columns: repeat(10, {dotSize}px);
  "
>
  {#each dotMatrix as color, i}
    <div 
      class="matrix-dot" 
      style="
        width: {dotSize}px; 
        height: {dotSize}px; 
        background: {color};
        box-shadow: 0 0 {scaleUnit * 0.5}px {color}66;
      "
    ></div>
  {/each}
</div>

<style>
  .matrix-grid {
    display: grid;
    flex-shrink: 0;
  }

  .matrix-dot {
    border-radius: 20%;
    opacity: 0.95;
    transition: transform 0.2s ease;
  }
</style>
