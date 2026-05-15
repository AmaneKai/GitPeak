import { z } from "zod"

export const GitHubLanguageSchema = z.object({
	name: z.string(),
	percentage: z.number(),
	color: z.string().optional(),
})

export const MostStarredRepoSchema = z.object({
	name: z.string(),
	stars: z.number(),
	url: z.string().url(),
})

export const GithubStatsSchema = z.object({
	totalRepos: z.number(),
	totalContributions: z.number(),
	totalStars: z.number(),
	followers: z.number(),
	following: z.number(),
	totalCommits: z.number(),
	totalPrs: z.number(),
	totalIssues: z.number(),
	accountCreatedAt: z.string(),
	mostStarredRepo: MostStarredRepoSchema.nullable(),
	avatarUrl: z.string().url(),
	displayName: z.string(),
	bio: z.string(),
	languages: z.array(GitHubLanguageSchema),
})

export type GitHubLanguage = z.infer<typeof GitHubLanguageSchema>
export type MostStarredRepo = z.infer<typeof MostStarredRepoSchema>
export type GithubStats = z.infer<typeof GithubStatsSchema>
