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
  import { Orbit, Palette, Globe, User, Users } from 'lucide-svelte'
  import { fade, scale } from 'svelte/transition'
  import * as Tooltip from '$lib/components/ui/tooltip'

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
  let ownershipFilter = $state<'all' | 'owned' | 'others'>('all')
  let hoveredIndex = $state<number | null>(null)

  const pieManager = useLanguagePie(() => languages)

  const filteredRepos = $derived.by(() => {
    if (viewMode === 'languages') return involvedRepos
    if (ownershipFilter === 'owned') return involvedRepos.filter((r) => r.isOwned)
    if (ownershipFilter === 'others') return involvedRepos.filter((r) => !r.isOwned)
    return involvedRepos
  })

  const orbitNodes = $derived(
    calculateOrbitNodes(
      filteredRepos,
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

  <CardContent class="min-h-[300px] p-4 pb-16 pt-4 sm:p-5 sm:pb-16">
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

        {#if viewMode === 'orbit'}
          <div
            transition:scale={{ duration: 250, start: 0.9 }}
            class="bg-base/80 border-subtle/10 absolute -bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border p-1 shadow-lg backdrop-blur-md"
          >
            <Tooltip.Provider delayDuration={0}>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <button
                    class={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                      ownershipFilter === 'all'
                        ? 'bg-iris/20 text-iris'
                        : 'text-muted hover:bg-black/5 hover:text-subtle',
                    )}
                    onclick={() => (ownershipFilter = 'all')}
                  >
                    <Globe size={11} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="top" sideOffset={8}>All Repos</Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger>
                  <button
                    class={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                      ownershipFilter === 'owned'
                        ? 'bg-iris/20 text-iris'
                        : 'text-muted hover:bg-black/5 hover:text-subtle',
                    )}
                    onclick={() => (ownershipFilter = 'owned')}
                  >
                    <User size={11} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="top" sideOffset={8}>My Repos</Tooltip.Content>
              </Tooltip.Root>

              <Tooltip.Root>
                <Tooltip.Trigger>
                  <button
                    class={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                      ownershipFilter === 'others'
                        ? 'bg-iris/20 text-iris'
                        : 'text-muted hover:bg-black/5 hover:text-subtle',
                    )}
                    onclick={() => (ownershipFilter = 'others')}
                  >
                    <Users size={11} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="top" sideOffset={8}>Contributions</Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        {/if}
      </div>

      <div class="w-full sm:w-64">
        <ChartLegend {viewMode} slices={pieManager.slices} {orbitNodes} bind:hoveredIndex />
      </div>
    </div>
  </CardContent>
</Card>
