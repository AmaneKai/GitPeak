<script lang="ts" module>
  export { badgeVariants, type BadgeVariant } from './badge-variants.js'
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/ui/styling/class-merger'
  import { badgeVariants, type BadgeVariant } from './badge-variants.js'

  let {
    ref = $bindable(null),
    href,
    class: className,
    variant = 'default',
    children,
    ...restProps
  }: WithElementRef<HTMLAnchorAttributes> & {
    variant?: BadgeVariant
  } = $props()
</script>

<svelte:element
  this={href ? 'a' : 'span'}
  bind:this={ref}
  data-slot="badge"
  {href}
  class={cn(badgeVariants({ variant }), className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
