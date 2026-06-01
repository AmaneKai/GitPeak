import type { GithubStats, GitHubLanguage, MostStarredRepo } from '$lib/github/models/github-stats'
import { formatNumber } from '$lib/core/formatting/number-formatting'
import { generateArcPath } from '$lib/github/ui/language-breakdown/useLanguagePie.svelte'

export interface DonutSlice extends GitHubLanguage {
  color: string
  startDegrees: number
  endDegrees: number
  visible: boolean
}

const ACCENT_COLORS = ['foam', 'iris', 'gold', 'love', 'rose', 'pine'] as const
const DONUT_GAP_DEGREES = 1.5
const MIN_SLICE_DEGREES = DONUT_GAP_DEGREES * 2 + 1

function escapeSvg(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildDonutSlices(
  languages: GitHubLanguage[],
  theme: Record<string, string>,
): DonutSlice[] {
  let cursorDegrees = -90

  return languages.map((language, index) => {
    const percentage = Math.max(0, Math.min(100, language.percentage ?? 0))
    const spanDegrees = (percentage / 100) * 360
    const startDegrees = cursorDegrees + DONUT_GAP_DEGREES
    const endDegrees = cursorDegrees + spanDegrees - DONUT_GAP_DEGREES
    const visible = spanDegrees > MIN_SLICE_DEGREES

    cursorDegrees += spanDegrees

    const accentKey = ACCENT_COLORS[index % ACCENT_COLORS.length]

    return {
      ...language,
      percentage,
      color: theme[accentKey],
      startDegrees,
      endDegrees,
      visible,
    }
  })
}

export function generateSvgDefs(
  monoFontB64: string,
  serifFontB64: string,
  theme: Record<string, string>,
): string {
  return [
    '    <defs>',
    '      <style>',
    `        @font-face { font-family: 'JetBrains Mono'; src: url(data:font/truetype;charset=utf-8;base64,${monoFontB64}) format('truetype'); }`,
    `        @font-face { font-family: 'Instrument Serif'; src: url(data:font/truetype;charset=utf-8;base64,${serifFontB64}) format('truetype'); }`,
    `        .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: ${theme.text}; }`,
    `        .text-serif { font-family: 'Instrument Serif', 'Noto Sans JP', serif; fill: ${theme.text}; }`,
    `        .text-subtle { font-family: 'JetBrains Mono', monospace; fill: ${theme.subtle}; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; }`,
    '        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }',
    '        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    '        @keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }',
    '        .stagger { opacity: 0; animation: fadeUp 0.6s ease-out forwards; }',
    '        .delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; } .delay-4 { animation-delay: 0.4s; }',
    '        .slice { opacity: 0; animation: fadeIn 0.5s ease-out forwards; }',
    '        .bar-fill { transform-origin: left center; animation: growX 0.8s ease-out forwards; }',
    '      </style>',
    '      <radialGradient id="aurora-p" cx="20%" cy="0%" r="60%">',
    `        <stop offset="0%" stop-color="${theme.iris}" stop-opacity="0.15" />`,
    `        <stop offset="100%" stop-color="${theme.base}" stop-opacity="0" />`,
    '      </radialGradient>',
    '      <radialGradient id="aurora-b" cx="100%" cy="100%" r="60%">',
    `        <stop offset="0%" stop-color="${theme.foam}" stop-opacity="0.12" />`,
    `        <stop offset="100%" stop-color="${theme.base}" stop-opacity="0" />`,
    '      </radialGradient>',
    '      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '        <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />',
    '        <feOffset in="blur" dx="0" dy="8" result="offsetBlur" />',
    '        <feFlood flood-color="#000" flood-opacity="0.35" result="color" />',
    '        <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />',
    '        <feMerge>',
    '          <feMergeNode in="shadow" />',
    '          <feMergeNode in="SourceGraphic" />',
    '        </feMerge>',
    '      </filter>',
    '      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">',
    '        <feGaussianBlur stdDeviation="3" result="blur" />',
    '        <feMerge>',
    '          <feMergeNode in="blur" />',
    '          <feMergeNode in="SourceGraphic" />',
    '        </feMerge>',
    '      </filter>',
    '      <clipPath id="donut-clip"><circle cx="728" cy="170" r="48" /></clipPath>',
    '      <clipPath id="repository-clip"><rect x="40" y="420" width="464" height="72" rx="16" /></clipPath>',
    '    </defs>',
  ].join('\n')
}

