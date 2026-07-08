import { createQuery } from '@tanstack/svelte-query'
import { createGithubClient } from '$lib/github/api/github-client'

const client = createGithubClient({
  apiUrl: 'https://ghfetch.carlosranara.workers.dev/v1/stats',
  requestTimeoutMilliseconds: 8000,
})

export function useSearch() {
  let currentUsername = $state('')

  const query = createQuery(() => ({
    queryKey: ['github-stats', currentUsername],
    queryFn: async () => {
      const result = await client.fetchStats(currentUsername)
      if (!result.ok)
        throw new Error(result.error)

      return result.value
    },
    enabled: currentUsername.length > 0,
  }))

  function onSearch(username: string) {
    if (!username)
      return

    currentUsername = username
  }

  return {
    get currentUsername() {
      return currentUsername
    },
    get loading() {
      return query.isLoading
    },
    get error() {
      return query.error?.message ?? null
    },
    get stats() {
      return query.data ?? null
    },
    get noResults() {
      return query.isError
    },
    onSearch,
  }
}
