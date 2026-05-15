<script lang="ts">
	import "../app.css"
	import { Toaster } from "svelte-sonner"
	import { onMount } from "svelte"
	import { initTheme } from "$lib/shared/utils/theme"

	let { children } = $props()

	onMount(() => initTheme())
</script>

<Toaster
	position="bottom-right"
	toastOptions={{
		style:
			"background: #26233a; border: 1px solid rgba(144,140,170,0.25); color: #e0def4; font-family: 'DM Mono', monospace; font-size: 13px; border-radius: 14px;",
	}}
/>

{@render children()}
