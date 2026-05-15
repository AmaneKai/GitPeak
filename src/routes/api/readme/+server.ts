import { fetchGithubStats } from "$lib/entities/github/api/github"
import { formatNumber } from "$lib/shared/utils/format"
import { PRESET_THEMES } from "$lib/shared/utils/theme"
import { arcPath } from "$lib/entities/github/ui/useLanguagePie.svelte"
import type {
	GithubStats,
	GitHubLanguage,
	MostStarredRepo,
} from "$lib/entities/github/model/github-stats"

interface DonutSlice extends GitHubLanguage {
	color: string
	startDeg: number
	endDeg: number
}
type Theme = Record<string, string>
type NameLayout = { fontSize: number; lines: string[] }

const ACCENTS = ["foam", "iris", "gold", "love", "rose", "pine"] as const

let cachedMono = ""
let cachedSerif = ""

async function fetchBase64(url: string | null | undefined): Promise<string> {
	if (!url) return ""

	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) })

		if (!res.ok) return ""

		const buf = await res.arrayBuffer()
		const base64 = Buffer.from(buf).toString("base64")

		return base64
	} catch {
		return ""
	}
}

async function loadFontB64(family: string, weight: number) {
	const fam = family.replace(/ /g, "+")
	const url = `https://fonts.googleapis.com/css2?family=${fam}:wght@${weight}&display=swap`
	const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)"

	try {
		const css = await fetch(url, { headers: { "User-Agent": ua } }).then((r) => r.text())
		const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)

		return match ? fetchBase64(match[1]) : ""
	} catch {
		return ""
	}
}

function buildDonutSlices(langs: GitHubLanguage[], theme: Theme): DonutSlice[] {
	let cur = -90

	return langs.map((lang, i) => {
		const pct = Math.max(0, Math.min(100, lang.percentage ?? 0))
		const span = (pct / 100) * 360
		const startDeg = cur + 1.5
		const endDeg = cur + span - 1.5

		cur += span
		const key = ACCENTS[i % ACCENTS.length]

		return { ...lang, percentage: pct, color: theme[key], startDeg, endDeg }
	})
}

function svgDefs(mono: string, serif: string, theme: Theme) {
	return `
    <defs>
      <style>
        @font-face { font-family: 'JetBrains Mono'; src: url(data:font/truetype;charset=utf-8;base64,${mono}) format('truetype'); }
        @font-face { font-family: 'Instrument Serif'; src: url(data:font/truetype;charset=utf-8;base64,${serif}) format('truetype'); }
        .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: ${theme.text}; }
        .text-serif { font-family: 'Instrument Serif', 'Noto Sans JP', serif; fill: ${theme.text}; }
        .text-subtle { font-family: 'JetBrains Mono', monospace; fill: ${theme.subtle}; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .stagger { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; }
        .slice { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }
        .bar-fill { transform-origin: left center; animation: growX 0.8s ease-out forwards; }
      </style>
      <radialGradient id="aurora-p" cx="20%" cy="0%" r="60%">
        <stop offset="0%" stop-color="${theme.iris}" stop-opacity="0.15" />
        <stop offset="100%" stop-color="${theme.base}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="aurora-b" cx="100%" cy="100%" r="60%">
        <stop offset="0%" stop-color="${theme.foam}" stop-opacity="0.12" />
        <stop offset="100%" stop-color="${theme.base}" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
        <feOffset in="blur" dx="0" dy="8" result="offsetBlur" />
        <feFlood flood-color="#000" flood-opacity="0.35" result="color" />
        <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath id="do-clip"><circle cx="728" cy="170" r="48" /></clipPath>
      <clipPath id="rp-clip"><rect x="40" y="420" width="464" height="72" rx="16" /></clipPath>
    </defs>`
}

