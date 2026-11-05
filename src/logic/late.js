export function pickSeat(tables, scored) {
  return tables
    .map((t, i) => ({ i, n: t.teams.length, scored: !!scored[i] }))
    .filter((x) => x.n < 3)
    .sort((a, b) => a.scored - b.scored || a.n - b.n)[0] ?? null
}

export const averagePoints = (teams) =>
  teams.length ? Math.round(teams.reduce((a, t) => a + t.points, 0) / teams.length) : 0
