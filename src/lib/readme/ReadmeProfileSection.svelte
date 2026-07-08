<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import type { ThemeTokens } from '$lib/theme/theme-manager'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'

  let {
    statistics,
    username,
    theme,
    avatarDataUri,
    x,
    y,
    width,
  }: {
    statistics: GithubStats
    username: string
    theme: ThemeTokens
    avatarDataUri: string
    x: number
    y: number
    width: number
  } = $props()

  const HEIGHT = 104
  const AVATAR_SIZE = 72
  const NAME_MAX_CHARACTERS = 22

  const displayName = $derived(statistics.displayName || username)
  const truncatedName = $derived(
    displayName.length > NAME_MAX_CHARACTERS
      ? `${displayName.slice(0, NAME_MAX_CHARACTERS - 1)}…`
      : displayName,
  )

  const avatarX = $derived(x + 14)
  const avatarY = $derived(y + 16)
  const textX = $derived(avatarX + AVATAR_SIZE + 18)
  const age = $derived(accountAge(statistics.accountCreatedAt))
</script>

<rect
  {x}
  {y}
  {width}
  height={HEIGHT}
  rx="18"
  fill={theme.surface}
  fill-opacity="0.6"
  stroke={theme.subtle}
  stroke-opacity="0.15"
  filter="url(#glass-shadow)"
/>
<rect
  x={x + 1}
  y={y + 1}
  width={width - 2}
  height="1"
  rx="17"
  fill={theme.text}
  fill-opacity="0.06"
/>

<clipPath id="profile-avatar-clip">
  <rect x={avatarX} y={avatarY} width={AVATAR_SIZE} height={AVATAR_SIZE} rx="16" />
</clipPath>
{#if avatarDataUri}
  <image
    x={avatarX}
    y={avatarY}
    width={AVATAR_SIZE}
    height={AVATAR_SIZE}
    href={avatarDataUri}
    clip-path="url(#profile-avatar-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
{/if}
<rect
  x={avatarX}
  y={avatarY}
  width={AVATAR_SIZE}
  height={AVATAR_SIZE}
  rx="16"
  fill="none"
  stroke={theme.iris}
  stroke-opacity="0.3"
/>

<rect
  x={x + width - 96}
  y={y + 16}
  width="82"
  height="22"
  rx="11"
  fill={theme.foam}
  fill-opacity="0.12"
  stroke={theme.foam}
  stroke-opacity="0.25"
/>
<text
  x={x + width - 55}
  y={y + 31}
  class="text-main"
  fill={theme.foam}
  font-size="10"
  text-anchor="middle"
>
  {age}
</text>

<text x={textX} y={y + 40} class="text-serif" font-size="26">{truncatedName}</text>
<text x={textX} y={y + 62} class="text-main" fill={theme.subtle} font-size="13">
  @{username}
</text>
<text x={textX} y={y + HEIGHT - 18} class="text-main" fill={theme.subtle} font-size="11">
  <tspan fill={theme.text} font-weight="600">{formatNumber(statistics.followers)}</tspan>
  followers
  <tspan dx="10" fill={theme.text} font-weight="600">{formatNumber(statistics.following)}</tspan>
  following
</text>