function getNameLayout(name: string): NameLayout {
	const chars = [...name]
	const len = chars.length

	switch (true) {
		case len <= 15:
			return { fontSize: 46, lines: [name] }
		case len <= 25:
			return { fontSize: 36, lines: [name] }
		case len <= 35:
			return { fontSize: 28, lines: [name] }
		default: {
			const mid = Math.ceil(len / 2)
			return {
				fontSize: 22,
				lines: [chars.slice(0, mid).join(""), chars.slice(mid).join("")],
			}
		}
	}
}

function getNameY(
	fontSize: number,
	multiline: boolean,
): { y1: number; y2: number; usernameY: number } {
	if (multiline) return { y1: 70, y2: 70 + fontSize + 4, usernameY: 70 + fontSize + 4 + 24 }

	const offsets: Record<number, [number, number]> = {
		46: [75, 102],
		36: [78, 104],
		28: [76, 102],
		22: [74, 100],
	}
	const [y1, usernameY] = offsets[fontSize]

	return { y1, y2: 0, usernameY }
}

function svgProfile(stats: GithubStats, username: string, theme: Theme) {
	const name = stats.displayName || username
	const { fontSize, lines } = getNameLayout(name)
	const { y1, y2, usernameY } = getNameY(fontSize, lines.length > 1)

	return `
    <g class="stagger delay-1">
      ${lines[0] ? `<text x="40" y="${y1}" class="text-serif" font-size="${fontSize}">${lines[0]}</text>` : ""}
      ${lines[1] ? `<text x="40" y="${y2}" class="text-serif" font-size="${fontSize}">${lines[1]}</text>` : ""}
      <text x="40" y="${usernameY}" class="text-main" fill="${theme.subtle}" font-size="15">@${username}</text>
    </g>`
}

function statCardSvg(
	id: string,
	x: number,
	y: number,
	accent: string,
	label: string,
	v: string,
	theme: Theme,
) {
	return `
    <clipPath id="${id}"><rect x="${x}" y="${y}" width="224" height="116" rx="16" /></clipPath>
    <rect x="${x}" y="${y}" width="224" height="116" rx="16" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" filter="url(#shadow)" />
    <rect x="${x}" y="${y}" width="224" height="4" fill="${accent}" clip-path="url(#${id})" />
    <text x="${x + 24}" y="${y + 40}" class="text-subtle">${label}</text>
    <text x="${x + 24}" y="${y + 90}" class="text-serif" font-size="44">${v}</text>`
}

function svgStatGrid(stats: GithubStats, theme: Theme) {
	return `
    <g class="stagger delay-2">
      ${statCardSvg("sc1", 40, 156, theme.foam, "Contributions", formatNumber(stats.totalContributions), theme)}
      ${statCardSvg("sc2", 280, 156, theme.iris, "Commits", formatNumber(stats.totalCommits), theme)}
      ${statCardSvg("sc3", 40, 288, theme.gold, "Stars", formatNumber(stats.totalStars), theme)}
      ${statCardSvg("sc4", 280, 288, theme.pine, "Repositories", formatNumber(stats.totalRepos), theme)}
    </g>`
}

function svgTopRepo(repo: MostStarredRepo | null, theme: Theme) {
	if (!repo) return ""
	return `
    <g class="stagger delay-3">
      <rect x="40" y="420" width="464" height="72" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" rx="16" filter="url(#shadow)" />
      <rect x="40" y="420" width="6" height="72" fill="${theme.gold}" clip-path="url(#rp-clip)" />
      <text x="64" y="446" class="text-subtle">Top Repository</text>
      <text x="64" y="476" class="text-serif" font-size="28" fill="${theme.text}">${repo.name}</text>
      <text x="480" y="474" class="text-main" fill="${theme.gold}" font-weight="bold" font-size="20" text-anchor="end">★ ${formatNumber(repo.stars)}</text>
    </g>`
}

