export function awardPoints(entries, winnerId) {
  const min = Math.min(...entries.filter((e) => e.id !== winnerId).map((e) => e.cards))
  return Object.fromEntries(entries.map((e) => [e.id, e.id === winnerId ? 3 : e.cards === min ? 2 : 1]))
}

// entries: [{ id, cards }] (cards may be '' or null while typing). wentOutId is optional.
// Returns { ok: true, winnerId, award, entries } or { ok: false, error }.
export function resolveResult(entries, wentOutId = null) {
  if (!entries.length) return { ok: false, error: 'This table has no teams.' }
  const clean = entries.map((e) => ({ id: e.id, cards: e.id === wentOutId ? 0 : e.cards === '' || e.cards == null ? NaN : Number(e.cards) }))
  if (clean.some((e) => !Number.isInteger(e.cards) || e.cards < 0)) return { ok: false, error: 'Type how many cards each team has left (0 or more).' }
  const zeros = clean.filter((e) => e.cards === 0)
  if (wentOutId && zeros.some((e) => e.id !== wentOutId)) return { ok: false, error: 'Only the team that went out can have 0 cards.' }
  if (zeros.length > 1) return { ok: false, error: 'Only one team can have 0 cards. Check the numbers.' }
  let winnerId = wentOutId ?? zeros[0]?.id ?? null
  if (!winnerId) {
    const min = Math.min(...clean.map((e) => e.cards))
    const lowest = clean.filter((e) => e.cards === min)
    if (lowest.length > 1) return { ok: false, error: 'Two teams have the same fewest cards. Pick who finished first.' }
    winnerId = lowest[0].id
  }
  return { ok: true, winnerId, award: awardPoints(clean, winnerId), entries: clean }
}