export function generateNameLayout(name: string) {
  const characters = [...name]
  const length = characters.length

  if (length <= 15)
    return { fontSize: 46, lines: [name] }

  if (length <= 25)
    return { fontSize: 36, lines: [name] }

  if (length <= 35)
    return { fontSize: 28, lines: [name] }

  const midPoint = Math.ceil(length / 2)
  return {
    fontSize: 22,
    lines: [characters.slice(0, midPoint).join(''), characters.slice(midPoint).join('')],
  }
}

const NAME_Y_OFFSETS: Record<number, [number, number]> = {
  46: [75, 102],
  36: [78, 104],
  28: [76, 102],
  22: [74, 100],
}

export function calculateNameY(fontSize: number, isMultiline: boolean) {
  if (isMultiline)
    return { positionY1: 70, positionY2: 70 + fontSize + 4, usernameY: 70 + fontSize + 4 + 24 }

  const [positionY1, usernameY] = NAME_Y_OFFSETS[fontSize] ?? NAME_Y_OFFSETS[22]

  return { positionY1, positionY2: 0, usernameY }
}

export function generateProfileSvg(
  statistics: GithubStats,
  username: string,
  theme: Record<string, string>,
): string {
  const name = escapeSvg(statistics.displayName || username)
  const safeUsername = escapeSvg(username)
  const { fontSize, lines } = generateNameLayout(name)
  const { positionY1, positionY2, usernameY } = calculateNameY(fontSize, lines.length > 1)

  return [
    '    <g class="stagger delay-1">',
    lines[0]
      ? `      <text x="40" y="${positionY1}" class="text-serif" font-size="${fontSize}">${lines[0]}</text>`
      : '',
    lines[1]
      ? `      <text x="40" y="${positionY2}" class="text-serif" font-size="${fontSize}">${lines[1]}</text>`
      : '',
    `      <text x="40" y="${usernameY}" class="text-main" fill="${theme.subtle}" font-size="15">@${safeUsername}</text>`,
    '    </g>',
  ].join('\n')
}

export function generateCardSvg(
  id: string,
  positionX: number,
  positionY: number,
  accent: string,
  label: string,
  value: string,
  theme: Record<string, string>,
): string {
  return [
    `    <clipPath id="${id}"><rect x="${positionX}" y="${positionY}" width="224" height="116" rx="16" /></clipPath>`,
    `    <rect x="${positionX}" y="${positionY}" width="224" height="116" rx="16" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" filter="url(#shadow)" />`,
    `    <rect x="${positionX}" y="${positionY}" width="224" height="4" fill="${accent}" clip-path="url(#${id})" />`,
    `    <text x="${positionX + 24}" y="${positionY + 40}" class="text-subtle">${label}</text>`,
    `    <text x="${positionX + 24}" y="${positionY + 90}" class="text-serif" font-size="44">${value}</text>`,
  ].join('\n')
}

export function generateStatGridSvg(
  statistics: GithubStats,
  theme: Record<string, string>,
): string {
  return [
    '    <g class="stagger delay-2">',
    generateCardSvg('sc1', 40, 156, theme.foam, 'Contributions', formatNumber(statistics.totalContributions), theme),
    generateCardSvg('sc2', 280, 156, theme.iris, 'Commits', formatNumber(statistics.totalCommits), theme),
    generateCardSvg('sc3', 40, 288, theme.gold, 'Stars', formatNumber(statistics.totalStars), theme),
    generateCardSvg('sc4', 280, 288, theme.pine, 'Repositories', formatNumber(statistics.totalRepos), theme),
    '    </g>',
  ].join('\n')
}

export function generateTopRepoSvg(
  repository: MostStarredRepo | null,
  theme: Record<string, string>,
): string {
  if (!repository)
    return ''

  const safeName = escapeSvg(repository.name)

  return [
    '    <g class="stagger delay-3">',
    `      <rect x="40" y="420" width="464" height="72" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" rx="16" filter="url(#shadow)" />`,
    `      <rect x="40" y="420" width="6" height="72" fill="${theme.gold}" clip-path="url(#repository-clip)" />`,
    '      <text x="64" y="446" class="text-subtle">Top Repository</text>',
    `      <text x="64" y="476" class="text-serif" font-size="28" fill="${theme.text}">${safeName}</text>`,
    `      <text x="480" y="474" class="text-main" fill="${theme.gold}" font-weight="bold" font-size="20" text-anchor="end">★ ${formatNumber(repository.stars)}</text>`,
    '    </g>',
  ].join('\n')
}

