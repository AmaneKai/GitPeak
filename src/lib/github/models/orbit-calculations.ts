import { pickAccentColor } from '$lib/theme/theme-manager'
import type { InvolvedRepo, GitHubLanguage } from './github-stats'

export interface OrbitNode extends InvolvedRepo {
  positionX: number
  positionY: number
  orbitRadius: number
  relativeTimeLabel: string
  coreSizePixels: number
  haloSizePixels: number
  languageColor: string
}

function getLanguageColor(
  languageName: string | null | undefined,
  allLanguages: GitHubLanguage[],
): string {
  if (!languageName) return 'var(--iris)'

  const languageIndex = allLanguages.findIndex(
    (language) => language.name.toLowerCase() === languageName.toLowerCase(),
  )

  if (languageIndex !== -1) return pickAccentColor(languageIndex)

  let stringHash = 0
  for (let index = 0; index < languageName.length; index++)
    stringHash = languageName.charCodeAt(index) + ((stringHash << 5) - stringHash)

  return pickAccentColor(Math.abs(stringHash))
}

export function calculateOrbitNodes(
  repositories: InvolvedRepo[],
  allLanguages: GitHubLanguage[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
): OrbitNode[] {
  if (repositories.length === 0) return []

  const parsedRepositories = repositories
    .map((repository) => ({
      ...repository,
      timestampMs: Date.parse(repository.lastContributedAt),
    }))
    .sort((a, b) => b.timestampMs - a.timestampMs)

  const currentTimeMs = Date.now()
  const timestamps = parsedRepositories.map((repo) => repo.timestampMs)
  const newestTimestampMs = Math.max(...timestamps)
  const oldestTimestampMs = Math.min(...timestamps)
  const timeSpanMs = newestTimestampMs - oldestTimestampMs || 1

  const minOrbitRadius = innerRadius + 10
  const maxOrbitRadius = outerRadius + 12
  const repositoryCount = parsedRepositories.length

  const coreSizePixels = Math.max(1.8, Math.min(3.5, 24 / repositoryCount))
  const haloSizePixels = coreSizePixels * 2

  return parsedRepositories.map((repository, index) => {
    const timeProgress = (repository.timestampMs - oldestTimestampMs) / timeSpanMs
    const orbitRadius = maxOrbitRadius - (maxOrbitRadius - minOrbitRadius) * timeProgress

    const angleDegrees = index * (360 / repositoryCount) - 90
    const angleRadians = (angleDegrees * Math.PI) / 180

    const positionX = centerX + orbitRadius * Math.cos(angleRadians)
    const positionY = centerY + orbitRadius * Math.sin(angleRadians)

    const ageInDays = Math.max(
      0,
      Math.floor((currentTimeMs - repository.timestampMs) / (1000 * 60 * 60 * 24)),
    )

    let relativeTimeLabel = `${ageInDays}d ago`
    if (ageInDays === 0) relativeTimeLabel = 'today'
    if (ageInDays === 1) relativeTimeLabel = 'yesterday'

    return {
      ...repository,
      positionX,
      positionY,
      orbitRadius,
      relativeTimeLabel,
      coreSizePixels,
      haloSizePixels,
      languageColor: getLanguageColor(repository.primaryLanguage, allLanguages),
    }
  })
}
