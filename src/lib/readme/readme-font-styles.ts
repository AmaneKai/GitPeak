import type { ThemeTokens } from '$lib/theme/theme-manager'

export function buildReadmeFontStyles(
  monoFontB64: string,
  serifFontB64: string,
  theme: ThemeTokens,
): string {
  return `
    @font-face {
      font-family: 'JetBrains Mono';
      src: url(data:font/truetype;charset=utf-8;base64,${monoFontB64}) format('truetype');
    }
    @font-face {
      font-family: 'Instrument Serif';
      src: url(data:font/truetype;charset=utf-8;base64,${serifFontB64}) format('truetype');
    }
    .text-main { font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; fill: ${theme.text}; }
    .text-serif { font-family: 'Instrument Serif', 'Noto Sans JP', serif; fill: ${theme.text}; }
    .text-subtle {
      font-family: 'JetBrains Mono', monospace;
      fill: ${theme.subtle};
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.7); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes growX {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }
    .stagger { animation: fadeUp 0.5s ease-out forwards; }
    .delay-1 { animation-delay: 0.05s; }
    .delay-2 { animation-delay: 0.15s; }
    .delay-3 { animation-delay: 0.25s; }
    .delay-4 { animation-delay: 0.35s; }
    .anim-card { animation: fadeUp 0.45s ease-out forwards; }
    .anim-row { animation: fadeUp 0.35s ease-out forwards; }
    .anim-slice { animation: popIn 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards; }
    .bar-fill { animation: growX 0.5s ease-out forwards; }
  `
}
