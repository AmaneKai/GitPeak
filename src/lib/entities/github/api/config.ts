import { dev } from "$app/environment"

const GITHUB_API_URL = "https://ghfetch.carlosranara.workers.dev/v1/stats"
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_TIMEOUT_MS = 30_000
const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/

function getEnv(): Record<string, string | undefined> {
	return typeof import.meta !== "undefined" ? (import.meta.env as any) : {}
}

function resolveApiUrl(): string {
	const env = getEnv()
	const url = env.VITE_API_URL ?? (dev ? env.PUBLIC_API_URL : undefined)

	return typeof url === "string" && url.length > 0 ? url : GITHUB_API_URL
}

function resolveTimeout(): number {
	const env = getEnv()
	const raw = env.VITE_API_TIMEOUT
	const parsed = typeof raw === "string" ? parseInt(raw, 10) : NaN

	return Number.isFinite(parsed) && parsed > 0
		? Math.min(parsed, MAX_TIMEOUT_MS)
		: DEFAULT_TIMEOUT_MS
}

export const githubConfig = {
	apiUrl: resolveApiUrl(),
	timeout: resolveTimeout(),
	usernamePattern: USERNAME_PATTERN,
}

export function isValidUsername(username: unknown): username is string {
	return (
		typeof username === "string" &&
		username.length > 0 &&
		username.length <= 39 &&
		USERNAME_PATTERN.test(username)
	)
}
