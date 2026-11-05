// outId = team that went out first (or null if time ran out).
// Went out: 3 points; fewest cards among the rest: 2; others: 1.
// Time ran out (nobody out): fewest cards gets 2 at most, others 1. Teams tied on fewest cards all get 2.
export function awardPoints(entries, outId) {
  const min = Math.min(...entries.filter((e) => e.id !== outId).map((e) => e.cards))
  return Object.fromEntries(entries.map((e) => [e.id, e.id === outId ? 3 : e.cards === min ? 2 : 1]))
}

// entries: [{ id, cards }] (cards may be '' or null while typing). wentOutId is optional.
// Returns { ok: true, outId, winnerId, leaders, award, entries } or { ok: false, error }.
export function resolveResult(entries, wentOutId = null) {
  if (!entries.length) return { ok: false, error: 'This table has no teams.' }
  const clean = entries.map((e) => ({ id: e.id, cards: e.id === wentOutId ? 0 : e.cards === '' || e.cards == null ? NaN : Number(e.cards) }))
  if (clean.some((e) => !Number.isInteger(e.cards) || e.cards < 0)) return { ok: false, error: 'Type how many cards each team has left (0 or more).' }
  const zeros = clean.filter((e) => e.cards === 0)
  if (wentOutId && zeros.some((e) => e.id !== wentOutId)) return { ok: false, error: 'Only the team that went out can have 0 cards.' }
  if (zeros.length > 1) return { ok: false, error: 'Only one team can have 0 cards. Check the numbers.' }
  const outId = wentOutId ?? zeros[0]?.id ?? null
  const award = awardPoints(clean, outId)
  const top = Math.max(...Object.values(award))
  const leaders = clean.filter((e) => award[e.id] === top).map((e) => e.id)
  return { ok: true, outId, winnerId: outId ?? (leaders.length === 1 ? leaders[0] : null), leaders, award, entries: clean }
}
