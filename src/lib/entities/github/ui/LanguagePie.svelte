<script lang="ts">
	import type { GitHubLanguage } from "$lib/entities/github/model/github-stats"
	import { useLanguagePie, arcPath, segOffset } from "./useLanguagePie.svelte"
	import { langIconUrl, hideImgOnError } from "$lib/shared/utils/icons"
	import { Badge } from "$lib/shared/ui/badge"
	import { Card, CardContent, CardHeader } from "$lib/shared/ui/card"
	import { Separator } from "$lib/shared/ui/separator"

	let {
		languages,
		avatarUrl,
	}: {
		languages: GitHubLanguage[]
		avatarUrl: string
	} = $props()

	const pie = useLanguagePie(() => languages)
	const { SIZE, CX, CY, R_OUTER, R_INNER } = pie.dims
</script>

<Card class="glass overflow-hidden rounded-2xl">
	<CardHeader class="p-4 pb-0 sm:p-5">
		<div class="flex items-center gap-2">
			<span class="font-mono text-[10px] tracking-widest uppercase" style="color: var(--subtle)">
				Languages
			</span>
			<Separator
				class="flex-1"
				style="background: color-mix(in srgb, var(--subtle) 10%, transparent)"
			/>
			<Badge
				variant="outline"
				class="rounded-full px-2 py-0.5 font-mono text-[10px]"
				style="background:color-mix(in srgb, var(--iris) 9%, transparent);
               border-color:color-mix(in srgb, var(--iris) 18%, transparent);
               color:var(--iris);"
			>
				{languages.length} used
			</Badge>
		</div>
	</CardHeader>

	<CardContent class="p-4 pt-4 sm:p-5">
		<div class="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
			<div class="shrink-0" style="width:{SIZE}px; height:{SIZE}px;">
				<svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" style="overflow:visible;">
					<defs>
						<clipPath id="lp-av-clip">
							<circle cx={CX} cy={CY} r={R_INNER - 5} />
						</clipPath>
						{#each pie.slices as slice, i}
							<filter id="lp-glow-{i}" x="-50%" y="-50%" width="200%" height="200%">
								<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
								<feFlood flood-color={slice.color} flood-opacity="0.5" result="clr" />
								<feComposite in="clr" in2="blur" operator="in" result="glow" />
								<feMerge>
									<feMergeNode in="glow" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						{/each}
					</defs>

					<circle
						cx={CX}
						cy={CY}
						r={(R_OUTER + R_INNER) / 2}
						fill="none"
						stroke="rgba(144,140,170,0.05)"
						stroke-width={R_OUTER - R_INNER + 1}
					/>

					{#each pie.animatedSlices as slice, i}
						{@const off = pie.hovered === i ? segOffset(slice) : { x: 0, y: 0 }}
						<path
							d={arcPath(CX, CY, R_OUTER, R_INNER, slice.startDeg, slice.endDeg, off.x, off.y)}
							fill={slice.color}
							class="arc-path"
							class:dimmed={pie.hovered !== null && pie.hovered !== i}
							style="filter:{pie.hovered === i ? `url(#lp-glow-${i})` : 'none'};"
							onmouseenter={() => pie.onEnter(i)}
							onmouseleave={pie.onLeave}
							ontouchstart={() => pie.onEnter(i)}
							ontouchend={pie.onLeave}
							role="presentation"
						/>
					{/each}

					<circle cx={CX} cy={CY} r={R_INNER - 2} fill="var(--base)" />
					<circle
						cx={CX}
						cy={CY}
						r={R_INNER - 2}
						fill="none"
						stroke-width="1.5"
						style="
              stroke:{pie.hovered !== null
							? pie.slices[pie.hovered]?.color
							: 'rgba(196,167,231,0.18)'};
              transition:stroke 0.2s ease;
            "
					/>
					<image
						href={avatarUrl}
						x={CX - (R_INNER - 7)}
						y={CY - (R_INNER - 7)}
						width={(R_INNER - 7) * 2}
						height={(R_INNER - 7) * 2}
						clip-path="url(#lp-av-clip)"
						preserveAspectRatio="xMidYMid slice"
					/>

					{#if pie.hovered !== null}
						{@const s = pie.slices[pie.hovered]}
						<circle
							cx={CX}
							cy={CY}
							r={R_INNER - 7}
							fill="var(--base)"
							fill-opacity="0.82"
							style="pointer-events:none;"
						/>
						<text
							x={CX}
							y={CY - 8}
							text-anchor="middle"
							dominant-baseline="middle"
							font-size="9"
							font-family="DM Mono, monospace"
							letter-spacing="0.08em"
							fill={s.color}
							style="pointer-events:none;">{s.name}</text
						>
						<text
							x={CX}
							y={CY + 11}
							text-anchor="middle"
							dominant-baseline="middle"
							font-size="19"
							font-weight="700"
							font-family="Instrument Serif, serif"
							fill="var(--text)"
							style="pointer-events:none;">{s.percentage}%</text
						>
					{/if}
				</svg>
			</div>

			<ul class="legend-list mt-1 flex w-full flex-col gap-0.5">
				{#each pie.slices as slice, i}
					{@const url = langIconUrl(slice.name)}
					{@const active = pie.hovered === i}
					<li
						class="lang-row"
						class:active
						style="background:{active ? `${slice.color}12` : 'transparent'};animation-delay:{i *
							70 +
							200}ms;"
						onmouseenter={() => pie.onEnter(i)}
						onmouseleave={pie.onLeave}
						ontouchstart={() => pie.onEnter(i)}
						ontouchend={pie.onLeave}
					>
						<span
							class="icon-badge"
							style="
              background:{slice.color}1a;
              border:1px solid {slice.color}{active ? '48' : '20'};
              box-shadow:{active ? `0 0 9px ${slice.color}38` : 'none'};
            "
						>
							{#if url}
								<img src={url} alt={slice.name} width="13" height="13" onerror={hideImgOnError} />
								<span
									style="display:none;width:7px;height:7px;border-radius:50%;background:{slice.color};"
								></span>
							{:else}
								<span style="width:7px;height:7px;border-radius:50%;background:{slice.color};"
								></span>
							{/if}
						</span>

						<span
							class="flex-1 truncate"
							style="
              font-family:'DM Mono',monospace;font-size:11px;
              letter-spacing:0.01em;transition:color 0.13s ease;
              color:{active ? slice.color : 'var(--text)'};
              font-weight:{active ? 500 : 400};
            ">{slice.name}</span
						>

						<div
							class="shrink-0 overflow-hidden rounded-full"
							style="width:60px; height:3px; 
              background:color-mix(in srgb, var(--subtle) 10%, transparent);"
						>
							<div
								class="bar-grow h-full rounded-full"
								style="
                width:{slice.percentage}%;
                background:{slice.color};
                opacity:{active ? 1 : 0.55};
                animation-delay:{i * 55}ms;
                box-shadow:{active ? `0 0 7px ${slice.color}bb` : 'none'};
              "
							></div>
						</div>

						<span
							class="shrink-0 text-right"
							style="
              font-family:'DM Mono',monospace;font-size:10.5px;width:28px;
              transition:color 0.13s ease;
              color:{active ? slice.color : 'var(--muted)'};
              font-weight:{active ? 600 : 400};
            ">{slice.percentage}%</span
						>
					</li>
				{/each}
			</ul>
		</div>
	</CardContent>
</Card>

<style>
	.arc-path {
		cursor: pointer;
		transition:
			opacity 0.18s ease,
			filter 0.18s ease;
		touch-action: manipulation;
	}
	.arc-path.dimmed {
		opacity: 0.16;
		filter: saturate(0.12);
	}

	.legend-list {
		max-height: 236px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(144, 140, 170, 0.16) transparent;
		touch-action: pan-y;
	}
	.legend-list::-webkit-scrollbar {
		width: 3px;
	}
	.legend-list::-webkit-scrollbar-thumb {
		background: rgba(144, 140, 170, 0.16);
		border-radius: 99px;
	}

	@keyframes row-in {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.lang-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 6px;
		border-radius: 8px;
		cursor: default;
		user-select: none;
		transition:
			background 0.13s ease,
			transform 0.13s ease;
		touch-action: manipulation;
		animation: row-in 0.4s ease backwards;
	}
	.lang-row:hover,
	.lang-row.active {
		transform: translateX(3px);
	}

	.icon-badge {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition:
			transform 0.13s ease,
			box-shadow 0.13s ease;
	}
	.lang-row:hover .icon-badge,
	.lang-row.active .icon-badge {
		transform: scale(1.12) rotate(-3deg);
	}

	.icon-badge img {
		width: 13px;
		height: 13px;
		object-fit: contain;
		filter: brightness(0) invert(1);
		opacity: 0.6;
		transition:
			filter 0.13s ease,
			opacity 0.13s ease;
	}
	.lang-row:hover .icon-badge img,
	.lang-row.active .icon-badge img {
		filter: none;
		opacity: 1;
	}

	@media (max-width: 640px) {
		.legend-list {
			max-height: 180px;
		}
		.lang-row {
			padding: 6px 8px;
		}
	}
</style>
