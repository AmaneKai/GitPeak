<script lang="ts">
  import type { GitHubLanguage, InvolvedRepo } from '$lib/github/models/github-stats'
  import { useLanguagePie } from './useLanguagePie.svelte'
  import { calculateOrbitNodes } from '../../models/orbit-calculations'
  import LanguagePieChart from './LanguagePieChart.svelte'
  import RecencyOrbitChart from './RecencyOrbitChart.svelte'
  import ChartLegend from './ChartLegend.svelte'

  import { Card, CardContent, CardHeader } from '$lib/components/ui/card'
  import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Orbit, Palette } from 'lucide-svelte'

  import { cn } from '$lib/ui/styling/class-merger'

  let {
    languages,
    avatarUrl,
    involvedRepos = [],
  }: {
    languages: GitHubLanguage[]
    avatarUrl: string
    involvedRepos?: InvolvedRepo[]
  } = $props()

  let viewMode = $state<'languages' | 'orbit'>('languages')
  let hoveredIndex = $state<number | null>(null)

  const pieManager = useLanguagePie(() => languages)

  const orbitNodes = $derived(
    calculateOrbitNodes(
      involvedRepos,
      languages,
      pieManager.dimensions.centerX,
      pieManager.dimensions.centerY,
      pieManager.dimensions.innerRadiusPixels,
      pieManager.dimensions.outerRadiusPixels,
    ),
  )

  const activeThemeColor = $derived.by(() => {
    if (viewMode === 'orbit' && hoveredIndex !== null)
      return orbitNodes[hoveredIndex]?.languageColor || 'var(--iris)'

    if (viewMode === 'languages' && hoveredIndex !== null)
      return pieManager.slices[hoveredIndex]?.color || 'var(--iris)'

    return 'var(--iris)'
  })

  const buttonSize = $derived((pieManager.dimensions.innerRadiusPixels - 3.5) * 2)
  const buttonOffset = $derived((pieManager.dimensions.sizePixels - buttonSize) / 2)
</script>

<Card class="glass overflow-hidden rounded-2xl">
  <CardHeader class="p-4 pb-0 sm:p-5">
    <div class="flex items-center justify-between gap-2">
      <span class="text-subtle font-mono text-[10px] tracking-widest uppercase">
        {viewMode === 'languages' ? 'Languages' : 'Recency Orbit'}
      </span>

      <Tabs value={viewMode} onValueChange={(value) => (viewMode = value as typeof viewMode)}>
        <TabsList class="h-7 rounded-lg bg-black/10 p-0.5">
          <TabsTrigger value="languages" class="h-6 px-2.5 font-mono text-[9px]">
            <Palette size={10} class="mr-1" />
            Lang
          </TabsTrigger>
          <TabsTrigger value="orbit" class="h-6 px-2.5 font-mono text-[9px]">
            <Orbit size={10} class="mr-1" />
            Orbit
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </CardHeader>

  <CardContent class="p-4 pt-4 sm:p-5">
    <div
      class="flex flex-col items-center justify-center gap-5
        sm:flex-row sm:items-start"
    >
      <div
        class="relative shrink-0"
        style="width: {pieManager.dimensions.sizePixels}px;
               height: {pieManager.dimensions.sizePixels}px;"
      >
        <svg
          width={pieManager.dimensions.sizePixels}
          height={pieManager.dimensions.sizePixels}
          class="pointer-events-auto absolute inset-0 overflow-visible"
        >
          <!-- Baseline Ring -->
          <circle
            cx={pieManager.dimensions.centerX}
            cy={pieManager.dimensions.centerY}
            r={(pieManager.dimensions.outerRadiusPixels + pieManager.dimensions.innerRadiusPixels) /
              2}
            fill="none"
            class="stroke-subtle/5"
            stroke-width={pieManager.dimensions.outerRadiusPixels -
              pieManager.dimensions.innerRadiusPixels +
              1}
          />

          {#if viewMode === 'languages'}
            <LanguagePieChart
              animatedSlices={pieManager.animatedSlices}
              bind:hoveredIndex
              centerX={pieManager.dimensions.centerX}
              centerY={pieManager.dimensions.centerY}
              innerRadiusPixels={pieManager.dimensions.innerRadiusPixels}
              outerRadiusPixels={pieManager.dimensions.outerRadiusPixels}
            />
          {:else}
            <RecencyOrbitChart
              {orbitNodes}
              bind:hoveredIndex
              centerX={pieManager.dimensions.centerX}
              centerY={pieManager.dimensions.centerY}
              innerRadiusPixels={pieManager.dimensions.innerRadiusPixels}
              outerRadiusPixels={pieManager.dimensions.outerRadiusPixels}
            />
          {/if}

          <circle
            cx={pieManager.dimensions.centerX}
            cy={pieManager.dimensions.centerY}
            r={pieManager.dimensions.innerRadiusPixels - 2}
            fill="none"
            stroke-width="1.5"
            class="transition-colors duration-200"
            style="stroke: color-mix(in srgb, {activeThemeColor} {hoveredIndex !== null
              ? '40%'
              : '18%'}, transparent);"
          />
        </svg>

        <button
          type="button"
          onclick={() => (viewMode = viewMode === 'languages' ? 'orbit' : 'languages')}
          class={cn(
            'bg-base group absolute flex cursor-pointer items-center',
            'justify-center overflow-hidden rounded-full border-none',
            'shadow-md transition-transform outline-none active:scale-95',
          )}
          style={`
            width: ${buttonSize}px; 
            height: ${buttonSize}px; 
            top: ${buttonOffset}px; 
            left: ${buttonOffset}px;
          `}
        >
          <Avatar.Root
            class="absolute inset-0 h-full w-full transition-all
              group-hover:brightness-110"
          >
            <Avatar.Image src={avatarUrl} alt="User avatar" />
            <Avatar.Fallback class="bg-muted text-muted-foreground font-mono text-xs">
              GP
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </div>

      <ChartLegend {viewMode} slices={pieManager.slices} {orbitNodes} bind:hoveredIndex />
    </div>
  </CardContent>
</Card>
