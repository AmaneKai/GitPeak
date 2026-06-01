<script lang="ts">
  import { UserX } from 'lucide-svelte'
  import { cn } from '$lib/ui/styling/class-merger'

  let { username }: { username: string } = $props()
</script>

<div
  class={cn(
    'glass fade-in-up flex w-full max-w-sm flex-col',
    'items-center gap-4 rounded-2xl px-8 py-12 text-center',
  )}
>
  <div
    class="
    bg-surface border-highlight-med mb-2 flex h-12 w-12 items-center
    justify-center rounded-full border
  "
  >
    <UserX class="text-muted h-6 w-6" />
  </div>
  <div>
    <h3 class="text-rp-text mb-1 text-lg font-medium">User not found</h3>
    <p class="text-subtle font-mono text-sm leading-relaxed">
      No GitHub profile for
      <span class="text-rp-text font-semibold">
        @{username}
      </span>. Check the spelling and try again.
    </p>
  </div>
</div>
