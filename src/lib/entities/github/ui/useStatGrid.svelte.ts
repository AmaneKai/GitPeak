import type { GithubStats } from "$lib/entities/github/model/github-stats"
import { neutralTilt, applyTilt, type TiltState } from "$lib/shared/utils/tilt"
import {
	GitFork,
	Star,
	Users,
	GitCommit,
	GitPullRequest,
	CircleDot,
	BookOpen,
	Activity,
} from "lucide-svelte"

export type StatItem = {
	label: string
	value: number
	icon: unknown
	accentVar: string
}

export function heroItems(s: GithubStats): StatItem[] {
	return [
		{ label: "Contributions", value: s.totalContributions, icon: Activity, accentVar: "foam" },
		{ label: "Commits", value: s.totalCommits, icon: GitCommit, accentVar: "iris" },
	]
}

export function detailItems(s: GithubStats): StatItem[] {
	return [
		{ label: "Stars", value: s.totalStars, icon: Star, accentVar: "gold" },
		{ label: "Repos", value: s.totalRepos, icon: BookOpen, accentVar: "iris" },
		{ label: "Followers", value: s.followers, icon: Users, accentVar: "rose" },
		{ label: "PRs", value: s.totalPrs, icon: GitPullRequest, accentVar: "love" },
		{ label: "Issues", value: s.totalIssues, icon: CircleDot, accentVar: "gold" },
	]
}

const CARD_COUNT = 8

export function useStatGrid() {
	let tilts = $state<TiltState[]>(Array.from({ length: CARD_COUNT }, neutralTilt))

	return {
		get tilts() {
			return tilts
		},
		onMove(e: MouseEvent, i: number) {
			tilts[i] = applyTilt(e, e.currentTarget as HTMLElement)
		},
		onLeave(_e: MouseEvent, i: number) {
			tilts[i] = neutralTilt()
		},
	}
}
