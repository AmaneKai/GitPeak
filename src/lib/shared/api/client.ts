import { err, ok, type Result } from "./result"

export async function fetchWithTimeout(
	url: string,
	options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
	const { timeout = 10000, ...fetchOptions } = options

	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), timeout)

	try {
		const response = await fetch(url, {
			...fetchOptions,
			signal: controller.signal,
		})
		return response
	} finally {
		clearTimeout(id)
	}
}

export function handleNetworkError(error: unknown): string {
	if (error instanceof Error) {
		if (error.name === "AbortError") {
			return "Request timed out"
		}
		return error.message
	}
	return "Network error — check your connection"
}

export async function parseResponse<T>(
	response: Response,
	schema?: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } },
): Promise<Result<T>> {
	if (!response.ok) {
		return err(`HTTP Error ${response.status}: ${response.statusText}`)
	}

	try {
		const data = await response.json()
		if (schema) {
			const result = schema.safeParse(data)
			if (!result.success) {
				return err("Response validation failed")
			}
			return ok(result.data as T)
		}
		return ok(data as T)
	} catch {
		return err("Failed to parse JSON response")
	}
}
