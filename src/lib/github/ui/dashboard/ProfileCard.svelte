<script lang="ts">
  import type { GithubStats } from '$lib/github/models/github-stats'
  import { formatNumber } from '$lib/core/formatting/number-formatting'
  import { accountAge } from '$lib/github/models/account-age'
  import { ExternalLink, Calendar, Users } from 'lucide-svelte'
  import { Card, CardContent } from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Separator } from '$lib/components/ui/separator'
  import { cn } from '$lib/ui/styling/class-merger'

  let { statistics, login }: { statistics: GithubStats; login: string } = $props()

  let displayName = $derived(statistics.displayName || login)
</script>

<Card class="glass relative overflow-hidden rounded-2xl">
  <div
    aria-hidden="true"
    class={cn(
      'bg-[color-mix(in_srgb,var(--iris)_15%,transparent)]',
      'pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full blur-3xl',
    )}
  ></div>
  <div
    aria-hidden="true"
    class={cn(
      'bg-[color-mix(in_srgb,var(--foam)_10%,transparent)]',
      'pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl',
    )}
  ></div>

  <CardContent class="relative flex items-start gap-3 p-4 sm:gap-5 sm:p-6">
    <div
      class={cn(
        'border-[color-mix(in_srgb,var(--iris)_30%,transparent)]',
        'ring-[color-mix(in_srgb,var(--iris)_5%,transparent)]',
        'shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]',
        'h-16 w-16 shrink-0 overflow-hidden rounded-2xl border ring-4 sm:h-20 sm:w-20',
      )}
    >
      <img
        src={statistics.avatarUrl}
        crossorigin="anonymous"
        alt="{displayName}'s GitHub avatar"
        width="80"
        height="80"
        class="h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <h2
          class={cn(
            'text-(--text)',
            'truncate font-serif text-lg leading-tight font-semibold sm:text-2xl',
          )}
        >
          {displayName}
        </h2>

        <Badge
          variant="outline"
          class={cn(
            'bg-[color-mix(in_srgb,var(--foam)_10%,transparent)]',
            'border-[color-mix(in_srgb,var(--foam)_20%,transparent)]',
            'flex shrink-0 items-center gap-1 px-2 py-1 text---foam)',
            'font-mono text-[10px]',
          )}
        >
          <Calendar size={9} />
          {accountAge(statistics.accountCreatedAt)}
        </Badge>
      </div>

      {#if statistics.bio}
        <p class="line-clamp-2 text-xs leading-relaxed text-(--subtle) sm:text-sm">
          {statistics.bio}
        </p>
      {/if}

      <Separator class="my-1 bg-[color-mix(in_srgb,var(--highlight-med)_30%,transparent)]" />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a
          href="https://github.com/{login}"
          target="_blank"
          rel="external noopener noreferrer"
          aria-label="View {displayName} on GitHub"
          class={cn(
            'flex items-center gap-1 text-(--subtle)',
            'font-mono text-xs transition-colors duration-150',
          )}
        >
          <span class="h-1.5 w-1.5 rounded-full bg-(--foam)" aria-hidden="true"></span>
          github.com/{login}
          <ExternalLink size={9} aria-hidden="true" />
        </a>

        <div class="flex items-center gap-3 font-mono text-[10px] text-(--subtle)">
          <span class="flex items-center gap-1">
            <Users size={9} aria-hidden="true" />
            <span class="font-medium text-(--text)">
              {formatNumber(statistics.followers)}
            </span>
            followers
          </span>
          <span>
            <span class="font-medium text-(--text)">
              {formatNumber(statistics.following)}
            </span>
            following
          </span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
