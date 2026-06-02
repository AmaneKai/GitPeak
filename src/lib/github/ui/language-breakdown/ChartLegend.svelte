<script lang="ts">
  import { langIconUrl as getLanguageIconUrl } from '$lib/github/ui/language-icons'
  import { fade } from 'svelte/transition'
  import type { PieSlice } from './useLanguagePie.svelte'
  import type { OrbitNode } from '../../models/orbit-calculations'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { cn } from '$lib/ui/styling/class-merger'

  let {
    viewMode,
    slices,
    orbitNodes,
    hoveredIndex = $bindable(),
  }: {
    viewMode: 'languages' | 'orbit'
    slices: PieSlice[]
    orbitNodes: OrbitNode[]
    hoveredIndex: number | null
  } = $props()
</script>

<div class="flex w-full flex-col gap-3">
  <ScrollArea class="h-59 w-full pr-3">
    {#if viewMode === 'languages'}
      <div class="fade-in-up flex flex-col gap-0.5">
        {#each slices as slice, index (slice.name)}
          {@const isSliceActive = hoveredIndex === index}
          {@const languageIconUrl = getLanguageIconUrl(slice.name)}

          <div
            role="presentation"
            class={cn(
              'flex cursor-default items-center gap-2 rounded-lg px-2 py-1 select-none',
              'transition-all duration-200',
              isSliceActive ? 'translate-x-[1.5px]' : '',
            )}
            style={`
              background-color: ${
                isSliceActive
                  ? `color-mix(in srgb, ${slice.color} 12%, transparent)`
                  : 'transparent'
              };
              color: ${isSliceActive ? slice.color : 'var(--text)'};
              animation-delay: ${index * 30}ms;
            `}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
          >
            <span
              class={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'transition-all',
                isSliceActive ? 'scale-105' : '',
              )}
              style={`
                background-color: color-mix(in srgb, ${slice.color} 10%, transparent);
                border: 1px solid color-mix(
                  in srgb, 
                  ${slice.color} ${isSliceActive ? '30%' : '10%'}, 
                  transparent
                );
              `}
            >
              {#if languageIconUrl}
                <span
                  class="h-3.5 w-3.5 opacity-60 transition-opacity"
                  style={`
                    background-color: currentColor;
                    -webkit-mask-image: url(${languageIconUrl});
                    mask-image: url(${languageIconUrl});
                    -webkit-mask-size: contain;
                    mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                    mask-position: center;
                  `}
                ></span>
              {:else}
                <span class="h-1.5 w-1.5 rounded-full" style="background-color: {slice.color};"
                ></span>
              {/if}
            </span>

            <span
              class="flex-1 truncate font-mono text-[11px] transition-colors"
              style="font-weight: {isSliceActive ? 500 : 400};"
            >
              {slice.name}
            </span>

            <div
              class={cn('bg-subtle/10 h-0.75 w-15', 'shrink-0 overflow-hidden rounded-full')}
            >
              <div
                class="bar-grow h-full rounded-full"
                style={`
                  width: ${slice.percentage}%; 
                  background-color: ${slice.color}; 
                  opacity: ${isSliceActive ? 1 : 0.55}; 
                  animation-delay: ${index * 20}ms;
                `}
              ></div>
            </div>

            <span
              class="w-7 shrink-0 text-right font-mono text-[10px] transition-colors"
              style={`
                color: ${isSliceActive ? slice.color : 'var(--muted)'}; 
                font-weight: ${isSliceActive ? 600 : 400};
              `}
            >
              {slice.percentage}%
            </span>
          </div>
        {/each}
      </div>
    {:else}
      <div class="fade-in-up flex flex-col gap-0.5">
        <div class="text-muted px-2 pb-1.5 font-mono text-[9px] tracking-wider uppercase">
          Recent Activity ({orbitNodes.length})
        </div>

        {#each orbitNodes as node, index (node.url)}
          {@const isNodeActive = hoveredIndex === index}

          <button
            transition:fade={{ duration: 150 }}
            type="button"
            class={cn(
              'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-left',
              'transition-all duration-200',
              isNodeActive ? 'translate-x-[1.5px]' : '',
            )}
            style={`
              background-color: ${
                isNodeActive
                  ? `color-mix(in srgb, ${node.languageColor} 12%, transparent)`
                  : 'transparent'
              };
              color: ${isNodeActive ? node.languageColor : 'var(--text)'};
              animation-delay: ${index * 30}ms;
            `}
            onmouseenter={() => (hoveredIndex = index)}
            onmouseleave={() => (hoveredIndex = null)}
            onclick={() => window.open(node.url, '_blank')}
          >
            <span
              class={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                'transition-all',
                isNodeActive ? 'scale-105' : '',
              )}
              style={`
                background-color: color-mix(
                  in srgb, 
                  ${node.languageColor} 10%, 
                  transparent
                );
                border: 1px solid color-mix(
                  in srgb, 
                  ${node.languageColor} ${isNodeActive ? '30%' : '10%'}, 
                  transparent
                );
              `}
            >
              <span class="h-1.5 w-1.5 rounded-full" style="background-color: {node.languageColor};"
              ></span>
            </span>

            <div class="flex min-w-0 flex-1 flex-col">
              <span
                class="truncate font-mono text-[11px] font-medium transition-colors"
                style="font-weight: {isNodeActive ? 500 : 400};"
              >
                {node.name}
              </span>
              <span class="text-muted truncate text-[9px]">
                {node.owner} &nbsp;·&nbsp; {node.primaryLanguage || 'Code'}
              </span>
            </div>

            <span
              class="shrink-0 text-right font-mono text-[10px] transition-colors"
              style={`
                color: ${isNodeActive ? node.languageColor : 'var(--subtle)'};
              `}
            >
              {node.relativeTimeLabel}
            </span>
          </button>
        {/each}
      </div>
    {/if}
  </ScrollArea>
</div>
