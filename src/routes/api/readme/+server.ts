import { fetchStats } from '$lib/utils/api'
import { formatNumber } from '$lib/utils/format'
import { COLORS } from '$lib/utils/theme'

interface Language { name: string; percentage: number }
interface TopRepo { name: string; stars: number }
interface GithubStats {
  avatarUrl: string; displayName: string | null; totalContributions: number;
  totalCommits: number; totalStars: number; totalRepos: number;
  languages: Language[]; mostStarredRepo: TopRepo | null;
}
interface DonutSlice extends Language { color: string; startDeg: number; endDeg: number }

const ACCENTS = ['foam', 'iris', 'gold', 'love', 'rose', 'pine'] as const

let cachedMono = '';
let cachedSerif = '';

async function fetchBase64(url: string | null | undefined) {
  if (!url) return ''
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) }) // 3s timeout
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  } catch {
    return '' // Return empty string instead of crashing if avatar fails
  }
}

async function loadFontB64(family: string, weight: number) {
  const fam = family.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${fam}:wght@${weight}&display=swap`
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)'
  try {
    const css = await fetch(url, { headers: { 'User-Agent': ua } }).then((r) => r.text())
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
    return match ? fetchBase64(match[1]) : ''
  } catch {
    return ''
  }
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutArcPath(cx: number, cy: number, ro: number, ri: number, s: number, e: number) {
  const end = Math.min(e, s + 359.9)
  const la = end - s > 180 ? 1 : 0
  const o1 = polar(cx, cy, ro, s)
  const o2 = polar(cx, cy, ro, end)
  const i1 = polar(cx, cy, ri, end)
  const i2 = polar(cx, cy, ri, s)
  return [
    `M ${o1.x} ${o1.y}`, `A ${ro} ${ro} 0 ${la} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`, `A ${ri} ${ri} 0 ${la} 0 ${i2.x} ${i2.y} Z`
  ].join(' ')
}

function buildDonutSlices(langs: Language[]): DonutSlice[] {
  let cur = -90
  return langs.map((lang, i) => {
    const pct = Math.max(0, Math.min(100, lang.percentage ?? 0))
    const span = (pct / 100) * 360
    const startDeg = cur + 1.5
    const endDeg = cur + span - 1.5
    cur += span
    const key = ACCENTS[i % ACCENTS.length] as keyof typeof COLORS
    return { ...lang, percentage: pct, color: COLORS[key], startDeg, endDeg }
  })
}

function svgDefs(mono: string, serif: string) {
  return `
    <defs>
      <style>
        @font-face { font-family: 'JetBrains Mono'; src: url(data:font/truetype;charset=utf-8;base64,${mono}) format('truetype'); }
        @font-face { font-family: 'Instrument Serif'; src: url(data:font/truetype;charset=utf-8;base64,${serif}) format('truetype'); }
        .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: #e0def4; }
        .text-serif { font-family: 'Instrument Serif', 'Noto Sans JP', serif; fill: #e0def4; }
        .text-subtle { font-family: 'JetBrains Mono', monospace; fill: #908caa; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }
        @keyframes up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8) rotate(-10deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes stretch { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .stagger { opacity: 0; animation: up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; }
        .slice { transform-origin: 728px 170px; opacity: 0; animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .bar-fill { transform-origin: left center; animation: stretch 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      </style>
      <radialGradient id="aurora-p" cx="20%" cy="0%" r="60%">
        <stop offset="0%" stop-color="#c4a7e7" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#191724" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="aurora-b" cx="100%" cy="100%" r="60%">
        <stop offset="0%" stop-color="#9ccfd8" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#191724" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity="0.45" />
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <clipPath id="av-clip"><rect x="40" y="40" width="80" height="80" rx="20" /></clipPath>
      <clipPath id="do-clip"><circle cx="728" cy="170" r="48" /></clipPath>
      <clipPath id="rp-clip"><rect x="40" y="420" width="464" height="72" rx="16" /></clipPath>
    </defs>`
}

function svgProfile(stats: GithubStats, username: string, avatar: string) {
  const name = stats.displayName || username
  return `
    <g class="stagger delay-1">
      ${avatar ? `<image href="data:image/png;base64,${avatar}" x="40" y="40" width="80" height="80" clip-path="url(#av-clip)" filter="url(#shadow)" />` : ''}
      <rect x="40" y="40" width="80" height="80" rx="20" fill="${avatar ? 'none' : '#26233a'}" stroke="#c4a7e7" stroke-opacity="0.3" stroke-width="2" />
      <text x="144" y="85" class="text-serif" font-size="46">${name}</text>
      <text x="144" y="112" class="text-main" fill="#908caa" font-size="15">@${username}</text>
    </g>`
}

function statCardSvg(id: string, x: number, y: number, accent: string, label: string, v: string) {
  return `
    <clipPath id="${id}"><rect x="${x}" y="${y}" width="224" height="116" rx="16" /></clipPath>
    <rect x="${x}" y="${y}" width="224" height="116" rx="16" fill="#1f1d2e" fill-opacity="0.6" stroke="rgba(144,140,170,0.15)" filter="url(#shadow)" />
    <rect x="${x}" y="${y}" width="224" height="4" fill="${accent}" clip-path="url(#${id})" />
    <text x="${x + 24}" y="${y + 40}" class="text-subtle">${label}</text>
    <text x="${x + 24}" y="${y + 90}" class="text-serif" font-size="44">${v}</text>`
}

function svgStatGrid(stats: GithubStats) {
  return `
    <g class="stagger delay-2">
      ${statCardSvg('sc1', 40, 156, COLORS.foam, 'Contributions', formatNumber(stats.totalContributions))}
      ${statCardSvg('sc2', 280, 156, COLORS.iris, 'Commits', formatNumber(stats.totalCommits))}
      ${statCardSvg('sc3', 40, 288, COLORS.gold, 'Stars', formatNumber(stats.totalStars))}
      ${statCardSvg('sc4', 280, 288, COLORS.pine, 'Repositories', formatNumber(stats.totalRepos))}
    </g>`
}

function svgTopRepo(repo: TopRepo | null) {
  if (!repo) return ''
  return `
    <g class="stagger delay-3">
      <rect x="40" y="420" width="464" height="72" fill="#1f1d2e" fill-opacity="0.6" stroke="rgba(144,140,170,0.15)" rx="16" filter="url(#shadow)" />
      <rect x="40" y="420" width="6" height="72" fill="#f6c177" clip-path="url(#rp-clip)" />
      <text x="64" y="446" class="text-subtle">&#9733; Top Repository</text>
      <text x="64" y="476" class="text-serif" font-size="28" fill="#e0def4">${repo.name}</text>
      <text x="480" y="474" class="text-main" fill="#f6c177" font-weight="bold" font-size="20" text-anchor="end">&#9733; ${formatNumber(repo.stars)}</text>
    </g>`
}

function svgLangPanel(slices: DonutSlice[], total: number, avatar: string) {
  const paths = slices.map((s, i) => `<path d="${donutArcPath(728, 170, 75, 57, s.startDeg, s.endDeg)}" fill="${s.color}" class="slice" style="animation-delay:${0.4 + i * 0.08}s"/>`).join('')
  const bars = slices.slice(0, 5).map((s, i) => `
      <circle cx="572" cy="${296 + i * 30}" r="4" fill="${s.color}" />
      <text x="588" y="${300 + i * 30}" class="text-main" font-size="12">${s.name}</text>
      <rect x="700" y="${294 + i * 30}" width="140" height="4" fill="rgba(144,140,170,0.1)" rx="2" />
      <rect x="700" y="${294 + i * 30}" width="${(s.percentage / 100) * 140}" height="4" fill="${s.color}" rx="2" class="bar-fill" style="animation-delay:${0.6 + i * 0.1}s" filter="url(#glow)" />
      <text x="890" y="${300 + i * 30}" class="text-main" font-size="12" font-weight="600" fill="${s.color}" text-anchor="end">${s.percentage}%</text>
  `).join('')

  return `
    <g class="stagger delay-4">
      <clipPath id="lang-clip"><rect x="536" y="40" width="384" height="452" rx="24" /></clipPath>
      <rect x="536" y="40" width="384" height="452" rx="24" fill="#1f1d2e" fill-opacity="0.6" stroke="rgba(144,140,170,0.15)" filter="url(#shadow)" />
      <rect x="536" y="40" width="384" height="4" fill="#c4a7e7" clip-path="url(#lang-clip)" />
      <text x="568" y="82" class="text-subtle">Languages</text>
      <rect x="830" y="65" width="60" height="20" rx="10" fill="rgba(196,167,231,0.1)" stroke="rgba(196,167,231,0.2)" />
      <text x="860" y="79" class="text-main" fill="#c4a7e7" font-size="10" text-anchor="middle">${total} used</text>
      <circle cx="728" cy="170" r="66" fill="none" stroke="rgba(144,140,170,0.05)" stroke-width="18" />
      ${paths}
      ${avatar ? `<image href="data:image/png;base64,${avatar}" x="680" y="122" width="96" height="96" clip-path="url(#do-clip)" />` : ''}
      <circle cx="728" cy="170" r="48" fill="none" stroke="#1f1d2e" stroke-width="3" />
      ${bars}
    </g>`
}

export async function GET({ url }: { url: URL }) {
  const username = url.searchParams.get('username')?.trim()
  if (!username) return new Response('Missing username', { status: 400 })

  const res = await fetchStats(username)
  if (!res.ok) return new Response('User not found', { status: 404 })
  const stats = res.data as GithubStats
  stats.languages = Array.isArray(stats.languages) ? stats.languages :[]

  if (!cachedMono || !cachedSerif) {
    const [m, s] = await Promise.all([
      loadFontB64('JetBrains Mono', 400),
      loadFontB64('Instrument Serif', 400)
    ]);
    cachedMono = m;
    cachedSerif = s;
  }

  const avatarB64 = await fetchBase64(stats.avatarUrl);

  const slices = buildDonutSlices(stats.languages)
  const svg = `
    <svg width="960" height="520" viewBox="0 0 960 520" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${svgDefs(cachedMono, cachedSerif)}
      <rect width="960" height="520" fill="#191724" rx="20" />
      <rect width="960" height="520" fill="url(#aurora-p)" rx="20" />
      <rect width="960" height="520" fill="url(#aurora-b)" rx="20" />
      ${svgProfile(stats, username, avatarB64)}
      ${svgStatGrid(stats)}
      ${svgTopRepo(stats.mostStarredRepo)}
      ${svgLangPanel(slices, stats.languages.length, avatarB64)}
    </svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=7200, stale-while-revalidate=86400'
    }
  })
}
