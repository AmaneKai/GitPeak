import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function fetchAsDataUri(url: string | null | undefined): Promise<string> {
  if (!url) return ''

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!response.ok) return ''

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
  } catch {
    return ''
  }
}

async function fetchFontArrayBuffer(family: string, weight: number): Promise<ArrayBuffer | null> {
  const familyQuery = family.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${familyQuery}:wght@${weight}&display=swap`
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8)'

  try {
    const css = await fetch(url, { headers: { 'User-Agent': userAgent } }).then((r) => r.text())
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)

    if (!match) {
      console.warn(`[readme] Could not parse font URL for ${family} ${weight}`)
      return null
    }

    const response = await fetch(match[1])
    if (!response.ok) return null

    return await response.arrayBuffer()
  } catch (error) {
    console.warn(`[readme] Font load failed for ${family} ${weight}:`, error)
    return null
  }
}

let fontCache: Promise<{ mono: string; serif: string }> | null = null

// Base64-embedded fonts for the SVG served directly to browsers (api/readme).
export function getReadmeFonts(): Promise<{ mono: string; serif: string }> {
  fontCache ??= Promise.all([
    fetchFontArrayBuffer('JetBrains Mono', 400),
    fetchFontArrayBuffer('Instrument Serif', 400),
  ]).then(([mono, serif]) => ({
    mono: mono ? Buffer.from(mono).toString('base64') : '',
    serif: serif ? Buffer.from(serif).toString('base64') : '',
  }))

  return fontCache
}

let ogFontFileCache: Promise<{ mono: string; serif: string; jp: string; serifJp: string }> | null =
  null

// On-disk font files for resvg (og, wallpaper), which registers fonts via `font.fontFiles`
// paths rather than resolving @font-face data URIs embedded in the SVG. `serifJp` (Noto Serif
// JP) is the CJK fallback for .text-serif specifically — pairing Instrument Serif's thin serif
// strokes with a *sans* CJK fallback (Noto Sans JP) reads as two mismatched typefaces glued
// together whenever a display name mixes scripts.
export function getOgFontFiles(): Promise<{
  mono: string
  serif: string
  jp: string
  serifJp: string
}> {
  ogFontFileCache ??= (async () => {
    const [mono, serif, jp, serifJp] = await Promise.all([
      fetchFontArrayBuffer('JetBrains Mono', 400),
      fetchFontArrayBuffer('Instrument Serif', 400),
      fetchFontArrayBuffer('Noto Sans JP', 400),
      fetchFontArrayBuffer('Noto Serif JP', 400),
    ])

    const entries: Array<[keyof typeof paths, ArrayBuffer | null, string]> = [
      ['mono', mono, 'gitpeak-og-jetbrains-mono.ttf'],
      ['serif', serif, 'gitpeak-og-instrument-serif.ttf'],
      ['jp', jp, 'gitpeak-og-noto-sans-jp.ttf'],
      ['serifJp', serifJp, 'gitpeak-og-noto-serif-jp.ttf'],
    ]
    const paths = { mono: '', serif: '', jp: '', serifJp: '' }

    await Promise.all(
      entries.map(async ([key, buffer, filename]) => {
        if (!buffer) return
        const filePath = join(tmpdir(), filename)
        await writeFile(filePath, Buffer.from(buffer))
        paths[key] = filePath
      }),
    )

    return paths
  })()

  return ogFontFileCache
}

export interface WallpaperFontFiles {
  mono: string
  bookSerif: string
  bookSerifBold: string
  jp: string
  serifJp: string
  serifJpBold: string
}

let wallpaperFontFileCache: Promise<WallpaperFontFiles> | null = null

// The wallpaper matches the live dashboard's actual `font-serif` look (a plain Georgia/Times
// book-serif — Tailwind's `font-serif` utility isn't wired to Instrument Serif there, see
// app.css), not the README/OG card's Instrument Serif treatment. Gelasio is a Google Fonts
// metric- and shape-compatible substitute for Georgia, so this renders the same regardless of
// the server's OS instead of depending on whatever system serif happens to be installed.
// Both weights are fetched for the CJK fallback too — requesting font-weight 700 text with only
// a 400-weight CJK file registered leaves resvg unable to match that family+weight combo for
// CJK glyphs specifically, and it falls back badly for just those characters.
export function getWallpaperFontFiles(): Promise<WallpaperFontFiles> {
  wallpaperFontFileCache ??= (async () => {
    const [mono, bookSerif, bookSerifBold, jp, serifJp, serifJpBold] = await Promise.all([
      fetchFontArrayBuffer('JetBrains Mono', 400),
      fetchFontArrayBuffer('Gelasio', 400),
      fetchFontArrayBuffer('Gelasio', 700),
      fetchFontArrayBuffer('Noto Sans JP', 400),
      fetchFontArrayBuffer('Noto Serif JP', 400),
      fetchFontArrayBuffer('Noto Serif JP', 700),
    ])

    const entries: Array<[keyof WallpaperFontFiles, ArrayBuffer | null, string]> = [
      ['mono', mono, 'gitpeak-wp-jetbrains-mono.ttf'],
      ['bookSerif', bookSerif, 'gitpeak-wp-gelasio.ttf'],
      ['bookSerifBold', bookSerifBold, 'gitpeak-wp-gelasio-bold.ttf'],
      ['jp', jp, 'gitpeak-wp-noto-sans-jp.ttf'],
      ['serifJp', serifJp, 'gitpeak-wp-noto-serif-jp.ttf'],
      ['serifJpBold', serifJpBold, 'gitpeak-wp-noto-serif-jp-bold.ttf'],
    ]
    const paths: WallpaperFontFiles = {
      mono: '',
      bookSerif: '',
      bookSerifBold: '',
      jp: '',
      serifJp: '',
      serifJpBold: '',
    }

    await Promise.all(
      entries.map(async ([key, buffer, filename]) => {
        if (!buffer) return
        const filePath = join(tmpdir(), filename)
        await writeFile(filePath, Buffer.from(buffer))
        paths[key] = filePath
      }),
    )

    return paths
  })()

  return wallpaperFontFileCache
}
