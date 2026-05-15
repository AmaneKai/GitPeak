<script lang="ts">
	import type { GithubStats } from "$lib/entities/github/model/github-stats"
	import { formatNumber } from "$lib/shared/utils/format"
	import { tiltStyle, shineStyle } from "$lib/shared/utils/tilt"
	import { useStatGrid, heroItems, detailItems } from "./useStatGrid.svelte"
	import * as Card from "$lib/shared/ui/card"
  import { cn } from "$lib/shared/utils/ui"

	let { stats }: { stats: GithubStats } = $props()
	const grid = useStatGrid()

	let isTouch = $state(false)
	$effect(() => {
		if (typeof window !== "undefined") {
			isTouch = window.matchMedia("(pointer: coarse)").matches
		}
	})
</script>

<div class="flex flex-col gap-3">
	<div class="grid grid-cols-2 gap-3">
		{#each heroItems(stats) as item, i}
			{@const Icon = item.icon as any}
			{@const t = grid.tilts[i]}
			{@const accent = `var(--${item.accentVar})`}
			<Card.Root
				role="presentation"
				class={cn(
        "tilt-card glass relative cursor-default overflow-hidden",
        "rounded-2xl border-0 bg-transparent shadow-none select-none")}
				style="{tiltStyle(t)}; animation-delay: {i * 50}ms"
				onmousemove={!isTouch ? (e: any) => grid.onMove(e, i) : undefined}
				onmouseleave={!isTouch ? (e: any) => grid.onLeave(e, i) : undefined}
			>
				<div
					class="tilt-shine"
					style="background:radial-gradient(ellipse at 100% 0%, 
            color-mix(in srgb, {accent} 9%, transparent) 0%, transparent 60%);"
				></div>
				{#if !isTouch}
					<div class="tilt-shine" style={shineStyle(t)}></div>
				{/if}

				<Card.Content
					class="relative z-10 flex flex-col gap-3 p-[14px_16px] sm:gap-4 sm:p-[18px_20px]"
				>
					<div class="flex items-center justify-between">
						<span
							class="font-mono text-[9px] tracking-widest uppercase sm:text-[10px]"
							style="color: var(--subtle)"
						>
							{item.label}
						</span>
						<span
							class="flex h-6 w-6 items-center justify-center rounded-lg sm:h-7 sm:w-7"
							style="background:color-mix(in srgb, {accent} 10%, transparent); color:{accent};"
						>
							<Icon size={12} />
						</span>
					</div>

					<span
						class="font-serif leading-none font-bold tracking-tight"
						style="font-size: clamp(1.8rem, 5vw, 2.6rem); color: var(--text);"
					>
						{formatNumber(item.value)}
					</span>

					<div
						class="h-0.5 rounded-full transition-all duration-200"
						style="
            width:48px;
            transform:scaleX({t.active ? 1 : 0.58});
            transform-origin:left center;
            background:{accent};
            opacity:{t.active ? 0.8 : 0.5};
            box-shadow:{t.active ? `0 0 8px ${accent}` : 'none'};
          "
					></div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<div class="grid grid-cols-3 gap-2 sm:gap-2.5">
		{#each detailItems(stats) as item, i}
			{@const Icon = item.icon as any}
			{@const idx = i + 2}
			{@const t = grid.tilts[idx]}
			{@const accent = `var(--${item.accentVar})`}
			<Card.Root
				role="presentation"
				class="tilt-card glass relative cursor-default 
        overflow-hidden rounded-[14px] border-0 bg-transparent shadow-none select-none"
				style="{tiltStyle(t)}; animation-delay: {idx * 50}ms"
				onmousemove={!isTouch ? (e: any) => grid.onMove(e, idx) : undefined}
				onmouseleave={!isTouch ? (e: any) => grid.onLeave(e, idx) : undefined}
			>
				<div
					class="tilt-shine"
					style="background:radial-gradient(ellipse at 100% 0%,
          color-mix(in srgb, {accent} 7%, transparent) 0%, transparent 60%);"
				></div>
				{#if !isTouch}
					<div class="tilt-shine" style={shineStyle(t)}></div>
				{/if}

				<Card.Content
					class="relative z-10 flex flex-col gap-1.5 p-[10px_12px] sm:gap-2 sm:p-[12px_14px]"
				>
					<div class="flex items-center justify-between gap-1">
						<span
							class="truncate font-mono text-[8px] tracking-widest uppercase sm:text-[9px]"
							style="color: var(--subtle)"
						>
							{item.label}
						</span>
						<span
							class="flex h-4 w-4 shrink-0 items-center justify-center rounded-md sm:h-5 sm:w-5"
							style="background:color-mix(in srgb, {accent} 9%, transparent); color:{accent};"
						>
							<Icon size={9} />
						</span>
					</div>

					<span
						class="font-serif leading-none font-bold tracking-tight"
						style="font-size: clamp(1.1rem, 4vw, 1.6rem); color: var(--text);"
					>
						{formatNumber(item.value)}
					</span>

					<div
						class="h-px rounded-full"
						style="
            width:36px;
            transform:scaleX({t.active ? 1 : 0.55});
            transform-origin:left center;
            background:{accent};
            opacity:{t.active ? 0.7 : 0.4};
            transition:width 0.2s ease, opacity 0.2s ease;
          "
					></div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
