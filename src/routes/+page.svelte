<script lang="ts">
	import { page } from "$app/stores"
	import { goto } from "$app/navigation"
	import { useSearch } from "$lib/features/search/useSearch.svelte"
	import SearchBar from "$lib/features/search/SearchBar.svelte"
	import EmptyState from "$lib/features/search/EmptyState.svelte"
	import DashboardWidget from "$lib/widgets/dashboard/DashboardWidget.svelte"
	import DashboardSkeleton from "$lib/shared/ui/skeleton/DashboardSkeleton.svelte"
	import ThemeCustomizer from "$lib/features/theme/ThemeCustomizer.svelte"
	import WallpaperExporter from "$lib/features/exporter/WallpaperExporter.svelte"

	const search = useSearch()
	let showExporter = $state(false)
	let urlUsername = $derived($page.url.searchParams.get("username"))

	$effect(() => {
		const shouldTriggerSearch =
			urlUsername && urlUsername !== search.currentUsername && !search.loading
		if (shouldTriggerSearch) {
			search.onSearch(urlUsername)
		}
	})

	function handleSearchSubmit(username: string) {
		const searchParams = new URLSearchParams()
		searchParams.set("username", username)
		goto(`/?${searchParams.toString()}`, { keepFocus: true, noScroll: true })
		search.onSearch(username)
	}
</script>

<svelte:head>
	{#if urlUsername}
		<title>{urlUsername}'s GitHub Stats | GitPeek</title>
		<meta property="og:title" content="{urlUsername}'s GitHub Stats | GitPeek" />
		<meta
			property="og:description"
			content="Peek at {urlUsername}'s GitHub profile stats, languages, and top repositories."
		/>
		<meta property="og:image" content="{$page.url.origin}/og?username={urlUsername}&v=1" />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content="{urlUsername}'s GitHub Stats | GitPeek" />
		<meta name="twitter:image" content="{$page.url.origin}/og?username={urlUsername}&v=1" />
	{:else}
		<title>GitPeek — Peek at any GitHub profile, beautifully</title>
		<meta property="og:title" content="GitPeek — Peek at any GitHub profile, beautifully" />
		<meta property="og:image" content="{$page.url.origin}/favicon.svg" />
	{/if}
</svelte:head>

<div class="aurora-bg" aria-hidden="true"></div>

<div class="fixed top-4 right-4 z-50">
	<ThemeCustomizer />
</div>

<main class="main-layout">
	<header class="page-header">
		<span class="eyebrow" aria-label="GitHub Stats"> github stats </span>
		<h1 class="page-title">
			<span class="gradient-text">GitPeek</span>
		</h1>
		<p class="tagline">peek at any github profile — beautifully</p>
	</header>

	<div class="search-section">
		<SearchBar onSearch={handleSearchSubmit} />
	</div>

	{#if search.loading}
		<DashboardSkeleton />
	{/if}

	{#if search.stats}
		<DashboardWidget
			stats={search.stats}
			username={search.currentUsername}
			onExport={() => (showExporter = true)}
		/>
	{/if}

	{#if search.noResults}
		<EmptyState username={search.currentUsername} />
	{/if}
</main>

{#if showExporter && search.stats}
	<WallpaperExporter
		stats={search.stats}
		login={search.currentUsername}
		onClose={() => (showExporter = false)}
	/>
{/if}

<style>
	.main-layout {
		display: flex;
		min-height: 100vh;
		width: 100%;
		max-width: 100vw;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		overflow-x: hidden;
		padding: 2.5rem 1rem;
	}

	@media (min-width: 640px) {
		.main-layout {
			padding: 4rem 1.5rem;
			gap: 2.5rem;
		}
	}

	@media (min-width: 768px) {
		.main-layout {
			padding: 5rem 1.5rem;
			gap: 3rem;
		}
	}

	.page-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0.5rem;
		text-align: center;
		animation: fade-in-up 0.5s ease-out;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--subtle);
	}

	.page-title {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	@media (min-width: 640px) {
		.page-title {
			font-size: 3rem;
		}
	}

	@media (min-width: 768px) {
		.page-title {
			font-size: 4.5rem;
		}
	}

	.tagline {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		color: var(--subtle);
		margin-top: 0.25rem;
	}

	.search-section {
		display: flex;
		width: 100%;
		justify-content: center;
		padding: 0 0.5rem;
		animation: fade-in-up 0.5s ease-out 80ms backwards;
	}
</style>
