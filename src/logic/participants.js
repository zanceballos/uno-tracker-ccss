export const DEFAULT_PER_TEAM = 2

// history: array of round.participants objects ({ teamId: [playerId] }), one per played table.
export function playCounts(history) {
  const n = {}
  for (const p of history) for (const ids of Object.values(p ?? {})) for (const id of ids) n[id] = (n[id] ?? 0) + 1
  return n
}

// Suggests who plays next: the players who have played least (random among ties).
// players: [{ id, teamId }]. Returns { teamId: [playerId] }.
export function suggestParticipants(players, teamIds, history, perTeam = DEFAULT_PER_TEAM, rng = Math.random) {
  const n = playCounts(history)
  return Object.fromEntries(teamIds.map((tid) => [
    tid,
    players.filter((p) => p.teamId === tid)
      .map((p) => ({ id: p.id, k: (n[p.id] ?? 0) + rng() * 0.5 }))
      .sort((a, b) => a.k - b.k)
      .slice(0, perTeam)
      .map((p) => p.id),
  ]))
}

export const roundLabel = (key) => {
  const r = key.split('_')[0]
  return r === 'final' ? 'Final' : r === 'playoff' ? 'Play-off' : `Round ${r}`
}
const order = (k) => {
  const [r, t] = k.split('_')
  return (r === 'playoff' ? 90 : r === 'final' ? 99 : Number(r)) * 100 + Number(t)
}

// scores: { '1_0': { winnerId, award, participants } }. teams need .name and .members (names).
export function summarize(scores, teams, players) {
  const byTeam = Object.fromEntries(teams.map((t) => [t.id, t]))
  const keys = Object.keys(scores).sort((a, b) => order(a) - order(b))
  const winners = keys.map((k) => {
    const ids = scores[k].leaders?.length ? scores[k].leaders : [scores[k].winnerId]
    const ts = ids.map((id) => byTeam[id]).filter(Boolean)
    return { key: k, round: roundLabel(k), table: Number(k.split('_')[1]) + 1, team: ts.map((t) => t.name).join(' & ') || '?', members: ts.flatMap((t) => t.members ?? []), points: scores[k].award?.[ids[0]] ?? 0 }
  })
  const played = {}
  for (const k of keys) for (const ids of Object.values(scores[k].participants ?? {})) for (const id of ids) (played[id] ??= []).push(roundLabel(k))
  const participation = players
    .map((p) => ({ id: p.id, name: p.name, team: byTeam[p.teamId]?.name ?? '—', rounds: played[p.id] ?? [] }))
    .sort((a, b) => a.rounds.length - b.rounds.length || a.name.localeCompare(b.name))
  return { winners, participation }
}
