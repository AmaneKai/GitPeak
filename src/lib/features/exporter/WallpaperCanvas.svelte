<script lang="ts">
	import type { GithubStats } from "$lib/entities/github/model/github-stats"
	import { formatNumber, accountAge } from "$lib/shared/utils/format"
	import { buildSlices } from "$lib/entities/github/ui/useLanguagePie.svelte"
	import { Users, Calendar } from "lucide-svelte"
	import DonutChart from "./DonutChart.svelte"

	let {
		stats,
		login,
		width,
		height,
		avatarSrc,
	}: {
		stats: GithubStats
		login: string
		width: number
		height: number
		avatarSrc?: string
	} = $props()

	const imgSrc = $derived(avatarSrc ?? stats.avatarUrl ?? "")
	const displayName = $derived(stats.displayName || login)
	const isLandscape = $derived(width >= height)
	const u = $derived(width / 100)

	const statItems = $derived([
		{ label: "Contributions", value: stats.totalContributions, accent: "var(--foam)" },
		{ label: "Commits", value: stats.totalCommits, accent: "var(--iris)" },
		{ label: "Stars", value: stats.totalStars, accent: "var(--gold)" },
		{ label: "Repos", value: stats.totalRepos, accent: "var(--pine)" },
		{ label: "Followers", value: stats.followers, accent: "var(--rose)" },
		{ label: "Pull Requests", value: stats.totalPrs, accent: "var(--love)" },
	])

	const langs = $derived(stats.languages ?? [])
	const slices = $derived(buildSlices(langs))
	const donutSize = $derived(isLandscape ? u * 18 : u * 26)
	const donutRO = $derived(donutSize * 0.46)
	const donutRI = $derived(donutSize * 0.29)
</script>

