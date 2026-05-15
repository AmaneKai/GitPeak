export function formatNumber(n: number): string {
	if (!Number.isFinite(n) || n < 0) return "0"

	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`

	return String(Math.floor(n))
}

export function accountAge(createdAt: string): string {
	if (!createdAt) return "unknown"

	const created = new Date(createdAt)
	if (isNaN(created.getTime())) return "unknown"

	const years = new Date().getFullYear() - created.getFullYear()

	if (years <= 0) return "< 1 year"
	return years === 1 ? "1 year" : `${years} years`
}
