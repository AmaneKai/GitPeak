<script lang="ts">
	import { onMount } from "svelte"
	import {
		TOKEN_LABELS,
		PRESET_THEMES,
		getTokens,
		applyTokens,
		applyPreset as applyPresetTheme,
		getSavedPresetName,
		parseThemeFromCSS,
		type ThemeTokens,
	} from "$lib/shared/utils/theme"
	import { Palette, RotateCcw, ChevronDown } from "lucide-svelte"

	let open = $state(false)
	let tokens = $state<ThemeTokens>({ ...PRESET_THEMES["Rosé Pine"] })
	let activePreset = $state<string | null>(null)
	let activeKey = $state<string | null>(null)

	const tokenKeys = Object.keys(TOKEN_LABELS)

	onMount(async () => {
		tokens = { ...getTokens() }
		activePreset = getSavedPresetName() ?? "Rosé Pine"
		await import("vanilla-colorful/hex-color-picker.js")
	})

	function update(key: string, val: string) {
		tokens = { ...tokens, [key]: val }
		activePreset = null
		applyTokens(tokens)
	}

	function applyPreset(name: string) {
		activePreset = name
		tokens = { ...PRESET_THEMES[name] }
		applyPresetTheme(name)
	}

	function reset() {
		applyPreset("Rosé Pine")
	}

	function importCSS(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = () => {
			const css = reader.result as string
			const parsed = parseThemeFromCSS(css)
			if (Object.keys(parsed).length === 0) {
				alert("No theme tokens found in CSS file.")
				return
			}
			tokens = { ...PRESET_THEMES["Rosé Pine"], ...parsed } as ThemeTokens
			activePreset = null
			applyTokens(tokens)
		}
		reader.readAsText(file)
	}

	function exportCSS() {
		const lines = [
			"/* GitPeek Custom Theme */",
			"/* Import this file in the theme customizer */",
			"",
			":root {",
			...Object.entries(tokens).map(([key, val]) => `  --${key}: ${val};`),
			"}",
		]
		const blob = new Blob([lines.join("\n")], { type: "text/css" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "gitpeek-theme.css"
		a.click()
		URL.revokeObjectURL(url)
	}

	function onPickerChange(e: Event, key: string) {
		const val = (e as CustomEvent).detail.value
		if (val) update(key, val)
	}
</script>

<!-- Toggle button -->
<button
	onclick={() => (open = !open)}
	class="glass flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs tracking-wide uppercase transition-all duration-200"
	style="color: var(--subtle); border-color: color-mix(in srgb, var(--highlight-med) 50%, transparent);"
	aria-label="Customize theme"
>
	<Palette size={14} />
	<span class="hidden sm:inline">theme</span>
	<ChevronDown size={12} class="transition-transform duration-200 {open ? 'rotate-180' : ''}" />
</button>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40"
		role="button"
		tabindex="-1"
		onclick={() => {
			open = false
			activeKey = null
		}}
		onkeydown={() => {}}
		aria-label="Close theme panel"
	></div>

	<!-- Panel -->
	<div
		class="fixed top-16 right-2 left-2 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl sm:right-4 sm:left-auto sm:w-[320px]"
		style="background: var(--overlay); border: 1px solid color-mix(in srgb, var(--subtle) 20%, transparent); box-shadow: 0 32px 64px -16px rgba(0,0,0,0.6);"
	>
		<!-- Header -->
		<div
			class="flex items-center justify-between px-4 py-3"
			style="border-bottom: 1px solid color-mix(in srgb, var(--highlight-med) 30%, transparent)"
		>
			<span class="font-mono text-xs tracking-widest uppercase" style="color: var(--subtle)"
				>Customize</span
			>
			<button
				onclick={reset}
				class="flex items-center gap-1 font-mono text-xs transition-colors"
				style="color: var(--muted)"
			>
				<RotateCcw size={11} />
				reset
			</button>
		</div>

		<div class="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
			<!-- Presets -->
			<div>
				<p class="mb-2 font-mono text-[10px] tracking-widest uppercase" style="color: var(--muted)">
					Presets
				</p>
				<div class="flex flex-wrap gap-1.5">
					{#each Object.keys(PRESET_THEMES) as name}
						<button
							onclick={() => applyPreset(name)}
							class="rounded-lg border px-2.5 py-1 font-mono text-[10px] transition-all duration-150"
							style="
                border-color: {activePreset === name
								? 'color-mix(in srgb, var(--iris) 60%, transparent)'
								: 'color-mix(in srgb, var(--highlight-med) 50%, transparent)'};
                color: {activePreset === name ? 'var(--iris)' : 'var(--subtle)'};
                background: {activePreset === name
								? 'color-mix(in srgb, var(--iris) 10%, transparent)'
								: 'transparent'};
              "
						>
							{name}
						</button>
					{/each}

					<!-- Import CSS -->
					<label
						class="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all duration-150"
						style="border: 1px dashed color-mix(in srgb, var(--highlight-med) 50%, transparent); color: var(--muted);"
					>
						+ import CSS
						<input type="file" accept=".css" class="hidden" onchange={importCSS} />
					</label>

					<!-- Export CSS -->
					<button
						onclick={exportCSS}
						class="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-[10px] transition-all duration-150"
						style="border: 1px dashed color-mix(in srgb, var(--highlight-med) 50%, transparent); color: var(--muted);"
					>
						↓ export CSS
					</button>
				</div>
			</div>

			<!-- Color tokens -->
			<div>
				<p class="mb-2 font-mono text-[10px] tracking-widest uppercase" style="color: var(--muted)">
					Colors
				</p>
				<div class="grid grid-cols-1 gap-1">
					{#each tokenKeys as key}
						<div class="flex flex-col">
							<div class="flex items-center justify-between gap-3 py-1">
								<span class="font-mono text-xs" style="color: var(--subtle)">
									{TOKEN_LABELS[key]}
								</span>
								<div class="flex shrink-0 items-center gap-2">
									<!-- Hex input -->
									<input
										type="text"
										value={tokens[key]}
										onchange={(e) => {
											const val = (e.target as HTMLInputElement).value.trim()
											if (/^#[0-9a-fA-F]{6}$/.test(val)) update(key, val)
										}}
										class="w-20 rounded-lg px-2 py-1 text-right font-mono text-[10px] transition-all outline-none"
										style="background: color-mix(in srgb, var(--overlay) 80%, transparent);
                           border: 1px solid color-mix(in srgb, var(--highlight-med) 50%, transparent);
                           color: var(--subtle);"
										spellcheck="false"
										maxlength="7"
									/>
									<!-- Swatch -->
									<button
										aria-label="Pick color for {TOKEN_LABELS[key]}"
										onclick={() => (activeKey = activeKey === key ? null : key)}
										class="h-7 w-7 shrink-0 rounded-lg transition-all"
										style="background: {tokens[key]};
                           border: 1px solid color-mix(in srgb, var(--highlight-high) 50%, transparent);
                           box-shadow: {activeKey === key
											? `0 0 0 2px var(--iris)`
											: `0 0 0 2px color-mix(in srgb, ${tokens[key]} 30%, transparent)`};"
									></button>
								</div>
							</div>

							<!-- Inline color picker -->
							{#if activeKey === key}
								<div class="pt-1 pb-2">
									<hex-color-picker
										color={tokens[key]}
										oncolor-changed={(e: Event) => onPickerChange(e, key)}
										style="width: 100%; height: 160px;"
									></hex-color-picker>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	hex-color-picker {
		--cp-border-radius: 10px;
	}
</style>
