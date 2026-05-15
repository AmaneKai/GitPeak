<script lang="ts">
	import type { GithubStats } from "$lib/entities/github/model/github-stats"
	import { accountAge, formatNumber } from "$lib/shared/utils/format"
	import { ExternalLink, Calendar, Users } from "lucide-svelte"
	import { Card, CardContent } from "$lib/shared/ui/card"
	import { Badge } from "$lib/shared/ui/badge"
	import { Separator } from "$lib/shared/ui/separator"
	import { cn } from "$lib/shared/utils/ui"

	let { stats, login }: { stats: GithubStats; login: string } = $props()
	let displayName = $derived(stats.displayName || login)
</script>

<Card class={cn("glass relative overflow-hidden rounded-2xl")}>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full blur-[36px]"
		style="background:radial-gradient(circle, color-mix(in srgb, var(--iris) 14%, 
    transparent) 0%, transparent 70%)"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-[28px]"
		style="background:radial-gradient(circle, color-mix(in srgb, 
    var(--foam) 10%, transparent) 0%, transparent 70%)"
	></div>

	<CardContent class={cn("relative flex items-start gap-3 p-4 sm:gap-5 sm:p-6")}>
		<div
			class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20"
			style="border:1px solid color-mix(in srgb, var(--iris) 28%, transparent);
             box-shadow:0 8px 24px -6px rgba(0,0,0,0.5), 
             0 0 0 4px color-mix(in srgb, var(--iris) 5%, transparent);"
		>
			<img
				src={stats.avatarUrl}
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
					class="truncate font-serif text-lg leading-tight font-semibold sm:text-2xl"
					style="color: var(--text)"
				>
					{displayName}
				</h2>
				<Badge
					variant="outline"
					class="flex shrink-0 items-center gap-1 px-2 py-1 font-mono text-[10px]"
					style="background:color-mix(in srgb, var(--foam) 8%, transparent);
                 border-color:color-mix(in srgb, var(--foam) 18%, transparent);
                 color:var(--foam);"
				>
					<Calendar size={9} />
					{accountAge(stats.accountCreatedAt)}
				</Badge>
			</div>

			{#if stats.bio}
				<p class="line-clamp-2 text-xs leading-relaxed sm:text-sm" style="color: var(--subtle)">
					{stats.bio}
				</p>
			{/if}

			<Separator
				class="my-1"
				style="background: color-mix(in srgb, var(--highlight-med) 30%, transparent)"
			/>

			<div class="flex flex-wrap items-center justify-between gap-2">
				<a
					href="https://github.com/{login}"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View {displayName} on GitHub"
					class="flex items-center gap-1 font-mono text-xs transition-colors duration-150"
					style="color: var(--subtle)"
				>
					<span class="h-1.5 w-1.5 rounded-full" style="background:var(--foam)" aria-hidden="true"
					></span>
					github.com/{login}
					<ExternalLink size={9} aria-hidden="true" />
				</a>

				<div class="flex items-center gap-3 font-mono text-[10px]" style="color: var(--subtle)">
					<span class="flex items-center gap-1">
						<Users size={9} aria-hidden="true" />
						<span class="font-medium" style="color: var(--text)"
							>{formatNumber(stats.followers)}</span
						>
						followers
					</span>
					<span>
						<span class="font-medium" style="color: var(--text)"
							>{formatNumber(stats.following)}</span
						>
						following
					</span>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
