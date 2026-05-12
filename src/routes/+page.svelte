<script lang="ts">
  import { page }             from "$app/stores"
  import { useSearch }        from "$lib/features/search/useSearch.svelte"
  import SearchBar            from "$lib/features/search/SearchBar.svelte"
  import EmptyState           from "$lib/features/search/EmptyState.svelte"
  import ProfileCard          from "$lib/features/profile/ProfileCard.svelte"
  import StatGrid             from "$lib/features/stats/StatGrid.svelte"
  import LanguagePie          from "$lib/features/charts/LanguagePie.svelte"
  import MostStarredRepo      from "$lib/features/repos/MostStarredRepo.svelte"
  import DashboardSkeleton    from "$lib/features/skeleton/DashboardSkeleton.svelte"
  import ThemeCustomizer      from "$lib/components/ThemeCustomizer.svelte"
  import WallpaperExporter    from "$lib/features/exporter/WallpaperExporter.svelte"
  import { Download }         from "lucide-svelte"

  const search = useSearch()
  let showExporter = $state(false)

  // 1. Grab username from URL (if any)
  let urlUsername = $derived($page.url.searchParams.get('username'));

  // 2. Auto-trigger search if there's a username in the URL
  $effect(() => {
    if (urlUsername && !search.searched && !search.loading) {
      search.onSearch(urlUsername);
    }
  });
</script>

<svelte:head>
  {#if urlUsername}
    <title>{urlUsername}'s GitHub Stats | GitPeek</title>
    <meta property="og:title" content="{urlUsername}'s GitHub Stats | GitPeek" />
    <meta property="og:description" content="Peek at {urlUsername}'s GitHub profile stats, languages, and top repositories." />
    <meta property="og:image" content="{$page.url.origin}/og?username={urlUsername}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{urlUsername}'s GitHub Stats | GitPeek" />
    <meta name="twitter:image" content="{$page.url.origin}/og?username={urlUsername}" />
  {:else}
    <title>GitPeek — Peek at any GitHub profile, beautifully</title>
    <meta property="og:title" content="GitPeek — Peek at any GitHub profile, beautifully" />
    <meta property="og:image" content="{$page.url.origin}/favicon.svg" />
  {/if}
</svelte:head>

<div class="aurora-bg" aria-hidden="true"></div>

<!-- Theme picker -->
<div class="fixed top-4 right-4 z-50">
  <ThemeCustomizer />
</div>

<main class="
  min-h-screen flex flex-col items-center
  px-4 sm:px-6 py-10 sm:py-16 md:py-20
  gap-8 sm:gap-10 md:gap-12
  touch-pan-y w-full max-w-[100vw] overflow-x-hidden
">
  <header class="flex flex-col items-center gap-2 sm:gap-3 fade-in-up text-center px-2">
    <span class="
      text-[11px] sm:text-xs font-mono tracking-[0.2em]
      sm:tracking-[0.25em] uppercase text-subtle"
      aria-label="GitHub Stats"
    >
      github stats
    </span>
    <h1 class="text-4xl sm:text-5xl md:text-7xl tracking-tight leading-none font-serif">
      <span class="gradient-text">GitPeek</span>
    </h1>
    <p class="text-xs sm:text-sm font-mono mt-1 tracking-wide text-subtle">
      peek at any github profile — beautifully
    </p>
  </header>

  <div class="fade-in-up w-full flex justify-center px-2" style="animation-delay:80ms">
    <SearchBar onSearch={search.onSearch} />
  </div>

  {#if search.loading}
    <DashboardSkeleton />
  {/if}

  {#if search.stats}
    <div class="dashboard-bar fade-in-up" style="animation-delay:60ms">
      <button
        onclick={() => showExporter = true}
        class="flex items-center gap-2 px-3 py-2 rounded-xl glass font-mono text-xs tracking-wide uppercase transition-all duration-200 border"
        style="color: var(--subtle); border-color: color-mix(in srgb, var(--highlight-med) 50%, transparent);"
        aria-label="Export wallpaper"
      >
        <Download size={13} />
        <span>Wallpaper</span>
      </button>
    </div>

    <div class="dashboard">
      <div class="col fade-in-up">
        <ProfileCard stats={search.stats} login={search.currentUsername} />
        <StatGrid stats={search.stats} />
      </div>
      <div class="col fade-in-up" style="animation-delay:80ms">
        {#if search.stats.languages?.length}
          <LanguagePie
            languages={search.stats.languages}
            avatarUrl={search.stats.avatarUrl}
          />
        {/if}
        {#if search.stats.mostStarredRepo}
          <MostStarredRepo repo={search.stats.mostStarredRepo} />
        {/if}
      </div>
    </div>
  {/if}

  {#if search.noResults}
    <EmptyState username={search.currentUsername} />
  {/if}
</main>

{#if showExporter && search.stats}
  <WallpaperExporter
    stats={search.stats}
    login={search.currentUsername}
    onClose={() => showExporter = false}
  />
{/if}

<style>
  .dashboard-bar {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
  }
  .dashboard {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    touch-action: pan-y pinch-zoom;
  }
  @media (min-width: 860px) {
    .dashboard { grid-template-columns: 1.05fr 1fr; align-items: start; }
  }
  .col { display: flex; flex-direction: column; gap: 14px; touch-action: pan-y; }
  @media (max-width: 640px) {
    .dashboard { gap: 12px; }
    .col { gap: 12px; }
  }
</style>
