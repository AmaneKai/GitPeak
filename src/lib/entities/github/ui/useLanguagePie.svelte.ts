import type { GitHubLanguage } from "$lib/entities/github/model/github-stats"
import { pickAccentColor } from "$lib/shared/utils/theme"

export type Slice = GitHubLanguage & {
	color: string
	startDeg: number
	endDeg: number
	midDeg: number
}

const GAP_DEG = 1.8
const PUSH = 7

export function getDims(isMobile: boolean) {
	const SIZE = isMobile ? 160 : 200
	const R_OUTER = isMobile ? 75 : 90
	const R_INNER = isMobile ? 48 : 57
	return { SIZE, CX: SIZE / 2, CY: SIZE / 2, R_OUTER, R_INNER }
}

function polarToXY(cx: number, cy: number, r: number, deg: number) {
	const rad = (deg * Math.PI) / 180
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function arcPath(
	cx: number,
	cy: number,
	ro: number,
	ri: number,
	s: number,
	e: number,
	ox = 0,
	oy = 0,
): string {
	const la = e - s > 180 ? 1 : 0
	const o1 = polarToXY(cx, cy, ro, s),
		o2 = polarToXY(cx, cy, ro, e)
	const i1 = polarToXY(cx, cy, ri, e),
		i2 = polarToXY(cx, cy, ri, s)
	return [
		`M ${o1.x + ox} ${o1.y + oy}`,
		`A ${ro} ${ro} 0 ${la} 1 ${o2.x + ox} ${o2.y + oy}`,
		`L ${i1.x + ox} ${i1.y + oy}`,
		`A ${ri} ${ri} 0 ${la} 0 ${i2.x + ox} ${i2.y + oy}`,
		"Z",
	].join(" ")
}

export function segOffset(slice: Slice): { x: number; y: number } {
	const rad = (slice.midDeg * Math.PI) / 180
	return { x: Math.cos(rad) * PUSH, y: Math.sin(rad) * PUSH }
}

export function buildSlices(langs: GitHubLanguage[]): Slice[] {
	if (!langs?.length) return []
	let cursor = -90
	return langs.map((l, i) => {
		const span = (l.percentage / 100) * 360
		const startDeg = cursor + GAP_DEG / 2
		const endDeg = cursor + span - GAP_DEG / 2
		const midDeg = cursor + span / 2
		cursor += span
		return { ...l, color: pickAccentColor(i), startDeg, endDeg, midDeg }
	})
}

export function useLanguagePie(getLanguages: () => GitHubLanguage[]) {
	const isMobile = typeof window !== "undefined" && window.innerWidth < 640
	const dims = getDims(isMobile)

	let hovered = $state<number | null>(null)
	let sweepDeg = $state(-90)
	const slices = $derived(buildSlices(getLanguages()))

	$effect(() => {
		const DURATION = 1200
		const start = performance.now()
		let raf: number

		function tick(now: number) {
			const t = Math.min((now - start) / DURATION, 1)
			const eased = 1 - Math.pow(1 - t, 3)
			sweepDeg = -90 + eased * 360
			if (t < 1) raf = requestAnimationFrame(tick)
		}

		raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(raf)
	})

	const animatedSlices = $derived(
		slices
			.filter((s) => sweepDeg > s.startDeg)
			.map((s) => ({ ...s, endDeg: Math.min(s.endDeg, sweepDeg) })),
	)

	return {
		dims,
		get hovered() {
			return hovered
		},
		get slices() {
			return slices
		},
		get animatedSlices() {
			return animatedSlices
		},
		onEnter(i: number) {
			hovered = i
		},
		onLeave() {
			hovered = null
		},
	}
}
