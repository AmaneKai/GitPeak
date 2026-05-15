import { toast } from "svelte-sonner"
import { fetchGithubStats } from "$lib/entities/github/api/github"
import type { GithubStats } from "$lib/entities/github/model/github-stats"

export function useSearch() {
	let stats = $state<GithubStats | null>(null)
	let isLoading = $state(false)
	let hasSearched = $state(false)
	let currentUsername = $state("")

	async function performSearch(username: string) {
		isLoading = true
		stats = null
		hasSearched = true
		currentUsername = username

		const result = await fetchGithubStats(username)
		isLoading = false

		if (result.ok) {
			stats = result.data
		} else {
			toast.error(result.error)
		}
	}

	return {
		get stats() {
			return stats
		},
		get loading() {
			return isLoading
		},
		get searched() {
			return hasSearched
		},
		get currentUsername() {
			return currentUsername
		},
		get noResults() {
			return hasSearched && !isLoading && !stats
		},
		onSearch: performSearch,
	}
}
