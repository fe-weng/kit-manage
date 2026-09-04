export function formatPoints(points: number): string {
  if (points >= 0) return `+${points}`
  return `${points}`
}
