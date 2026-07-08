import { render } from 'svelte/server'
import { createGithubClient } from '$lib/github/api/github-client'
import { PRESET_THEMES } from '$lib/theme/theme-manager'
import ReadmeCard from '$lib/readme/ReadmeCard.svelte'
import { buildReadmeFontStyles } from '$lib/readme/readme-font-styles'
import type { RequestHandler } from './$types'

let fontCache: Promise<{ mono: string; serif: string }> | null = null

async function fetchBase64(url: string | null | undefined): Promise<string> {
  if (!url)
    return ''

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!response.ok)
      return ''

    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer).toString('base64')
  } catch {
    return ''
  }
}

async function fetchAsDataUri(url: string | null | undefined): Promise<string> {
  if (!url)
    return ''

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!response.ok)
      return ''

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
  } catch {
    return ''
  }
}

async function loadFontB64(family: string, weight: number): Promise<string> {
  const familyQuery = family.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${familyQuery}:wght@${weight}&display=swap`
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)'

  try {
    const css = await fetch(url, { headers: { 'User-Agent': userAgent } }).then(r => r.text())
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)

    if (!match) {
      console.warn(`[readme] Could not parse font URL for ${family} ${weight}`)
      return ''
    }

    return fetchBase64(match[1])
  } catch (error) {
    console.warn(`[readme] Font load failed for ${family} ${weight}:`, error)
    return ''
  }
}

function getFonts(): Promise<{ mono: string; serif: string }> {
  fontCache ??= Promise.all([
    loadFontB64('JetBrains Mono', 400),
    loadFontB64('Instrument Serif', 400),
  ]).then(([mono, serif]) => ({ mono, serif }))

  return fontCache
}

export const GET: RequestHandler = async (event) => {
  const username = event.url.searchParams.get('username')?.trim()
  if (!username)
    return new Response('Missing username', { status: 400 })

  const requestedTheme = event.url.searchParams.get('theme') || 'Rosé Pine'
  const theme = PRESET_THEMES[requestedTheme] || PRESET_THEMES['Rosé Pine']

  const client = createGithubClient({
    apiUrl: 'https://ghfetch.carlosranara.workers.dev/v1/stats',
    requestTimeoutMilliseconds: 8000,
  })

  const result = await client.fetchStats(username)
  if (!result.ok)
    return new Response('User not found', { status: 404 })

  const statistics = result.value
  statistics.languages = Array.isArray(statistics.languages) ? statistics.languages : []

  const [{ mono: monoB64, serif: serifB64 }, avatarDataUri] = await Promise.all([
    getFonts(),
    fetchAsDataUri(statistics.avatarUrl),
  ])

  const { body } = render(ReadmeCard, { props: { statistics, username, theme, avatarDataUri } })
  const fontStyles = buildReadmeFontStyles(monoB64, serifB64, theme)
  const svg = body.replace('<defs>', `<defs><style>${fontStyles}</style>`)

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  })
}
