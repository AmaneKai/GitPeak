import type { GithubStats } from '$lib/github/models/github-stats'
import { neutralTilt, applyTilt, type TiltState } from '$lib/ui/interactions/mouse-tilt'
import {
  Star,
  Users,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  BookOpen,
  Activity,
} from 'lucide-svelte'

export type StatItem = {
  label: string
  value: number
  icon: unknown
  accentVar: string
}

export function heroItems(s: GithubStats): StatItem[] {
  return [
    { label: 'Contributions', value: s.totalContributions, icon: Activity, accentVar: 'foam' },
    { label: 'Commits', value: s.totalCommits, icon: GitCommitHorizontal, accentVar: 'iris' },
  ]
}

export function detailItems(s: GithubStats): StatItem[] {
  return [
    { label: 'Stars', value: s.totalStars, icon: Star, accentVar: 'gold' },
    { label: 'Repos', value: s.totalRepos, icon: BookOpen, accentVar: 'iris' },
    { label: 'Followers', value: s.followers, icon: Users, accentVar: 'rose' },
    { label: 'PRs', value: s.totalPrs, icon: GitPullRequest, accentVar: 'love' },
    { label: 'Issues', value: s.totalIssues, icon: CircleDot, accentVar: 'gold' },
  ]
}

const CARD_COUNT = 8

export function useStatGrid() {
  const tilts = $state<TiltState[]>(Array.from({ length: CARD_COUNT }, neutralTilt))

  return {
    get tilts() {
      return tilts
    },
    onMove(e: MouseEvent, index: number) {
      tilts[index] = applyTilt(e, e.currentTarget as HTMLElement)
    },
    onLeave(_e: MouseEvent, index: number) {
      tilts[index] = neutralTilt()
    },
  }
}
