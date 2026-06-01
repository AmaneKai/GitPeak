import { error, ok, type Result } from '$lib/core/network/result-type'
import type { GithubStats } from '../models/github-stats'

export interface GithubClientConfig {
  apiUrl: string
  requestTimeoutMilliseconds: number
}

const NOT_FOUND = 404
const RATE_LIMITED = 429
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const INTERNAL_SERVER_ERROR = 500

function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    [NOT_FOUND]: 'GitHub user not found',
    [RATE_LIMITED]: 'Rate limited — try again in a moment',
    [BAD_GATEWAY]: 'Service is unavailable, try again shortly',
    [SERVICE_UNAVAILABLE]: 'Service is unavailable, try again shortly'
  }

  if (status >= INTERNAL_SERVER_ERROR)
    return 'Something went wrong on our end, try again shortly'

  return messages[status] ?? 'Unexpected error, please try again'
}

function keysToCamel(item: unknown): unknown {
  if (Array.isArray(item))
    return item.map((value) => keysToCamel(value))

  if (item !== null && typeof item === 'object') {
    const record = item as Record<string, unknown>
    return Object.keys(record).reduce<Record<string, unknown>>((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
      return {
        ...result,
        [camelKey]: keysToCamel(record[key])
      }
    }, {})
  }

  return item
}

export function createGithubClient(config: GithubClientConfig) {
  return {
    async fetchStats(username: string): Promise<Result<GithubStats>> {
      const sanitizedUsername = username.trim().toLowerCase()
      const controller = new AbortController()
      
      const timeoutId = setTimeout(
        () => controller.abort(), 
        config.requestTimeoutMilliseconds
      )

      try {
        const encodedUsername = encodeURIComponent(sanitizedUsername)
        const url = `${config.apiUrl}?username=${encodedUsername}&_t=${Date.now()}`
        
        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!response.ok)
          return error(getErrorMessage(response.status))

        const rawResponse = await response.json()
        if (!rawResponse.ok)
          return error('Could not load this profile — try again')

        const camelData = keysToCamel(rawResponse.data) as GithubStats
        return ok(camelData)
      } catch (caughtError: unknown) {
        clearTimeout(timeoutId)
        
        if (caughtError instanceof Error) {
          if (caughtError.name === 'AbortError')
            return error('Request timed out')
          return error(caughtError.message)
        }
          
        return error('Network connection failed')
      }
    }
  }
}
