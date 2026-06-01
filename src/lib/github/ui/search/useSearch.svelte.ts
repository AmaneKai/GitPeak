import { createGithubClient } from '$lib/github/api/github-client'
import type { GithubStats } from '$lib/github/models/github-stats'

export function useSearch() {
  let currentUsername = $state('')
  let loading = $state(false)
  let error = $state<string | null>(null)
  let statistics = $state<GithubStats | null>(null)
  let noResults = $state(false)

  const client = createGithubClient({
    apiUrl: 'https://ghfetch.carlosranara.workers.dev/v1/stats',
    requestTimeoutMilliseconds: 8000
  })

  async function onSearch(username: string) {
    if (!username)
      return

    loading = true
    error = null
    statistics = null
    noResults = false
    currentUsername = username

    const result = await client.fetchStats(username)
    loading = false

    if (!result.ok) {
      error = result.error
      noResults = true
      return
    }

    statistics = result.value
  }

  return {
    get currentUsername() { return currentUsername },
    get loading() { return loading },
    get error() { return error },
    get stats() { return statistics },
    get noResults() { return noResults },
    onSearch
  }
}
