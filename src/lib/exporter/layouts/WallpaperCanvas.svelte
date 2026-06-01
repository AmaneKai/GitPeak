<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'
  import { buildPieSlices as buildSlices } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte.ts'
  import { Users, Calendar } from 'lucide-svelte'
  import DotMatrixChart from '../components/DotMatrixChart.svelte'

  // WallpaperExporter passes `statistics` and `username`; keep old names as
  // fallback aliases so either caller convention works.
  let {
    stats,
    statistics,
    login,
    username,
    width,
    height,
    avatarSrc,
  }: {
    stats?: GithubStats
    statistics?: GithubStats
    login?: string
    username?: string
    width: number
    height: number
    avatarSrc?: string
  } = $props()

  // Resolve whichever prop name the parent used
  const resolvedStats = $derived((statistics ?? stats)!)
  const resolvedLogin = $derived(username ?? login ?? '')

  const imageSource = $derived(avatarSrc ?? resolvedStats.avatarUrl ?? '')
  const displayName = $derived(resolvedStats.displayName || resolvedLogin)
  const isLandscape = $derived(width >= height)
  const scaleUnit = $derived(width / 100)

  const statItems = $derived([
    { label: 'Contributions', value: resolvedStats.totalContributions, accent: 'var(--foam)' },
    { label: 'Commits', value: resolvedStats.totalCommits, accent: 'var(--iris)' },
    { label: 'Stars', value: resolvedStats.totalStars, accent: 'var(--gold)' },
    { label: 'Repos', value: resolvedStats.totalRepos, accent: 'var(--pine)' },
    { label: 'Followers', value: resolvedStats.followers, accent: 'var(--rose)' },
    { label: 'Pull Requests', value: resolvedStats.totalPrs, accent: 'var(--love)' },
  ])

  const languages = $derived(resolvedStats.languages ?? [])
  const allSlices = $derived(buildSlices(languages))
  const slices = $derived(allSlices.slice(0, 5))
</script>

