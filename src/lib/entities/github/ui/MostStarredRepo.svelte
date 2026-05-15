<script lang="ts">
	import type { MostStarredRepo } from "$lib/entities/github/model/github-stats"
	import { formatNumber } from "$lib/shared/utils/format"
	import { Star, ArrowUpRight } from "lucide-svelte"
	import { Badge } from "$lib/shared/ui/badge"
	import { Button } from "$lib/shared/ui/button"
	import { Card, CardContent } from "$lib/shared/ui/card"
  import { cn } from "$lib/shared/utils/ui"

	let { repo }: { repo: MostStarredRepo } = $props()
</script>

{#if repo}
	<Card
		class={cn(
      "glass overflow-hidden rounded-2xl transition-[border-color,box-shadow,transform]",
      "duration-180 ease-out hover:-translate-y-px"
    )}
	>
		<a href={repo.url} target="_blank" rel="noopener noreferrer" class="block no-underline">
			<CardContent class="p-5">
				<div class="flex items-start justify-between gap-4">
					<div class="flex min-w-0 flex-1 flex-col gap-2">
						<span
							class="font-mono text-[9px] tracking-[0.2em] uppercase"
							style="color: var(--muted)"
						>
							★ most starred repo
						</span>
						<span
							class="truncate font-serif text-lg leading-tight font-semibold"
							style="color: var(--text)"
						>
							{repo.name}
						</span>
						<div class="mt-1 flex items-center gap-2">
							<Badge
								variant="outline"
								class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono"
								style="background:color-mix(in srgb, var(--gold) 10%, transparent);
                       border-color:color-mix(in srgb, var(--gold) 20%, transparent);
                       color:var(--gold);"
							>
								<Star size={12} style="fill:var(--gold)" />
								{formatNumber(repo.stars)}
							</Badge>
							<span class="font-mono text-[10px]" style="color:var(--muted)">stars</span>
						</div>
					</div>

					<Button
						variant="ghost"
						size="icon"
						class="mt-1 h-8 w-8 shrink-0 rounded-xl"
						style="background:color-mix(in srgb, var(--highlight-med) 60%, transparent); 
            color:var(--muted);"
					>
						<ArrowUpRight size={15} />
					</Button>
				</div>
			</CardContent>
		</a>
	</Card>
{/if}
