import type { ThemeTokens } from '$lib/theme/theme-manager'

// Deliberately separate from readme-font-styles.ts's .text-serif (Instrument Serif) — the
// wallpaper matches the live dashboard's actual font-serif look (Georgia-style via Gelasio),
// not the README/OG card's look. See getWallpaperFontFiles() for why.
export function buildWallpaperStyles(theme: ThemeTokens): string {
  return `
    .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: ${theme.text}; }
    .text-serif { font-family: 'Gelasio', 'Noto Serif JP', serif; fill: ${theme.text}; }
  `
}
