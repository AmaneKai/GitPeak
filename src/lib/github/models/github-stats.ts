import { z } from 'zod'

export const gitHubLanguageSchema = z.object({
  name: z.string(),
  percentage: z.number(),
  color: z.string().optional(),
})

export const involvedRepoSchema = z.object({
  owner: z.string(),
  name: z.string(),
  primaryLanguage: z.string().nullable(),
  url: z.string(),
  lastContributedAt: z.string(),
  isOwned: z.boolean(),
  stars: z.number(),
})

export const mostStarredRepoSchema = z.object({
  name: z.string(),
  stars: z.number(),
  url: z.string(),
})

export const githubStatsSchema = z.object({
  displayName: z.string().nullable(),
  avatarUrl: z.string(),
  bio: z.string().nullable(),
  followers: z.number(),
  following: z.number(),
  accountCreatedAt: z.string(),
  languages: z.array(gitHubLanguageSchema),
  involvedRepos: z.array(involvedRepoSchema),
  mostStarredRepo: mostStarredRepoSchema.nullable(),
  totalContributions: z.number(),
  totalCommits: z.number(),
  totalStars: z.number(),
  totalRepos: z.number(),
  totalPrs: z.number(),
  totalIssues: z.number(),
})

export type GitHubLanguage = z.infer<typeof gitHubLanguageSchema>
export type InvolvedRepo = z.infer<typeof involvedRepoSchema>
export type MostStarredRepo = z.infer<typeof mostStarredRepoSchema>
export type GithubStats = z.infer<typeof githubStatsSchema>
