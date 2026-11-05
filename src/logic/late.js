export function pickSeat(tables, scored) {
  return tables
    .map((t, i) => ({ i, n: t.teams.length, scored: !!scored[i] }))
    .filter((x) => x.n < 3)
    .sort((a, b) => a.scored - b.scored || a.n - b.n)[0] ?? null
}

// A team opened mid-game starts level with the lowest-scoring team that has players.
export const lowestPoints = (teams) => {
  const live = teams.filter((t) => t.members?.length)
  return live.length ? Math.min(...live.map((t) => t.points ?? 0)) : 0
}
