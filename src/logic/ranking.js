const c = (x) => (Number.isFinite(x) ? x : 1e9)
const cmp = (a, b) => b.points - a.points || c(a.cards) - c(b.cards)

export function rankLeague(teams, lastCards) {
  return teams.map((t) => ({ ...t, cards: lastCards[t.id] })).sort(cmp)
}

export function findCut(ranked, n = 3) {
  if (ranked.length <= n) return { finalists: ranked, tie: null }
  const edge = ranked[n - 1]
  if (cmp(edge, ranked[n]) !== 0) return { finalists: ranked.slice(0, n), tie: null }
  const above = ranked.filter((t) => cmp(t, edge) < 0)
  return { finalists: above, tie: { teams: ranked.filter((t) => cmp(t, edge) === 0), spots: n - above.length } }
}

export function finalistPlan(session, teams, scores, n = 3) {
  const last = String(session?.rounds ?? 3)
  const lastCards = {}
  for (const [k, v] of Object.entries(scores)) if (k.startsWith(`${last}_`)) Object.assign(lastCards, v.cards ?? {})
  const { finalists, tie } = findCut(rankLeague(teams.filter((t) => t.members?.length), lastCards), n)
  if (!tie) return { finalists, tie: null, state: 'clear' }
  if (tie.teams.length > 3) return { finalists, tie, state: 'blocked' }
  const po = scores.playoff_0
  if (!po) return { finalists, tie, state: 'needsPlayoff' }
  const key = (t) => [po.award?.[t.id] ?? 0, c(po.cards?.[t.id])]
  const order = [...tie.teams].sort((a, b) => key(b)[0] - key(a)[0] || key(a)[1] - key(b)[1])
  const [e, x] = [key(order[tie.spots - 1]), key(order[tie.spots])]
  if (e[0] === x[0] && e[1] === x[1]) return { finalists, tie, state: 'blocked' }
  return { finalists: [...finalists, ...order.slice(0, tie.spots)], tie, state: 'resolved' }
}

export function finalOrder(teams) {
  const has = (t) => t.finalAward != null
  return [...teams].sort((a, b) =>
    (has(b) - has(a)) || (has(a) ? b.finalAward - a.finalAward || c(a.finalCards) - c(b.finalCards) : b.points - a.points))
}
