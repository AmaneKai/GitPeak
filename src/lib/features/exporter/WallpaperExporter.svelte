<script lang="ts">
	import { toPng } from "html-to-image"
	import { X, Download } from "lucide-svelte"
	import type { GithubStats } from "$lib/entities/github/model/github-stats"
	import WallpaperCanvas from "./WallpaperCanvas.svelte"
	import { Button } from "$lib/shared/ui/button"
	import { toast } from "svelte-sonner"

	interface Format {
		id: string
		name: string
		sub: string
		w: number
		h: number
	}

	let {
		stats,
		login,
		onClose,
	}: {
		stats: GithubStats
		login: string
		onClose: () => void
	} = $props()

	const FORMATS: Format[] = [
		{ id: "desktop", name: "Desktop", sub: "16:9", w: 1920, h: 1080 },
		{ id: "mac", name: "MacBook", sub: "16:10", w: 2560, h: 1600 },
		{ id: "phone", name: "Phone", sub: "9:16", w: 1080, h: 1920 },
		{ id: "tall", name: "Tall", sub: "9:21", w: 1080, h: 2520 },
	]

	let selected = $state<Format>(FORMATS[0])
	let generating = $state(false)
	let exportNode = $state<HTMLElement | null>(null)
	let isMobile = $state(false)
	let avatarSrc = $state("")
	let previewW = $state(700)
	let previewH = $state(500)

	const pad = $derived(isMobile ? 16 : 48)
	const scale = $derived(Math.min((previewW - pad) / selected.w, (previewH - pad) / selected.h))

	$effect(() => {
		const url = stats.avatarUrl

		if (!url) return

		avatarSrc = url
		fetch(url)
			.then((r) => {
				if (!r.ok) throw new Error(`${r.status}`)

				return r.blob()
			})
			.then(
				(blob) =>
					new Promise<string>((res, rej) => {
						const reader = new FileReader()
						reader.onload = () => res(reader.result as string)
						reader.onerror = () => rej(new Error("FileReader failed"))
						reader.readAsDataURL(blob)
					}),
			)
			.then((url) => {
				avatarSrc = url
			})
			.catch(() => {
				avatarSrc = url
			})
	})

	$effect(() => {
		const check = () => {
			isMobile = window.innerWidth < 640
		}
		check()
		window.addEventListener("resize", check)

		return () => window.removeEventListener("resize", check)
	})

	async function generate(): Promise<void> {
		if (!exportNode || generating) return

		generating = true

		try {
			await new Promise<void>((r) => setTimeout(r, 150))
			const dataUrl = await toPng(exportNode, {
				pixelRatio: 2,
				cacheBust: true,
				width: selected.w,
				height: selected.h,
				style: {
					backdropFilter: "none",
					WebkitBackdropFilter: "none",
				} as Partial<CSSStyleDeclaration>,
				skipFonts: false,
			})

			const a = document.createElement("a")
			a.href = dataUrl
			a.download = `gitpeek-${login}-${selected.id}.png`

			a.click()

			toast.success("Wallpaper saved!")
		} catch (err) {
			console.error("Export failed:", err)
			toast.error("Export failed. Check console for details.")
		} finally {
			generating = false
		}
	}
</script>

