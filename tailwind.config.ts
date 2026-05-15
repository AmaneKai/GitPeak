import type { Config } from "tailwindcss"

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				text: "var(--color-text)",
				subtle: "var(--color-subtle)",
				muted: "var(--color-muted)",
				surface: "var(--color-surface)",
				overlay: "var(--color-overlay)",
				foam: "var(--color-foam)",
				gold: "var(--color-gold)",
				iris: "var(--color-iris)",
				rose: "var(--color-rose)",
				love: "var(--color-love)",
				pine: "var(--color-pine)",
			},
		},
	},
	plugins: [],
} satisfies Config
