<script lang="ts">
	import { Search } from "lucide-svelte"
	import { Input } from "$lib/shared/ui/input"
	import { Button } from "$lib/shared/ui/button"

	let { onSearch }: { onSearch: (username: string) => void } = $props()

	let username = $state("")
	let focused = $state(false)

	function handleSearch() {
		const trimmed = username.trim()
		if (trimmed) onSearch(trimmed)
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") handleSearch()
	}
</script>

<div
	class="
    glass relative flex w-full max-w-[calc(100vw-24px)]
    max-w-lg touch-manipulation items-center
    rounded-2xl p-1 transition-all
    duration-300
  "
	class:focused
>
	<div class="flex shrink-0 items-center pr-1 pl-4">
		<Search
			size={15}
			aria-hidden="true"
			style="color: {focused ? 'var(--iris)' : 'var(--muted)'}; transition: color 0.2s;"
		/>
	</div>

	<Input
		bind:value={username}
		onkeydown={handleKeydown}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		placeholder="username"
		spellcheck="false"
		autocomplete="off"
		autocorrect="off"
		autocapitalize="off"
		enterkeyhint="search"
		style="color: var(--text);"
		class="
      caret-iris flex-1 touch-manipulation border-none bg-transparent
      px-2 py-3 font-mono text-base tracking-wide shadow-none
      outline-none placeholder:opacity-30
      focus-visible:ring-0 focus-visible:ring-offset-0
      sm:text-base
    "
	/>

	<Button
		onclick={handleSearch}
		variant="ghost"
		style="color: var(--iris); border-color: color-mix(in srgb, var(--iris) 25%, transparent);
           background: linear-gradient(to bottom right, color-mix(in srgb, var(--iris) 20%, transparent), color-mix(in srgb, var(--foam) 15%, transparent));"
		class="
      m-0.5 min-h-[44px] shrink-0 touch-manipulation rounded-xl
      border px-5 py-2.5 font-mono text-base font-medium
      tracking-wide uppercase transition-all
      duration-200 select-none active:scale-95
    "
	>
		peek
	</Button>
</div>

<style>
	.focused {
		border-color: color-mix(in srgb, var(--subtle) 40%, transparent) !important;
		box-shadow:
			0 0 0 4px color-mix(in srgb, var(--iris) 8%, transparent),
			0 24px 48px -12px rgba(0, 0, 0, 0.5);
	}
</style>
