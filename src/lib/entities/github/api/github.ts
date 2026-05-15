import { err, type Result } from "../../../shared/api/result"
import { fetchWithTimeout, handleNetworkError, parseResponse } from "../../../shared/api/client"
import { githubConfig, isValidUsername } from "./config"
import { GithubStatsSchema, type GithubStats } from "../model/github-stats"

const NOT_FOUND = 404
const RATE_LIMITED = 429
const BAD_GATEWAY = 502
const SERVICE_UNAVAILABLE = 503
const INTERNAL_SERVER_ERROR = 500

function getErrorMessage(status: number): string {
	const messages: Record<number, string> = {
		[NOT_FOUND]: "GitHub user not found",
		[RATE_LIMITED]: "Rate limited — try again in a moment",
		[BAD_GATEWAY]: "Service is unavailable, try again shortly",
		[SERVICE_UNAVAILABLE]: "Service is unavailable, try again shortly",
	}

	if (status >= INTERNAL_SERVER_ERROR) {
		return "Something went wrong on our end, try again shortly"
	}

	return messages[status] ?? "Unexpected error, please try again"
}

export async function fetchGithubStats(username: string): Promise<Result<GithubStats>> {
	if (!isValidUsername(username)) {
		return err("Username must be 1–39 alphanumeric characters or hyphens")
	}

	const url = `${githubConfig.apiUrl}?username=${encodeURIComponent(
		username.trim().toLowerCase(),
	)}&_t=${Date.now()}`

	try {
		const response = await fetchWithTimeout(url, {
			timeout: githubConfig.timeout,
			cache: "no-store",
		})

		if (!response.ok) {
			return err(getErrorMessage(response.status))
		}

		const result = await response.json()
		if (!result.ok) {
			return err("Could not load this profile — try again")
		}

		const validation = GithubStatsSchema.safeParse(result.data)
		if (!validation.success) {
			return err("Response validation failed")
		}

		return { ok: true, data: validation.data }
	} catch (error) {
		return err(handleNetworkError(error))
	}
}
