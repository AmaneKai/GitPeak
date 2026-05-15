<script lang="ts">
	import { arcPath } from "$lib/entities/github/ui/useLanguagePie.svelte"

	interface Slice {
		color: string
		startDeg: number
		endDeg: number
	}

	let {
		size,
		ro,
		ri,
		slices,
		u,
		variant = "landscape",
	}: {
		size: number
		ro: number
		ri: number
		slices: Slice[]
		u: number
		variant?: "landscape" | "portrait"
	} = $props()

	const portrait = $derived(variant === "portrait")
	const cx = $derived(size / 2)
	const cy = $derived(size / 2)
	const filterId = $derived(portrait ? "glow-p" : "glow-l")
	const glowStd = $derived(portrait ? u * 0.8 : u * 0.6)
	const countSize = $derived(portrait ? u * 1.1 : u * 0.85)
	const countY = $derived(portrait ? cy - u * 0.8 : cy - u * 0.6)
	const labelSize = $derived(portrait ? u * 0.9 : u * 0.68)
	const labelY = $derived(portrait ? cy + u * 1.5 : cy + u * 1.1)
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="donut-svg">
	<defs>
		<filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur in="SourceGraphic" stdDeviation={glowStd} result="blur" />

			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<circle
		{cx}
		{cy}
		r={(ro + ri) / 2}
		fill="none"
		stroke="rgba(144,140,170,0.1)"
		stroke-width={ro - ri + 1}
	/>

	<g filter="url(#{filterId})">
		{#each slices as s}
			<path d={arcPath(cx, cy, ro, ri, s.startDeg, s.endDeg)} fill={s.color} />
		{/each}
	</g>

	<circle {cx} {cy} r={ri - 2} fill="var(--base)" />

	<circle
		{cx}
		{cy}
		r={ri - 2}
		fill="none"
		stroke-width="1.5"
		stroke="color-mix(in srgb, var(--iris) 25%, transparent)"
	/>

	<text
		x={cx}
		y={countY}
		text-anchor="middle"
		dominant-baseline="middle"
		font-size={countSize}
		font-family="DM Mono,monospace"
		letter-spacing="0.06em"
		fill="var(--subtle)"
	>
		{slices.length}
	</text>

	<text
		x={cx}
		y={labelY}
		text-anchor="middle"
		dominant-baseline="middle"
		font-size={labelSize}
		font-family="DM Mono,monospace"
		letter-spacing="0.1em"
		fill="var(--muted)"
	>
		LANGUAGES
	</text>
</svg>

<style>
	.donut-svg {
		flex-shrink: 0;
		overflow: visible;
	}
</style>
