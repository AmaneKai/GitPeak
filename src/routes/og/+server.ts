import satori from "satori"
import { html } from "satori-html"
import { Resvg } from "@resvg/resvg-js"
import { fetchGithubStats } from "$lib/entities/github/api/github"
import { formatNumber } from "$lib/shared/utils/format"
import { COLORS } from "$lib/shared/utils/theme"
import type {
	GitHubLanguage,
	MostStarredRepo,
	GithubStats,
} from "$lib/entities/github/model/github-stats"

async function loadFont(family: string, weight: number) {
	const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&display=swap`
	const css = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
		},
	}).then((r) => r.text())

	const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
	if (!match) throw new Error(`Could not find TTF url for ${family}`)

	return await fetch(match[1]).then((r) => r.arrayBuffer())
}

function polarToXY(cx: number, cy: number, r: number, deg: number) {
	const rad = (deg * Math.PI) / 180
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, ro: number, ri: number, s: number, e: number) {
	const la = e - s > 180 ? 1 : 0
	const o1 = polarToXY(cx, cy, ro, s),
		o2 = polarToXY(cx, cy, ro, e)
	const i1 = polarToXY(cx, cy, ri, e),
		i2 = polarToXY(cx, cy, ri, s)
	return `M ${o1.x} ${o1.y} A ${ro} ${ro} 0 ${la} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${ri} ${ri} 0 ${la} 0 ${i2.x} ${i2.y} Z`
}

const accentVars = ["foam", "iris", "gold", "love", "rose", "pine"]

export async function GET({ url }) {
	const username = url.searchParams.get("username")
	if (!username) return new Response("Missing username", { status: 400 })

	const statsRes = await fetchGithubStats(username)
	if (!statsRes.ok) return new Response("User not found", { status: 404 })
	const stats = statsRes.data

	const [monoReg, monoBold, serifReg, fallbackFont] = await Promise.all([
		loadFont("JetBrains Mono", 400),
		loadFont("JetBrains Mono", 700),
		loadFont("Instrument Serif", 400),
		loadFont("Noto Sans JP", 400),
	])

	let cursor = -90
	const GAP_DEG = 2
	const pieSlices = (stats.languages || []).map((l, i) => {
		const span = (l.percentage / 100) * 360
		const startDeg = cursor + GAP_DEG / 2
		const endDeg = cursor + span - GAP_DEG / 2
		cursor += span
		return {
			...l,
			color: COLORS[accentVars[i % accentVars.length]],
			startDeg,
			endDeg,
		}
	})

	const template = `
		<div style="display: flex; flex-direction: row; width: 1200px; height: 630px; background-color: #191724; color: #e0def4; font-family: 'JetBrains Mono', 'Noto Sans JP', monospace; padding: 40px; box-sizing: border-box; justify-content: space-between;">
			
			<div style="display: flex; flex-direction: column; gap: 16px; width: 670px; height: 550px;">
				
				<div style="display: flex; align-items: center; gap: 24px; background-color: #1f1d2e; border: 1px solid #403d52; border-radius: 20px; padding: 24px; box-shadow: 0 16px 32px rgba(0,0,0,0.3);">
					<img src="${stats.avatarUrl}" style="width: 100px; height: 100px; border-radius: 20px; border: 3px solid #c4a7e7;" />
					<div style="display: flex; flex-direction: column; justify-content: center; width: 480px;">
						<div style="display: flex; font-family: 'Instrument Serif', 'Noto Sans JP'; font-size: 52px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #e0def4;">
							${stats.displayName || username}
						</div>
						<div style="display: flex; font-size: 20px; color: #908caa; margin-top: 8px;">@${username}</div>
					</div>
				</div>

				<div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%;">
					<div style="display: flex; flex-direction: column; background-color: #1f1d2e; border: 1px solid #403d52; border-top: 4px solid #9ccfd8; border-radius: 16px; width: 327px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
						<span style="font-size: 13px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">Contributions</span>
						<span style="font-family: 'Instrument Serif'; font-size: 48px; color: #e0def4; margin-top: 4px;">${formatNumber(stats.totalContributions)}</span>
					</div>
					<div style="display: flex; flex-direction: column; background-color: #1f1d2e; border: 1px solid #403d52; border-top: 4px solid #c4a7e7; border-radius: 16px; width: 327px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
						<span style="font-size: 13px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">Commits</span>
						<span style="font-family: 'Instrument Serif'; font-size: 48px; color: #e0def4; margin-top: 4px;">${formatNumber(stats.totalCommits)}</span>
					</div>
					<div style="display: flex; flex-direction: column; background-color: #1f1d2e; border: 1px solid #403d52; border-top: 4px solid #f6c177; border-radius: 16px; width: 327px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
						<span style="font-size: 13px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">Stars</span>
						<span style="font-family: 'Instrument Serif'; font-size: 48px; color: #e0def4; margin-top: 4px;">${formatNumber(stats.totalStars)}</span>
					</div>
					<div style="display: flex; flex-direction: column; background-color: #1f1d2e; border: 1px solid #403d52; border-top: 4px solid #31748f; border-radius: 16px; width: 327px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
						<span style="font-size: 13px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">Repositories</span>
						<span style="font-family: 'Instrument Serif'; font-size: 48px; color: #e0def4; margin-top: 4px;">${formatNumber(stats.totalRepos)}</span>
					</div>
				</div>

				${
					stats.mostStarredRepo
						? `
					<div style="display: flex; justify-content: space-between; align-items: center; background-color: #1f1d2e; border: 1px solid #f6c17740; border-left: 6px solid #f6c177; border-radius: 16px; padding: 20px 24px; box-shadow: 0 16px 32px rgba(0,0,0,0.3);">
						<div style="display: flex; flex-direction: column; width: 440px;">
							<span style="font-size: 12px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">★ Top Repository</span>
							<span style="display: flex; font-family: 'Instrument Serif', 'Noto Sans JP'; font-size: 34px; color: #e0def4; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${stats.mostStarredRepo.name}</span>
						</div>
						<div style="display: flex; font-size: 24px; color: #f6c177; font-weight: bold;">
							★ ${formatNumber(stats.mostStarredRepo.stars)}
						</div>
					</div>
				`
						: ""
				}

			</div>

			<div style="display: flex; flex-direction: column; align-items: center; width: 420px; height: 550px; background-color: #1f1d2e; border: 1px solid #c4a7e730; border-top: 4px solid #c4a7e7; border-radius: 20px; padding: 32px; box-shadow: 0 16px 32px rgba(0,0,0,0.4); box-sizing: border-box;">
				
				<div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 32px;">
					<span style="font-size: 13px; color: #908caa; text-transform: uppercase; letter-spacing: 2px;">Languages</span>
					<div style="display: flex; background-color: #c4a7e715; border: 1px solid #c4a7e740; border-radius: 12px; padding: 4px 12px; color: #c4a7e7; font-size: 12px;">
						${stats.languages.length} used
					</div>
				</div>

				<div style="display: flex; position: relative; width: 200px; height: 200px; align-items: center; justify-content: center;">
					<svg width="200" height="200" viewBox="0 0 200 200" style="position: absolute; top: 0; left: 0;">
						<circle cx="100" cy="100" r="75" fill="none" stroke="rgba(144,140,170,0.1)" stroke-width="38" />
						${pieSlices
							.map(
								(s) => `
							<path d="${arcPath(100, 100, 94, 56, s.startDeg, s.endDeg)}" fill="${s.color}" />
						`,
							)
							.join("")}
					</svg>
					<img src="${stats.avatarUrl}" style="width: 90px; height: 90px; border-radius: 45px; border: 4px solid #1f1d2e;" />
				</div>

				<div style="display: flex; flex-direction: column; width: 100%; margin-top: 40px; gap: 16px;">
					${pieSlices
						.slice(0, 5)
						.map(
							(s) => `
						<div style="display: flex; align-items: center; width: 100%; gap: 12px;">
							<div style="display: flex; width: 12px; height: 12px; border-radius: 6px; background-color: ${s.color};"></div>
							<span style="display: flex; font-size: 15px; font-weight: bold; color: #e0def4; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</span>
							<div style="display: flex; align-items: center; width: 100px;">
								<div style="display: flex; width: 100%; height: 6px; background-color: #403d52; border-radius: 3px;">
									<div style="display: flex; width: ${s.percentage}%; height: 100%; background-color: ${s.color}; border-radius: 3px;"></div>
								</div>
							</div>
							<span style="display: flex; justify-content: flex-end; font-size: 14px; font-weight: bold; color: ${s.color}; width: 40px;">${s.percentage}%</span>
						</div>
					`,
						)
						.join("")}
				</div>

			</div>
		</div>
	`

	const markup = html(template)
	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "JetBrains Mono", data: monoReg, weight: 400, style: "normal" },
			{ name: "JetBrains Mono", data: monoBold, weight: 700, style: "normal" },
			{ name: "Instrument Serif", data: serifReg, weight: 400, style: "normal" },
			{ name: "Noto Sans JP", data: fallbackFont, weight: 400, style: "normal" },
		],
	})

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
	const pngBuffer = resvg.render().asPng()

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
		},
	})
}