{#snippet formatList(fullWidth = false)}
	{#each FORMATS as fmt}
		<button
			class="fmt-btn"
			class:fmt-btn--full={fullWidth}
			class:fmt-btn--active={selected.id === fmt.id}
			onclick={() => (selected = fmt)}
		>
			<span>{fmt.name}</span>
			<span class="fmt-sub">{fmt.sub}</span>
		</button>
	{/each}
{/snippet}

{#snippet previewFrame()}
	<div
		class="preview-frame"
		style="
      width:{selected.w * scale}px; 
      height:{selected.h * scale}px;
    "
	>
		<div
			style="
        transform:scale({scale}); transform-origin:top left;
        width:{selected.w}px; 
        height:{selected.h}px;"
		>
			<div
				bind:this={exportNode}
				style="
        width:{selected.w}px; 
        height:{selected.h}px;
        "
			>
				<WallpaperCanvas {stats} {login} {avatarSrc} width={selected.w} height={selected.h} />
			</div>
		</div>
	</div>
{/snippet}

{#snippet downloadBtn()}
	<button class="dl-btn" class:dl-btn--busy={generating} onclick={generate} disabled={generating}>
		{#if !generating}<Download size={12} />{/if}
		{generating ? "Generating…" : "Download PNG"}
	</button>
{/snippet}

<svelte:window onkeydown={(e) => e.key === "Escape" && onClose()} />

<div
	class="backdrop fixed inset-0 z-40"
	role="button"
	tabindex="-1"
	aria-label="Close"
	onclick={onClose}
	onkeydown={() => {}}
></div>

<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
	<div class="modal pointer-events-auto" class:modal--mobile={isMobile}>
		{#if isMobile}
			<header class="panel-bar border-bottom">
				<span class="eyebrow">Wallpaper Export</span>
				<Button variant="ghost" size="icon" class="h-7 w-7" onclick={onClose} aria-label="Close">
					<X size={14} />
				</Button>
			</header>

			<div class="fmt-strip border-bottom">
				{@render formatList()}
			</div>

			<main class="preview-area" bind:clientWidth={previewW} bind:clientHeight={previewH}>
				{@render previewFrame()}
			</main>

			<footer class="panel-bar border-top">
				<span class="dim-label">{selected.w} × {selected.h}</span>
				{@render downloadBtn()}
			</footer>
		{:else}
			<aside class="sidebar">
				<div class="mb-5 flex items-center justify-between">
					<span class="eyebrow">Wallpaper Export</span>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 rounded-lg"
						onclick={onClose}
						aria-label="Close"
					>
						<X size={13} />
					</Button>
				</div>

				<p class="section-label">Format</p>
				<div class="flex flex-1 flex-col gap-1">
					{@render formatList(true)}
				</div>

				<div class="sidebar-footer border-top">
					<span class="dim-label text-center">{selected.w} × {selected.h}</span>
					{@render downloadBtn()}
				</div>
			</aside>

			<main
				class="flex min-w-0 flex-1 flex-col overflow-hidden"
				bind:clientWidth={previewW}
				bind:clientHeight={previewH}
			>
				<div class="preview-header border-bottom">
					<span class="eyebrow">Live Preview</span>
				</div>
				<div class="preview-area">
					{@render previewFrame()}
				</div>
			</main>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		background: rgba(0, 0, 0, 0.72);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	.modal {
		display: flex;
		flex-direction: row;
		width: min(1060px, 96vw);
		max-height: 88vh;
		border-radius: 20px;
		overflow: hidden;
		background: var(--overlay);
		border: 1px solid color-mix(in srgb, var(--subtle) 18%, transparent);
		box-shadow:
			0 48px 96px -24px rgba(0, 0, 0, 0.75),
			0 0 0 1px rgba(255, 255, 255, 0.04) inset;
	}

	.modal--mobile {
		flex-direction: column;
		height: 92dvh;
		max-height: 92dvh;
	}

	.border-bottom {
		border-bottom: 1px solid color-mix(in srgb, var(--highlight-med) 35%, transparent);
	}

	.border-top {
		border-top: 1px solid color-mix(in srgb, var(--highlight-med) 35%, transparent);
	}

	.panel-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		flex-shrink: 0;
		background: color-mix(in srgb, var(--base) 40%, transparent);
	}

	.eyebrow {
		font-size: 10px;
		font-family: "DM Mono", monospace;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--subtle);
	}

	.section-label {
		font-size: 9px;
		font-family: "DM Mono", monospace;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--muted);
		margin: 0 0 8px;
	}

	.dim-label {
		font-size: 9px;
		font-family: "DM Mono", monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--muted);
	}

	.fmt-strip {
		display: flex;
		gap: 6px;
		padding: 10px 12px;
		overflow-x: auto;
		flex-shrink: 0;
		scrollbar-width: none;
		background: color-mix(in srgb, var(--base) 40%, transparent);
	}

	.fmt-btn {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		padding: 7px 12px;
		border-radius: 10px;
		cursor: pointer;
		font-family: "DM Mono", monospace;
		font-size: 11px;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 0.13s ease;
		border: 1px solid color-mix(in srgb, var(--highlight-med) 50%, transparent);
		background: transparent;
		color: var(--subtle);
	}

	.fmt-btn--full {
		width: 100%;
		white-space: normal;
		padding: 9px 12px;
	}

	.fmt-btn--active {
		border-color: color-mix(in srgb, var(--iris) 50%, transparent);
		background: color-mix(in srgb, var(--iris) 10%, transparent);
		color: var(--iris);
	}

	.fmt-sub {
		font-size: 9px;
		color: var(--muted);
		letter-spacing: 0.05em;
	}

	.fmt-btn--active .fmt-sub {
		color: color-mix(in srgb, var(--iris) 65%, transparent);
	}

	.dl-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 11px;
		border-radius: 50px;
		border: none;
		cursor: pointer;
		font-family: "DM Mono", monospace;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: all 0.15s ease;
		background: color-mix(in srgb, var(--iris) 85%, transparent);
		color: var(--base);
	}

	.dl-btn--busy {
		background: color-mix(in srgb, var(--highlight-med) 60%, transparent);
		color: var(--muted);
		opacity: 0.7;
		cursor: not-allowed;
	}

	.preview-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 24px;
		min-height: 0;
		background: repeating-linear-gradient(
			45deg,
			color-mix(in srgb, var(--highlight-low) 30%, transparent) 0px,
			color-mix(in srgb, var(--highlight-low) 30%, transparent) 1px,
			transparent 1px,
			transparent 12px
		);
	}

	.preview-frame {
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
		border-radius: 6px;
		box-shadow:
			0 20px 60px -10px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.06) inset;
	}

	.sidebar {
		width: 256px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		padding: 20px;
		border-right: 1px solid color-mix(in srgb, var(--highlight-med) 40%, transparent);
		background: color-mix(in srgb, var(--base) 40%, transparent);
	}

	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 16px;
	}

	.preview-header {
		padding: 12px 20px;
		flex-shrink: 0;
	}
</style>
