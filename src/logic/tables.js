export const MAX_TABLES = 3
export const MAX_PER_TABLE = 3

export function tableSizes(n) {
  const count = Math.min(MAX_TABLES, Math.max(1, Math.floor(n / 2)))
  const sizes = Array(count).fill(Math.min(2, n))
  let left = Math.min(n, count * MAX_PER_TABLE) - sizes.reduce((a, b) => a + b, 0)
  for (let i = 0; left > 0; i = (i + 1) % count) {
    if (sizes[i] < MAX_PER_TABLE) { sizes[i]++; left-- }
  }
  return sizes.sort((a, b) => b - a)
}

const shuffle = (arr, rng) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export function assignTables(teamIds, history = [], rng = Math.random, priority = []) {
  const seated = teamIds.length
  const sizes = tableSizes(seated)
  const met = new Map()
  for (const round of history)
    for (const table of round)
      for (let i = 0; i < table.length; i++)
        for (let j = i + 1; j < table.length; j++)
          met.set(key(table[i], table[j]), (met.get(key(table[i], table[j])) ?? 0) + 1)

  const cap = sizes.reduce((a, b) => a + b, 0)
  const pool = [...shuffle(teamIds.filter((id) => priority.includes(id)), rng), ...shuffle(teamIds.filter((id) => !priority.includes(id)), rng)]
  const chosen = pool.slice(0, cap)
  const extra = pool.slice(cap)

  let best = null
  let bestScore = Infinity
  for (let attempt = 0; attempt < 300 && bestScore > 0; attempt++) {
    const order = shuffle(chosen, rng)
    const tables = []
    let at = 0
    for (const s of sizes) { tables.push(order.slice(at, at + s)); at += s }
    let score = 0
    for (const t of tables)
      for (let i = 0; i < t.length; i++)
        for (let j = i + 1; j < t.length; j++) score += met.get(key(t[i], t[j])) ?? 0
    if (score < bestScore) { best = { tables, extra }; bestScore = score }
  }

  const casualNeeded = best.extra.length > 0
  return {
    tables: best.tables,
    casual: best.extra,
    warning: casualNeeded ? `${teamIds.length} teams: add a casual non-scoring table for ${best.extra.length} team(s).` : null,
    repeatPairs: bestScore,
  }
}
