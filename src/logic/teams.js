export const MAX_TEAM = 4

const shuffle = (arr, rng) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Team sizes: 3 each, leftovers go into teams of 4 (never above 4).
export function teamSizes(n) {
  if (n <= 0) return []
  if (n <= MAX_TEAM) return [n]
  const g = Math.floor(n / 3)
  const r = n % 3
  if (r === 2 && g === 1) return [3, 2]
  const sizes = Array(g).fill(3)
  for (let i = 0; i < r; i++) sizes[i]++
  return sizes
}

// Shuffles playerIds into teams. teamIds: team docs available (in order).
// Returns { assignment: { playerId: teamId|null }, groups, needTeams } where needTeams > 0 means
// the caller must create that many extra teams (players of those groups get teamId null until then).
export function autoAssign(playerIds, teamIds, rng = Math.random) {
  const order = shuffle(playerIds, rng)
  const groups = []
  let at = 0
  for (const s of teamSizes(order.length)) { groups.push(order.slice(at, at + s)); at += s }
  const assignment = {}
  groups.forEach((g, i) => g.forEach((id) => { assignment[id] = teamIds[i] ?? null }))
  return { assignment, groups, needTeams: Math.max(0, groups.length - teamIds.length) }
}