export function generateLangPanelSvg(
  slices: DonutSlice[],
  totalLanguages: number,
  avatarB64: string,
  theme: Record<string, string>,
): string {
  const paths = slices
    .filter(slice => slice.visible)
    .map((slice, index) => {
      const pathD = generateArcPath(728, 170, 75, 57, slice.startDegrees, slice.endDegrees)
      return `<path d="${pathD}" fill="${slice.color}" class="slice" style="animation-delay:${0.4 + index * 0.08}s"/>`
    })
    .join('')

  const bars = slices
    .slice(0, 5)
    .map((slice, index) => {
      const barY = 294 + index * 30
      const textY = 300 + index * 30
      const filledWidth = (slice.percentage / 100) * 140
      const safeName = escapeSvg(slice.name)

      return `
        <circle cx="572" cy="${textY}" r="4" fill="${slice.color}" />
        <text x="588" y="${textY}" class="text-main" font-size="12">${safeName}</text>
        <rect x="700" y="${barY}" width="140" height="4" fill="${theme.subtle}" fill-opacity="0.1" rx="2" />
        <rect x="700" y="${barY}" width="${filledWidth}" height="4" fill="${slice.color}" rx="2" class="bar-fill" style="animation-delay:${0.6 + index * 0.1}s" filter="url(#glow)" />
        <text x="890" y="${textY}" class="text-main" font-size="12" font-weight="600" fill="${slice.color}" text-anchor="end">${slice.percentage}%</text>
      `
    })
    .join('')

  return [
    '    <g class="stagger delay-4">',
    '      <clipPath id="lang-clip"><rect x="536" y="40" width="384" height="452" rx="24" /></clipPath>',
    `      <rect x="536" y="40" width="384" height="452" rx="24" fill="${theme.surface}" fill-opacity="0.6" stroke="${theme.subtle}" stroke-opacity="0.15" filter="url(#shadow)" />`,
    `      <rect x="536" y="40" width="384" height="4" fill="${theme.iris}" clip-path="url(#lang-clip)" />`,
    '      <text x="568" y="82" class="text-subtle">Languages</text>',
    `      <rect x="830" y="65" width="60" height="20" rx="10" fill="${theme.iris}" fill-opacity="0.1" stroke="${theme.iris}" stroke-opacity="0.2" />`,
    `      <text x="860" y="79" class="text-main" fill="${theme.iris}" font-size="10" text-anchor="middle">${totalLanguages} used</text>`,
    `      <circle cx="728" cy="170" r="66" fill="none" stroke="${theme.subtle}" stroke-opacity="0.05" stroke-width="18" />`,
    paths,
    avatarB64
      ? `      <image href="data:image/png;base64,${avatarB64}" x="680" y="122" width="96" height="96" clip-path="url(#donut-clip)" />`
      : '',
    `      <circle cx="728" cy="170" r="48" fill="none" stroke="${theme.surface}" stroke-width="3" />`,
    bars,
    '    </g>',
  ].join('\n')
}

export function assembleReadmeSvg(
  statistics: GithubStats,
  username: string,
  theme: Record<string, string>,
  monoB64: string,
  serifB64: string,
  avatarB64: string,
): string {
  const slices = buildDonutSlices(statistics.languages, theme)

  return [
    '<svg width="960" height="520" viewBox="0 0 960 520" fill="none" xmlns="http://www.w3.org/2000/svg">',
    generateSvgDefs(monoB64, serifB64, theme),
    `  <rect width="960" height="520" fill="${theme.base}" rx="20" />`,
    '  <rect width="960" height="520" fill="url(#aurora-p)" rx="20" />',
    '  <rect width="960" height="520" fill="url(#aurora-b)" rx="20" />',
    generateProfileSvg(statistics, username, theme),
    generateStatGridSvg(statistics, theme),
    generateTopRepoSvg(statistics.mostStarredRepo, theme),
    generateLangPanelSvg(slices, statistics.languages.length, avatarB64, theme),
    '</svg>',
  ].join('\n')
}
