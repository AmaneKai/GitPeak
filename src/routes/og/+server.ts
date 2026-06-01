import satori from 'satori'

type FontOptions = NonNullable<Parameters<typeof satori>[1]['fonts']>[number]
import { Resvg } from '@resvg/resvg-js'
import { createGithubClient } from '$lib/github/api/github-client'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import { generateOgHtml } from '$lib/readme/og-generator'
import type { GitHubLanguage } from '$lib/github/models/github-stats'
import type { RequestHandler } from './$types'

const ACCENT_KEYS = ['foam', 'iris', 'gold', 'love', 'rose', 'pine']
const DONUT_GAP_DEGREES = 2
const MIN_SLICE_DEGREES = DONUT_GAP_DEGREES + 1

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  const familyQuery = family.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${familyQuery}:wght@${weight}&display=swap`
  const userAgent = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) ',
    'AppleWebKit/533.21.1 (KHTML, like Gecko) ',
    'Version/5.0.5 Safari/533.21.1',
  ].join('')

  try {
    const css = await fetch(url, { headers: { 'User-Agent': userAgent } }).then(r => r.text())
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)

    if (!match)
      return null

    return fetch(match[1]).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

function polarToXY(centerX: number, centerY: number, radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) }
}

function arcPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  const outerStart = polarToXY(centerX, centerY, outerRadius, startAngle)
  const outerEnd = polarToXY(centerX, centerY, outerRadius, endAngle)
  const innerStart = polarToXY(centerX, centerY, innerRadius, endAngle)
  const innerEnd = polarToXY(centerX, centerY, innerRadius, startAngle)

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ')
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')
  if (!username)
    return new Response('Missing username', { status: 400 })

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  const client = createGithubClient({
    apiUrl: 'https://ghfetch.carlosranara.workers.dev/v1/stats',
    requestTimeoutMilliseconds: 8000,
  })

  const statsRes = await client.fetchStats(username)
  if (!statsRes.ok)
    return new Response('User not found', { status: 404 })

  const stats = statsRes.value

  const fontResults = await Promise.allSettled([
    loadFont('JetBrains Mono', 400),
    loadFont('JetBrains Mono', 700),
    loadFont('Instrument Serif', 400),
    loadFont('Noto Sans JP', 400),
  ])

  const [monoReg, monoBold, serifReg, fallbackFont] = fontResults.map(result =>
    result.status === 'fulfilled' ? result.value : null,
  )

  let cursorAngle = -90

  const pieSlices = (stats.languages || []).flatMap((language: GitHubLanguage, index: number) => {
    const spanAngle = (language.percentage / 100) * 360
    if (spanAngle <= MIN_SLICE_DEGREES) 
      return []
    const startAngle = cursorAngle + DONUT_GAP_DEGREES / 2
    const endAngle = cursorAngle + spanAngle - DONUT_GAP_DEGREES / 2
    cursorAngle += spanAngle

    const accentKey = ACCENT_KEYS[index % ACCENT_KEYS.length]

    return [{
      ...language,
      color: theme[accentKey],
      startAngle,
      endAngle,
    }]
  })

  const pieSlicesHtml = pieSlices
    .map(slice => {
      const pathD = arcPath(100, 100, 94, 56, slice.startAngle, slice.endAngle)
      return `<path d="${pathD}" fill="${slice.color}" />`
    })
    .join('')

  const barsHtml = pieSlices
    .slice(0, 5)
    .map(slice => {
      const dot = [
        'display: flex;',
        'width: 12px;',
        'height: 12px;',
        'border-radius: 6px;',
        `background-color: ${slice.color};`,
      ].join(' ')

      const label = [
        'display: flex;',
        'font-size: 15px;',
        'font-weight: bold;',
        'color: #e0def4;',
        'flex: 1;',
        'white-space: nowrap;',
        'overflow: hidden;',
        'text-overflow: ellipsis;',
      ].join(' ')

      const barTrack = [
        'display: flex;',
        'width: 100%;',
        'height: 6px;',
        'background-color: #403d52;',
        'border-radius: 3px;',
      ].join(' ')

      const barFill = [
        'display: flex;',
        `width: ${slice.percentage}%;`,
        'height: 100%;',
        `background-color: ${slice.color};`,
        'border-radius: 3px;',
      ].join(' ')

      const pct = [
        'display: flex;',
        'justify-content: flex-end;',
        'font-size: 14px;',
        'font-weight: bold;',
        `color: ${slice.color};`,
        'width: 40px;',
      ].join(' ')

      return [
        '<div style="display: flex; align-items: center; width: 100%; gap: 12px;">',
        `  <div style="${dot}"></div>`,
        `  <span style="${label}">${slice.name}</span>`,
        '  <div style="display: flex; align-items: center; width: 100px;">',
        `    <div style="${barTrack}">`,
        `      <div style="${barFill}"></div>`,
        '    </div>',
        '  </div>',
        `  <span style="${pct}">${slice.percentage}%</span>`,
        '</div>',
      ].join('\n')
    })
    .join('')

  const markup = generateOgHtml(stats, username, pieSlicesHtml, barsHtml)

  const fontDefs: Array<[string, number, ArrayBuffer]> = [
    ['JetBrains Mono', 400, monoReg],
    ['JetBrains Mono', 700, monoBold],
    ['Instrument Serif', 400, serifReg],
    ['Noto Sans JP', 400, fallbackFont],
  ].filter((entry): entry is [string, number, ArrayBuffer] => entry[2] !== null)

  const fonts: FontOptions[] = fontDefs.map(([name, weight, data]) => ({
    name,
    data,
    weight: weight as FontOptions['weight'],
    style: 'normal' as const,
  }))

  const svg = await satori(markup, { width: 1200, height: 630, fonts })

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const pngBuffer = resvg.render().asPng()

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
