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

function lastCardsOf(session, scores) {
  const last = String(session?.rounds ?? 3)
  const lastCards = {}
  for (const [k, v] of Object.entries(scores)) if (k.startsWith(`${last}_`)) Object.assign(lastCards, v.cards ?? {})
  return lastCards
}

// Best-ranked team (with players) that isn't in `taken`. Used when a finalist team leaves: the next one steps in.
export function nextInLine(session, teams, scores, taken) {
  return rankLeague(teams.filter((t) => t.members?.length), lastCardsOf(session, scores)).find((t) => !taken.has(t.id)) ?? null
}

export function finalistPlan(session, teams, scores, n = 3) {
  const lastCards = lastCardsOf(session, scores)
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

// Bullet points explaining a tie at the finalist cut (admin page). null = no tie at the cut.
export function finalistNote(session, teams, scores, n = 3) {
  const ranked = rankLeague(teams.filter((t) => t.members?.length), lastCardsOf(session, scores))
  if (ranked.length <= n || ranked[n - 1].points !== ranked[n].points) return null
  const level = ranked.filter((t) => t.points === ranked[n - 1].points)
  const cards = (t) => (Number.isFinite(t.cards) ? `${t.cards} card${t.cards === 1 ? '' : 's'} left` : 'no cards recorded')
  const head = `${level.map((t) => t.name).join(', ')} are level on ${ranked[n - 1].points} points.`
  if (cmp(ranked[n - 1], ranked[n]) === 0) {
    return [head, 'They also have the same cards left in the last round.', scores.playoff_0 ? 'A play-off game decided the last finalist spot.' : 'A play-off game decides the last finalist spot.']
  }
  return [
    head,
    'The team with fewer cards left in the last round goes through.',
    ...level.map((t) => `${t.name}: ${cards(t)} → ${ranked.indexOf(t) < n ? 'goes to the final' : 'misses out'}`),
  ]
}