function svgLangPanel(slices: DonutSlice[], total: number, avatar: string, theme: Theme) {
	const paths = slices
		.map(
			(s, i) =>
				`<path d="${arcPath(728, 170, 75, 57, s.startDeg, s.endDeg)}" fill="${s.color}" class="slice" style="animation-delay:${0.4 + i * 0.08}s"/>`,
		)
		.join("")
	const bars = slices
		.slice(0, 5)
		.map(
			(s, i) => `
      <circle cx="572" cy="${296 + i * 30}" r="4" fill="${s.color}" />
      <text x="588" y="${300 + i * 30}" class="text-main" font-size="12">${s.name}</text>
      <rect x="700" y="${294 + i * 30}" width="140" height="4" fill="${theme.subtle}" fill-opacity="0.1" rx="2" />
      <rect x="700" y="${294 + i * 30}" width="${(s.percentage / 100) * 140}" height="4" fill="${s.color}" rx="2" class="bar-fill" style="animation-delay:${0.6 + i * 0.1}s" filter="url(#glow)" />
      <text x="890" y="${300 + i * 30}" class="text-main" font-size="12" font-weight="600" fill="${s.color}" text-anchor="end">${s.percentage}%</text>
  `,
		)
		.join("")

	return `
    <g class="stagger delay-4">
      <clipPath id="lang-clip"><rect x="536" y="40" width="384" height="452" rx="24" /></clipPath>
      <rect x="536" y="40" width="384" height="452" rx="24" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" filter="url(#shadow)" />
      <rect x="536" y="40" width="384" height="4" fill="${theme.iris}" clip-path="url(#lang-clip)" />
      <text x="568" y="82" class="text-subtle">Languages</text>
      <rect x="830" y="65" width="60" height="20" rx="10" fill="${theme.iris}" fill-opacity="0.1" stroke="${theme.iris}" stroke-opacity="0.2" />
      <text x="860" y="79" class="text-main" fill="${theme.iris}" font-size="10" text-anchor="middle">${total} used</text>
      <circle cx="728" cy="170" r="66" fill="none" stroke="${theme.subtle}" stroke-opacity="0.05" stroke-width="18" />
      ${paths}
      ${avatar ? `<image href="data:image/png;base64,${avatar}" x="680" y="122" width="96" height="96" clip-path="url(#do-clip)" />` : ""}
      <circle cx="728" cy="170" r="48" fill="none" stroke="${theme.surface}" stroke-width="3" />
      ${bars}
    </g>`
}

export async function GET({ url }: { url: URL }) {
	const username = url.searchParams.get("username")?.trim()
	if (!username) return new Response("Missing username", { status: 400 })

	const requestedTheme = url.searchParams.get("theme") || "Rosé Pine"
	const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES["Rosé Pine"]

	const res = await fetchGithubStats(username)
	if (!res.ok) return new Response("User not found", { status: 404 })

	const stats = res.data
	stats.languages = Array.isArray(stats.languages) ? stats.languages : []

	if (!cachedMono || !cachedSerif) {
		const [m, s] = await Promise.all([
			loadFontB64("JetBrains Mono", 400),
			loadFontB64("Instrument Serif", 400),
		])
		cachedMono = m
		cachedSerif = s
	}

	const avatarB64 = await fetchBase64(stats.avatarUrl)
	const slices = buildDonutSlices(stats.languages, theme)

	const svg = `
    <svg width="960" height="520" viewBox="0 0 960 520" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${svgDefs(cachedMono, cachedSerif, theme)}
      <rect width="960" height="520" fill="${theme.base}" rx="20" />
      <rect width="960" height="520" fill="url(#aurora-p)" rx="20" />
      <rect width="960" height="520" fill="url(#aurora-b)" rx="20" />
      ${svgProfile(stats, username, theme)}
      ${svgStatGrid(stats, theme)}
      ${svgTopRepo(stats.mostStarredRepo, theme)}
      ${svgLangPanel(slices, stats.languages.length, avatarB64, theme)}
    </svg>`

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
		},
	})
}