{#snippet statGrid(portrait = false)}
	<div class="stat-grid" class:pt-stat-grid={portrait}>
		{#each statItems as item}
			<div
				class="stat-card"
				class:pt-stat-card={portrait}
				style="
          --accent:{item.accent}; 
          border-top-width:calc(var(--u) * 0.35);
        "
			>
				<span class="stat-label" class:pt-stat-label={portrait}>{item.label}</span>
				<span class="stat-value" class:pt-stat-value={portrait} style="color:{item.accent};">
					{formatNumber(item.value)}
				</span>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet langLegend(portrait = false)}
	<div class="lang-legend" class:ls-legend={!portrait} class:pt-legend={portrait}>
		{#each slices as s}
			<div class="lang-row">
				<div
					class="lang-dot"
					class:pt-lang-dot={portrait}
					style="
            background:{s.color}; 
            box-shadow:0 0 calc(var(--u)*{portrait ? 0.8 : 0.6}) {s.color};
          "
				></div>
				<span class="lang-name" class:pt-lang-name={portrait}>{s.name}</span>
				<span class="lang-pct" class:pt-lang-pct={portrait} style="color:{s.color};">
					{s.percentage}%
				</span>
			</div>
		{/each}
	</div>
{/snippet}

<div class="canvas-root" style="width:{width}px; height:{height}px; --u:{u}px;">
	<div class="aurora" aria-hidden="true"></div>

	{#if isLandscape}
		<div class="ls-grid">
			<aside class="ls-profile">
				<img class="avatar" src={imgSrc} crossorigin="anonymous" alt="" />

				<div class="name-block">
					<h2 class="display-name">{displayName}</h2>
					<span class="handle">@{login}</span>
				</div>

				{#if stats.bio}
					<p class="bio">{stats.bio}</p>
				{/if}

				<div class="divider"></div>

				<div class="follow-row">
					{#each [
          { label: "Followers", value: stats.followers, icon: true }, 
          { label: "Following", value: stats.following, icon: false }] as f}
						<div class="follow-item">
							<div class="follow-label">
								{#if f.icon}<Users size={u * 1.1} />{/if}
								<span>{f.label}</span>
							</div>
							<span class="follow-value">{formatNumber(f.value)}</span>
						</div>
					{/each}
				</div>

				<div class="account-age">
					<Calendar size={u * 1.3} />
					<span>{accountAge(stats.accountCreatedAt)} on GitHub</span>
				</div>

				<div style="flex:1"></div>

				<div class="branding">
					<span class="brand-name">GitPeek</span>
					<span class="brand-url">github.com/{login}</span>
				</div>
			</aside>

			<section class="ls-right">
				{@render statGrid()}

				{#if slices.length}
					<div class="lang-panel">
						<DonutChart size={donutSize} ro={donutRO} ri={donutRI} {slices} {u} />
						{@render langLegend()}

						{#if stats.mostStarredRepo}
							{@const repo = stats.mostStarredRepo}
							<div class="top-repo-aside">
								<p class="eyebrow">Top Repo</p>
								<h3 class="repo-name">{repo.name}</h3>
								<span class="repo-stars">★ {formatNumber(repo.stars)}</span>
							</div>
						{/if}
					</div>
				{/if}
			</section>
		</div>
	{:else}
		<div class="pt-layout">
			<div class="pt-logo">
				<span class="brand-name">GitPeek</span>
			</div>

			<div class="pt-profile-card">
				<img class="avatar pt-avatar" src={imgSrc} crossorigin="anonymous" alt="" />
				<div style="min-width:0; overflow:hidden;">
					<h2 class="pt-display-name">{displayName}</h2>
					<p class="pt-handle">@{login}</p>
					{#if stats.bio}
						<p class="pt-bio">{stats.bio}</p>
					{/if}
					<p class="pt-follow-line">
						<span class="pt-follow-num">{formatNumber(stats.followers)}</span> followers
						&nbsp;·&nbsp;
						<span class="pt-follow-num">{formatNumber(stats.following)}</span> following
					</p>
				</div>
			</div>

			{@render statGrid(true)}

			{#if slices.length}
				<div class="lang-panel pt-lang-panel">
					<DonutChart size={donutSize} ro={donutRO} ri={donutRI} {slices} {u} variant="portrait" />
					{@render langLegend(true)}
				</div>
			{/if}

			{#if stats.mostStarredRepo}
				{@const repo = stats.mostStarredRepo}
				<div class="pt-top-repo">
					<div style="min-width:0; overflow:hidden;">
						<p class="eyebrow">Top Repository</p>
						<h3 class="repo-name pt-repo-name">{repo.name}</h3>
					</div>
					<span class="pt-repo-stars">★ {formatNumber(repo.stars)}</span>
				</div>
			{/if}

			<footer class="pt-footer">
				<span class="brand-url">github.com/{login}</span>
			</footer>
		</div>
	{/if}
</div>

<style>
	.canvas-root {
		position: relative;
		overflow: hidden;
		background: var(--base);
		color: var(--text);
		font-family: "DM Mono", "JetBrains Mono", monospace;
		box-sizing: border-box;
	}

	.aurora {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(
				ellipse 85% 75% at -5% -10%,
				color-mix(in srgb, var(--iris) 20%, transparent),
				transparent 52%
			),
			radial-gradient(
				ellipse 65% 55% at 108% 108%,
				color-mix(in srgb, var(--foam) 16%, transparent),
				transparent 52%
			),
			radial-gradient(
				ellipse 50% 45% at 60% -5%,
				color-mix(in srgb, var(--love) 8%, transparent),
				transparent 62%
			);
	}

	.ls-grid {
		position: relative;
		z-index: 1;
		height: 100%;
		display: grid;
		grid-template-columns: calc(var(--u) * 30) 1fr;
		padding: calc(var(--u) * 5);
		box-sizing: border-box;
	}

	.ls-profile {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 2.2);
		justify-content: center;
		padding-right: calc(var(--u) * 4.5);
		border-right: 1px solid color-mix(in srgb, var(--iris) 15%, transparent);
		overflow: hidden;
	}

	.ls-right {
		padding-left: calc(var(--u) * 4.5);
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 2.2);
		justify-content: center;
	}

	.avatar {
		width: calc(var(--u) * 12);
		height: calc(var(--u) * 12);
		border-radius: calc(var(--u) * 2);
		object-fit: cover;
		border: calc(var(--u) * 0.15) solid color-mix(in srgb, var(--iris) 40%, transparent);
		box-shadow: 0 calc(var(--u) * 1.5) calc(var(--u) * 5) rgba(0, 0, 0, 0.55);
	}

	.name-block {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 0.6);
	}

	.display-name {
		font-size: calc(var(--u) * 2.2);
		font-family: "Instrument Serif", serif;
		font-weight: 600;
		line-height: 1.15;
		margin: 0;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.handle {
		font-size: calc(var(--u) * 1.15);
		color: var(--subtle);
		letter-spacing: 0.04em;
	}

	.bio {
		font-size: calc(var(--u) * 1.05);
		color: var(--subtle);
		line-height: 1.65;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.divider {
		height: 1px;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--iris) 30%, transparent),
			transparent
		);
	}

	.follow-row {
		display: flex;
		gap: calc(var(--u) * 3.5);
	}

	.follow-item {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 0.4);
	}

	.follow-label {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 0.5);
		color: var(--subtle);
		font-size: calc(var(--u) * 0.75);
		text-transform: uppercase;
		letter-spacing: 0.14em;
	}

	.follow-value {
		font-size: calc(var(--u) * 2.2);
		font-family: "Instrument Serif", serif;
		font-weight: 700;
		line-height: 1;
		color: var(--text);
	}

	.account-age {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 0.8);
		color: var(--subtle);
		font-size: calc(var(--u) * 1.15);
	}

	.branding {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1);
	}

	.brand-name {
		font-size: calc(var(--u) * 1.7);
		font-family: "Instrument Serif", serif;
		background: linear-gradient(135deg, var(--iris) 0%, var(--foam) 50%, var(--rose) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.brand-url {
		font-size: calc(var(--u) * 0.72);
		color: var(--muted);
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: calc(var(--u) * 1.5);
	}

	.stat-card {
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
		border-top-color: var(--accent);
		border-radius: calc(var(--u) * 1.3);
		padding: calc(var(--u) * 1.6) calc(var(--u) * 1.8);
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 0.6);
		box-shadow:
			0 calc(var(--u) * 0.5) calc(var(--u) * 2) rgba(0, 0, 0, 0.4),
			0 0 calc(var(--u) * 4) color-mix(in srgb, var(--accent) 7%, transparent);
	}

	.stat-label {
		font-size: calc(var(--u) * 0.68);
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--subtle);
	}

	.stat-value {
		font-size: calc(var(--u) * 2.5);
		font-family: "Instrument Serif", serif;
		font-weight: 700;
		line-height: 1;
	}

	.lang-panel {
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--iris) 18%, transparent);
		border-top: calc(var(--u) * 0.35) solid color-mix(in srgb, var(--iris) 60%, transparent);
		border-radius: calc(var(--u) * 1.3);
		padding: calc(var(--u) * 1.8) calc(var(--u) * 2);
		box-shadow: 0 calc(var(--u) * 0.5) calc(var(--u) * 2.5) rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 2.5);
	}

	.ls-legend {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 0.6);
		min-width: 0;
	}

	.lang-row {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 0.8);
	}

	.lang-dot {
		width: calc(var(--u) * 0.6);
		height: calc(var(--u) * 0.6);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.lang-name {
		font-size: calc(var(--u) * 0.75);
		color: var(--text);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lang-pct {
		font-size: calc(var(--u) * 0.7);
		flex-shrink: 0;
		font-weight: 500;
	}

	.top-repo-aside {
		flex-shrink: 0;
		width: calc(var(--u) * 16);
		border-left: 1px solid color-mix(in srgb, var(--subtle) 12%, transparent);
		padding-left: calc(var(--u) * 2);
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 0.8);
		justify-content: center;
	}

	.eyebrow {
		font-size: calc(var(--u) * 0.68);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--muted);
		margin: 0;
	}

	.repo-name {
		font-size: calc(var(--u) * 1.2);
		font-family: "Instrument Serif", serif;
		color: var(--text);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.repo-stars {
		font-size: calc(var(--u) * 1.1);
		color: var(--gold);
	}

	.pt-layout {
		position: relative;
		z-index: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: calc(var(--u) * 6);
		gap: calc(var(--u) * 3);
		box-sizing: border-box;
		overflow: hidden;
	}

	.pt-logo {
		text-align: center;
		flex-shrink: 0;
	}

	.pt-logo .brand-name {
		font-size: calc(var(--u) * 5);
	}

	.pt-profile-card {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 4);
		flex-shrink: 0;
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--iris) 20%, transparent);
		border-top: calc(var(--u) * 0.35) solid color-mix(in srgb, var(--iris) 60%, transparent);
		border-radius: calc(var(--u) * 2.5);
		padding: calc(var(--u) * 3.5) calc(var(--u) * 4);
		box-shadow: 0 calc(var(--u) * 1) calc(var(--u) * 4) rgba(0, 0, 0, 0.4);
	}

	.pt-avatar {
		flex-shrink: 0;
		width: calc(var(--u) * 18);
		height: calc(var(--u) * 18);
		border-radius: calc(var(--u) * 2.5);
		border-width: calc(var(--u) * 0.18);
	}

	.pt-display-name {
		font-size: calc(var(--u) * 4.5);
		font-family: "Instrument Serif", serif;
		margin: 0 0 calc(var(--u) * 0.8);
		line-height: 1.1;
		color: var(--text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pt-handle {
		font-size: calc(var(--u) * 1.5);
		color: var(--subtle);
		margin: 0 0 calc(var(--u) * 1.2);
		letter-spacing: 0.05em;
	}

	.pt-bio {
		font-size: calc(var(--u) * 1.3);
		color: var(--muted);
		margin: 0 0 calc(var(--u) * 1);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.pt-follow-line {
		font-size: calc(var(--u) * 1.2);
		color: var(--subtle);
		margin: 0;
	}

	.pt-follow-num {
		color: var(--text);
	}

	.pt-stat-grid {
		gap: calc(var(--u) * 2.2);
		flex-shrink: 0;
	}

	.pt-stat-card {
		border-radius: calc(var(--u) * 2.2);
		padding: calc(var(--u) * 2.8) calc(var(--u) * 2.5);
		gap: calc(var(--u) * 1);
	}

	.pt-stat-label {
		font-size: calc(var(--u) * 1.05);
		letter-spacing: 0.14em;
	}

	.pt-stat-value {
		font-size: calc(var(--u) * 4);
	}

	.pt-lang-panel {
		border-radius: calc(var(--u) * 2.2);
		padding: calc(var(--u) * 3) calc(var(--u) * 3.5);
		gap: calc(var(--u) * 4);
	}

	.pt-legend {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: calc(var(--u) * 1.2) calc(var(--u) * 3);
	}

	.pt-lang-dot {
		width: calc(var(--u) * 1.1);
		height: calc(var(--u) * 1.1);
	}

	.pt-lang-name {
		font-size: calc(var(--u) * 1.15);
	}

	.pt-lang-pct {
		font-size: calc(var(--u) * 1.1);
	}

	.pt-top-repo {
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
		border-top: calc(var(--u) * 0.35) solid color-mix(in srgb, var(--gold) 60%, transparent);
		border-radius: calc(var(--u) * 2.2);
		padding: calc(var(--u) * 2.5) calc(var(--u) * 3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		box-shadow: 0 calc(var(--u) * 0.5) calc(var(--u) * 2.5) rgba(0, 0, 0, 0.4);
	}

	.pt-repo-name {
		font-size: calc(var(--u) * 2.8);
	}

	.pt-repo-stars {
		font-size: calc(var(--u) * 2.2);
		color: var(--gold);
		flex-shrink: 0;
		padding-left: calc(var(--u) * 2);
		font-family: "Instrument Serif", serif;
		font-weight: 700;
	}

	.pt-footer {
		margin-top: auto;
		text-align: center;
		flex-shrink: 0;
	}

	.pt-footer .brand-url {
		font-size: calc(var(--u) * 1.05);
	}
</style>
