<script lang="ts">
	import ProfileCard from "$lib/entities/github/ui/ProfileCard.svelte"
	import StatGrid from "$lib/entities/github/ui/StatGrid.svelte"
	import LanguagePie from "$lib/entities/github/ui/LanguagePie.svelte"
	import MostStarredRepo from "$lib/entities/github/ui/MostStarredRepo.svelte"
	import { Download } from "lucide-svelte"
	import type { GithubStats } from "$lib/entities/github/model/github-stats"

	let {
		stats,
		username,
		onExport,
	}: {
		stats: GithubStats
		username: string
		onExport: () => void
	} = $props()
</script>

<div class="dashboard-container">
	<div class="action-bar fade-in-up">
		<button onclick={onExport} class="export-button" aria-label="Export wallpaper">
			<Download size={13} />
			<span>Wallpaper</span>
		</button>
	</div>

	<div class="dashboard-grid">
		<div class="dashboard-column fade-in-up">
			<ProfileCard {stats} login={username} />
			<StatGrid {stats} />
		</div>

		<div class="dashboard-column fade-in-up secondary-column">
			{#if stats.languages?.length}
				<LanguagePie languages={stats.languages} avatarUrl={stats.avatarUrl} />
			{/if}

			{#if stats.mostStarredRepo}
				<MostStarredRepo repo={stats.mostStarredRepo} />
			{/if}
		</div>
	</div>
</div>

<style>
	.dashboard-container {
		width: 100%;
		max-width: 1100px;
		margin: 0 auto;
	}

	.action-bar {
		display: flex;
		justify-content: flex-end;
		width: 100%;
		margin-bottom: 1rem;
		animation-delay: 60ms;
	}

	.export-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: all 0.2s;
		border: 1px solid color-mix(in srgb, var(--highlight-med) 50%, transparent);
		background: var(--glass-bg);
		backdrop-filter: blur(8px);
		color: var(--subtle);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		touch-action: pan-y pinch-zoom;
	}

	.dashboard-column {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		touch-action: pan-y;
	}

	.secondary-column {
		animation-delay: 80ms;
	}

	@media (min-width: 860px) {
		.dashboard-grid {
			grid-template-columns: 1.05fr 1fr;
			align-items: start;
		}
	}

	@media (max-width: 640px) {
		.dashboard-grid {
			gap: 0.75rem;
		}
		.dashboard-column {
			gap: 0.75rem;
		}
	}
</style>
