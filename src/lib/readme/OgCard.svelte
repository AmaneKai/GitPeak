<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import ReadmeProfileSection from './ReadmeProfileSection.svelte'
  import ReadmeStatGrid from './ReadmeStatGrid.svelte'
  import ReadmeLanguagePanel from './ReadmeLanguagePanel.svelte'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
  } = $props()

  const WIDTH = 1200
  const HEIGHT = 630
  const PADDING = 44
  const GAP_X = 40
  const GAP_Y = 20
  const PROFILE_HEIGHT = 104

  const LEFT_X = PADDING
  const LEFT_WIDTH = 600
  const RIGHT_X = LEFT_X + LEFT_WIDTH + GAP_X
  const RIGHT_WIDTH = WIDTH - PADDING - RIGHT_X

  const CONTENT_HEIGHT = HEIGHT - PADDING * 2
  const STAT_GRID_Y = PADDING + PROFILE_HEIGHT + GAP_Y
  const STAT_GRID_HEIGHT = CONTENT_HEIGHT - PROFILE_HEIGHT - GAP_Y
</script>

<svg
  width={WIDTH}
  height={HEIGHT}
  viewBox="0 0 {WIDTH} {HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <radialGradient id="aurora-iris" cx="-10%" cy="-10%" r="60%">
      <stop offset="0%" stop-color={theme.iris} stop-opacity="0.16" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-foam" cx="110%" cy="110%" r="60%">
      <stop offset="0%" stop-color={theme.foam} stop-opacity="0.12" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>
    <radialGradient id="aurora-love" cx="65%" cy="-5%" r="55%">
      <stop offset="0%" stop-color={theme.love} stop-opacity="0.08" />
      <stop offset="100%" stop-color={theme.base} stop-opacity="0" />
    </radialGradient>

    <filter id="glass-shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
      <feOffset in="blur" dx="0" dy="10" result="offsetBlur" />
      <feFlood flood-color="#000000" flood-opacity="0.4" result="shadowColor" />
      <feComposite in="shadowColor" in2="offsetBlur" operator="in" result="shadow" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <rect width={WIDTH} height={HEIGHT} fill={theme.base} />
  <rect width={WIDTH} height={HEIGHT} fill="url(#aurora-iris)" />
  <rect width={WIDTH} height={HEIGHT} fill="url(#aurora-foam)" />
  <rect width={WIDTH} height={HEIGHT} fill="url(#aurora-love)" />

  <ReadmeProfileSection
    {statistics}
    {username}
    {theme}
    {avatarDataUri}
    x={LEFT_X}
    y={PADDING}
    width={LEFT_WIDTH}
  />

  <ReadmeStatGrid
    {statistics}
    {theme}
    x={LEFT_X}
    y={STAT_GRID_Y}
    width={LEFT_WIDTH}
    height={STAT_GRID_HEIGHT}
  />

  <ReadmeLanguagePanel
    languages={statistics.languages}
    mostStarredRepo={statistics.mostStarredRepo}
    {theme}
    {avatarDataUri}
    x={RIGHT_X}
    y={PADDING}
    width={RIGHT_WIDTH}
    height={CONTENT_HEIGHT}
  />

  <text
    x={WIDTH - 28}
    y={HEIGHT - 20}
    class="text-serif"
    font-size="16"
    font-style="italic"
    fill={theme.iris}
    fill-opacity="0.55"
    text-anchor="end"
  >
    GitPeak
  </text>
</svg>
