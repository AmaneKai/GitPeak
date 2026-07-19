import { pickAccentColor } from '$lib/theme/theme-manager'
import type { Collaborator } from './github-stats'

export interface CollaboratorOrbitNode extends Collaborator {
  positionX: number
  positionY: number
  orbitRadius: number
  coreSizePixels: number
  haloSizePixels: number
  accentColor: string
}

// GitHub Actions / Dependabot etc. can show up as "collaborators" in raw commit data but
// aren't people — keep them out of the orbit.
function isBotAccount(login: string): boolean {
  return login.endsWith('[bot]')
}

export function calculateCollaboratorOrbitNodes(
  collaborators: Collaborator[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
): CollaboratorOrbitNode[] {
  const realCollaborators = collaborators.filter(
    (collaborator) => !isBotAccount(collaborator.login),
  )
  if (realCollaborators.length === 0) return []

  const sortedCollaborators = [...realCollaborators].sort((a, b) => b.commits - a.commits)
  const collaboratorCount = sortedCollaborators.length

  const commitCounts = sortedCollaborators.map((collaborator) => collaborator.commits)
  const logMaxCommits = Math.log(Math.max(...commitCounts) + 1)
  const logMinCommits = Math.log(Math.min(...commitCounts) + 1)
  const logSpan = logMaxCommits - logMinCommits || 1

  const minOrbitRadius = innerRadius + 10
  const maxOrbitRadius = outerRadius + 12

  const totalCommits = commitCounts.reduce((sum, commits) => sum + commits, 0) || 1

  return sortedCollaborators.map((collaborator, index) => {
    const logCommits = Math.log(collaborator.commits + 1)
    const collaborationStrength = (logCommits - logMinCommits) / logSpan
    const orbitRadius = maxOrbitRadius - (maxOrbitRadius - minOrbitRadius) * collaborationStrength

    const angleDegrees = index * (360 / collaboratorCount) - 90
    const angleRadians = (angleDegrees * Math.PI) / 180

    const positionX = centerX + orbitRadius * Math.cos(angleRadians)
    const positionY = centerY + orbitRadius * Math.sin(angleRadians)

    const commitShare = collaborator.commits / totalCommits
    const coreSizePixels = Math.max(2.5, Math.min(6, 2.5 + Math.sqrt(commitShare) * 10))
    const haloSizePixels = coreSizePixels * 2

    return {
      ...collaborator,
      positionX,
      positionY,
      orbitRadius,
      coreSizePixels,
      haloSizePixels,
      accentColor: pickAccentColor(index),
    }
  })
}