{#snippet statGrid(portrait = false)}
  <div class="stat-grid" class:pt-stat-grid={portrait}>
    {#each statItems as item (item.label)}
      <div
        class="stat-card"
        class:pt-stat-card={portrait}
        style="--accent: {item.accent};"
      >
        <span class="stat-label" class:pt-stat-label={portrait}>{item.label}</span>
        <span class="stat-value" class:pt-stat-value={portrait} style="color: {item.accent};">
          {formatNumber(item.value)}
        </span>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet langLegend(portrait = false)}
  <div class="lang-legend" class:ls-legend={!portrait} class:pt-legend={portrait}>
    {#each slices as slice (slice.name)}
      <div class="lang-row">
        <div
          class="lang-dot"
          class:pt-lang-dot={portrait}
          style="
            background: {slice.color};
            box-shadow: 0 0 calc(var(--scale-unit) * {portrait ? 0.8 : 0.6}) {slice.color};
          "
        ></div>
        <span class="lang-name" class:pt-lang-name={portrait}>{slice.name}</span>
        <span class="lang-pct" class:pt-lang-pct={portrait} style="color: {slice.color};">
          {slice.percentage}%
        </span>
      </div>
    {/each}
  </div>
{/snippet}

<div class="canvas-root" style="width:{width}px; height:{height}px; --scale-unit:{scaleUnit}px;">
  <div class="aurora" aria-hidden="true"></div>

  {#if isLandscape}
    <div class="ls-grid">
      <aside class="ls-profile">
        <img class="avatar" src={imageSource} crossorigin="anonymous" alt="" />

        <div class="name-block">
          <h2 class="display-name">{displayName}</h2>
          <span class="handle">@{resolvedLogin}</span>
        </div>

        {#if resolvedStats.bio}
          <p class="bio">{resolvedStats.bio}</p>
        {/if}

        <div class="divider"></div>

        <div class="follow-row">
          {#each [{ label: 'Followers', value: resolvedStats.followers, icon: true }, { label: 'Following', value: resolvedStats.following, icon: false }] as followItem (followItem.label)}
            <div class="follow-item">
              <div class="follow-label">
                {#if followItem.icon}<Users size={scaleUnit * 1.1} />{/if}
                <span>{followItem.label}</span>
              </div>
              <span class="follow-value">{formatNumber(followItem.value)}</span>
            </div>
          {/each}
        </div>

        <div class="account-age">
          <Calendar size={scaleUnit * 1.3} />
          <span>{accountAge(resolvedStats.accountCreatedAt)} on GitHub</span>
        </div>

        <div style="flex: 1"></div>

        <div class="branding">
          <span class="brand-name">GitPeak</span>
          <span class="brand-url">github.com/{resolvedLogin}</span>
        </div>
      </aside>

      <section class="ls-right">
        {@render statGrid()}

        {#if slices.length}
          <div class="lang-panel">
            <div class="matrix-wrapper">
              <DotMatrixChart {slices} {scaleUnit} />
              <div class="matrix-label">
                <span class="matrix-tag">TOP {slices.length} LANGUAGES</span>
              </div>
            </div>

            <div class="ls-legend-list">
              {#each slices as slice (slice.name)}
                <div class="lang-row">
                  <div
                    class="lang-dot"
                    style="
                      background: {slice.color};
                      box-shadow: 0 0 calc(var(--scale-unit) * 0.6) {slice.color};
                    "
                  ></div>
                  <span class="lang-name">{slice.name}</span>
                  <span class="lang-pct" style="color:{slice.color};">{slice.percentage}%</span>
                </div>
              {/each}
            </div>
            {#if resolvedStats.mostStarredRepo}
              {@const repository = resolvedStats.mostStarredRepo}
              <div class="top-repo-aside">
                <p class="eyebrow">Top Repo</p>
                <h3 class="repo-name">{repository.name}</h3>
                <span class="repo-stars">
                  ★ {formatNumber(repository.stars)}
                </span>
              </div>
            {/if}
          </div>
        {/if}
      </section>
    </div>
  {:else}
    <div class="pt-layout">
      <div class="pt-logo">
        <span class="brand-name">GitPeak</span>
      </div>

      <div class="pt-profile-card">
        <img class="avatar pt-avatar" src={imageSource} crossorigin="anonymous" alt="" />
        <div style="min-width: 0; overflow: hidden;">
          <h2 class="pt-display-name">{displayName}</h2>
          <p class="pt-handle">@{resolvedLogin}</p>
          {#if resolvedStats.bio}
            <p class="pt-bio">{resolvedStats.bio}</p>
          {/if}
          <p class="pt-follow-line">
            <span class="pt-follow-num">{formatNumber(resolvedStats.followers)}</span> followers
            &nbsp;·&nbsp;
            <span class="pt-follow-num">{formatNumber(resolvedStats.following)}</span> following
          </p>
        </div>
      </div>

      {@render statGrid(true)}

      {#if slices.length}
        <div class="lang-panel pt-lang-panel">
          <div class="matrix-wrapper pt-matrix-wrapper">
            <DotMatrixChart {slices} {scaleUnit} />
            <div class="matrix-label">
              <span class="matrix-tag">TOP {slices.length} LANGUAGES</span>
            </div>
          </div>
          {@render langLegend(true)}
        </div>
      {/if}

      {#if resolvedStats.mostStarredRepo}
        {@const repository = resolvedStats.mostStarredRepo}
        <div class="pt-top-repo">
          <div style="min-width: 0; overflow: hidden;">
            <p class="eyebrow">Top Repository</p>
            <h3 class="repo-name pt-repo-name">{repository.name}</h3>
          </div>
          <span class="pt-repo-stars">★ {formatNumber(repository.stars)}</span>
        </div>
      {/if}

      <footer class="pt-footer">
        <span class="brand-url">github.com/{resolvedLogin}</span>
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
        ellipse 90% 80% at -10% -10%,
        color-mix(in srgb, var(--iris) 25%, transparent),
        transparent 65%
      ),
      radial-gradient(
        ellipse 70% 60% at 110% 110%,
        color-mix(in srgb, var(--foam) 20%, transparent),
        transparent 65%
      ),
      radial-gradient(
        ellipse 60% 55% at 65% -5%,
        color-mix(in srgb, var(--love) 10%, transparent),
        transparent 75%
      );
  }

  .ls-grid {
    position: relative;
    z-index: 2;
    height: 100%;
    display: grid;
    grid-template-columns: calc(var(--scale-unit) * 30) 1fr;
    align-items: stretch;
    padding: calc(var(--scale-unit) * 5);
    box-sizing: border-box;
    overflow: hidden;
  }

  .ls-profile {
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 2.2);
    justify-content: center;
    padding-right: calc(var(--scale-unit) * 4.5);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    min-height: 0;
    overflow: hidden;
  }

  .ls-right {
    padding-left: calc(var(--scale-unit) * 4.5);
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 2.2);
    justify-content: center;
    min-height: 0;
    overflow: hidden;
  }

  .avatar {
    width: calc(var(--scale-unit) * 12);
    height: calc(var(--scale-unit) * 12);
    border-radius: calc(var(--scale-unit) * 2.5);
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 calc(var(--scale-unit) * 2) calc(var(--scale-unit) * 6) rgba(0, 0, 0, 0.6);
  }

  .name-block {
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 0.6);
  }

  .display-name {
    font-size: calc(var(--scale-unit) * 2.6);
    font-family: "Instrument Serif", serif;
    font-weight: 500;
    line-height: 1;
    margin: 0;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .handle {
    font-size: calc(var(--scale-unit) * 1.15);
    color: var(--subtle);
    letter-spacing: 0.04em;
    opacity: 0.8;
  }

  .bio {
    font-size: calc(var(--scale-unit) * 1.05);
    color: var(--subtle);
    line-height: 1.65;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    opacity: 0.9;
  }

  .divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }

  .follow-row {
    display: flex;
    gap: calc(var(--scale-unit) * 3.5);
  }

  .follow-item {
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 0.4);
  }

  .follow-label {
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 0.5);
    color: var(--muted);
    font-size: calc(var(--scale-unit) * 0.72);
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .follow-value {
    font-size: calc(var(--scale-unit) * 2.2);
    font-family: "Instrument Serif", serif;
    font-weight: 500;
    line-height: 1;
    color: var(--text);
  }

  .account-age {
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 0.8);
    color: var(--muted);
    font-size: calc(var(--scale-unit) * 1.1);
  }

  .branding {
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 1);
  }

  .brand-name {
    font-size: calc(var(--scale-unit) * 1.8);
    font-family: "Instrument Serif", serif;
    font-style: italic;
    background: linear-gradient(135deg, var(--iris) 0%, var(--foam) 50%, var(--rose) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-url {
    font-size: calc(var(--scale-unit) * 0.75);
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--scale-unit) * 1.5);
  }

  .stat-card {
    background: rgba(31, 29, 46, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: calc(var(--scale-unit) * 1.5);
    padding: calc(var(--scale-unit) * 1.8) calc(var(--scale-unit) * 2);
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 0.6);
    box-shadow:
      0 calc(var(--scale-unit) * 1) calc(var(--scale-unit) * 3) rgba(0, 0, 0, 0.45);
  }

  .stat-label {
    font-size: calc(var(--scale-unit) * 0.68);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--muted);
    font-weight: 600;
  }

  .stat-value {
    font-size: calc(var(--scale-unit) * 2.8);
    font-family: "Instrument Serif", serif;
    font-weight: 500;
    line-height: 1;
  }

  .lang-panel {
    background: rgba(31, 29, 46, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: calc(var(--scale-unit) * 1.8);
    padding: calc(var(--scale-unit) * 2) calc(var(--scale-unit) * 2.5);
    box-shadow:
      0 calc(var(--scale-unit) * 1.5) calc(var(--scale-unit) * 4) rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 2.5);
    flex-shrink: 1;
    min-height: 0;
    overflow: hidden;
  }

  .matrix-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--scale-unit) * 1.2);
    padding: calc(var(--scale-unit) * 0.5);
  }

  .matrix-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: calc(var(--scale-unit) * 0.2);
  }

  .matrix-tag {
    font-size: calc(var(--scale-unit) * 0.6);
    letter-spacing: 0.15em;
    color: var(--muted);
    font-weight: 500;
  }

  .ls-legend-list {
    align-self: stretch;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: calc(var(--scale-unit) * 0.8);
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    padding: calc(var(--scale-unit) * 0.5) 0;
  }

  .lang-row {
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 1);
  }

  .lang-dot {
    width: calc(var(--scale-unit) * 0.7);
    height: calc(var(--scale-unit) * 0.7);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .lang-name {
    font-size: calc(var(--scale-unit) * 1);
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.9;
  }

  .lang-pct {
    font-size: calc(var(--scale-unit) * 0.9);
    flex-shrink: 0;
    font-weight: 600;
    font-family: "DM Mono", monospace;
    opacity: 0.7;
  }

  .top-repo-aside {
    flex-shrink: 0;
    width: calc(var(--scale-unit) * 18);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    padding-left: calc(var(--scale-unit) * 2.5);
    display: flex;
    flex-direction: column;
    gap: calc(var(--scale-unit) * 0.8);
    justify-content: center;
  }

  .eyebrow {
    font-size: calc(var(--scale-unit) * 0.68);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--muted);
    margin: 0;
    font-weight: 600;
  }

  .repo-name {
    font-size: calc(var(--scale-unit) * 1.3);
    font-family: "Instrument Serif", serif;
    color: var(--text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }

  .repo-stars {
    font-size: calc(var(--scale-unit) * 1.15);
    color: var(--gold);
    font-family: "DM Mono", monospace;
    font-weight: 500;
  }

  .pt-layout {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: calc(var(--scale-unit) * 6);
    gap: calc(var(--scale-unit) * 3);
    box-sizing: border-box;
    overflow: hidden;
  }

  .pt-logo {
    text-align: center;
    flex-shrink: 0;
  }

  .pt-logo .brand-name {
    font-size: calc(var(--scale-unit) * 5);
  }

  .pt-profile-card {
    display: flex;
    align-items: center;
    gap: calc(var(--scale-unit) * 4);
    flex-shrink: 0;
    background: rgba(31, 29, 46, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: calc(var(--scale-unit) * 3);
    padding: calc(var(--scale-unit) * 4) calc(var(--scale-unit) * 4.5);
    box-shadow: 0 calc(var(--scale-unit) * 2) calc(var(--scale-unit) * 6) rgba(0, 0, 0, 0.5);
  }

  .pt-avatar {
    flex-shrink: 0;
    width: calc(var(--scale-unit) * 18);
    height: calc(var(--scale-unit) * 18);
    border-radius: calc(var(--scale-unit) * 3);
    border-width: 1px;
    box-shadow: 0 calc(var(--scale-unit) * 2) calc(var(--scale-unit) * 4) rgba(0, 0, 0, 0.4);
  }

  .pt-display-name {
    font-size: calc(var(--scale-unit) * 5);
    font-family: "Instrument Serif", serif;
    margin: 0 0 calc(var(--scale-unit) * 0.8);
    line-height: 1;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .pt-handle {
    font-size: calc(var(--scale-unit) * 1.6);
    color: var(--subtle);
    margin: 0 0 calc(var(--scale-unit) * 1.5);
    letter-spacing: 0.05em;
    opacity: 0.8;
  }

  .pt-bio {
    font-size: calc(var(--scale-unit) * 1.35);
    color: var(--muted);
    margin: 0 0 calc(var(--scale-unit) * 1.2);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }

  .pt-follow-line {
    font-size: calc(var(--scale-unit) * 1.25);
    color: var(--muted);
    margin: 0;
  }

  .pt-follow-num {
    color: var(--text);
    font-weight: 600;
  }

  .pt-stat-grid {
    gap: calc(var(--scale-unit) * 2.2);
    flex-shrink: 0;
  }

  .pt-stat-card {
    border-radius: calc(var(--scale-unit) * 2.5);
    padding: calc(var(--scale-unit) * 3) calc(var(--scale-unit) * 3.5);
    gap: calc(var(--scale-unit) * 1.2);
  }

  .pt-stat-label {
    font-size: calc(var(--scale-unit) * 1.1);
    letter-spacing: 0.2em;
  }

  .pt-stat-value {
    font-size: calc(var(--scale-unit) * 4.5);
  }

  .pt-lang-panel {
    border-radius: calc(var(--scale-unit) * 2.5);
    padding: calc(var(--scale-unit) * 4) calc(var(--scale-unit) * 4.5);
    gap: calc(var(--scale-unit) * 4);
  }

  .pt-matrix-wrapper {
    gap: calc(var(--scale-unit) * 2);
  }

  .pt-legend {
    align-self: stretch;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: calc(var(--scale-unit) * 1.2);
    padding: calc(var(--scale-unit) * 1) 0;
  }

  .pt-lang-dot {
    width: calc(var(--scale-unit) * 1.2);
    height: calc(var(--scale-unit) * 1.2);
  }

  .pt-lang-name {
    font-size: calc(var(--scale-unit) * 1.25);
  }

  .pt-lang-pct {
    font-size: calc(var(--scale-unit) * 1.2);
  }

  .pt-top-repo {
    background: rgba(31, 29, 46, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: calc(var(--scale-unit) * 2.5);
    padding: calc(var(--scale-unit) * 3) calc(var(--scale-unit) * 4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    box-shadow: 0 calc(var(--scale-unit) * 1.5) calc(var(--scale-unit) * 4) rgba(0, 0, 0, 0.45);
  }

  .pt-repo-name {
    font-size: calc(var(--scale-unit) * 3);
  }

  .pt-repo-stars {
    font-size: calc(var(--scale-unit) * 2.4);
    color: var(--gold);
    flex-shrink: 0;
    padding-left: calc(var(--scale-unit) * 2);
    font-family: "Instrument Serif", serif;
    font-weight: 500;
  }

  .pt-footer {
    margin-top: auto;
    text-align: center;
    flex-shrink: 0;
  }

  .pt-footer .brand-url {
    font-size: calc(var(--scale-unit) * 1.15);
  }
</style>
