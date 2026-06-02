export interface GitHubLanguage {
  name: string
  percentage: number
  color?: string
}

export interface InvolvedRepo {
  owner: string
  name: string
  primaryLanguage: string | null
  url: string
  lastContributedAt: string
  isOwned: boolean
  stars: number
}

export interface MostStarredRepo {
  name: string
  stars: number
  url: string
}

export interface GithubStats {
  displayName: string | null
  avatarUrl: string
  bio: string | null
  followers: number
  following: number
  accountCreatedAt: string
  languages: GitHubLanguage[]
  involvedRepos: InvolvedRepo[]
  mostStarredRepo: MostStarredRepo | null
  totalContributions: number
  totalCommits: number
  totalStars: number
  totalRepos: number
  totalPrs: number
  totalIssues: number
}
