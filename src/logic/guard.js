const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const ROUND_STATUS = /^round\d$|^playoff$|^final$/

// What must be true before the organiser presses "Next". checks block the button, reminders don't.
export function prereqs({ status, left, teams, players, tables, scores, round, dropped = [] }) {
  const withPlayers = teams.filter((t) => t.members.length)
  const unassigned = players.filter((p) => !p.teamId).length
  const people = [
    { ok: withPlayers.length >= 2, text: `At least 2 teams have players (${withPlayers.length} now)` },
    { ok: unassigned === 0, text: unassigned ? `${unassigned} ${unassigned > 1 ? 'players still need' : 'player still needs'} a team` : 'Every player is on a team' },
  ]
  if (status === 'upcoming') {
    return { headline: 'Before you open registration', checks: [{ ok: teams.length >= 2, text: 'At least 2 teams are set up' }], reminders: ['Show the QR code so players can join.'] }
  }
  if (status === 'registration') {
    const thin = withPlayers.filter((t) => t.members.length === 1).map((t) => t.name)
    return {
      headline: 'Before you close registration',
      checks: people,
      reminders: ['Everyone should know their team name.', ...(thin.length ? [`${thin.join(', ')} ${thin.length > 1 ? 'have' : 'has'} only 1 player. Teams of 3 are best.`] : [])],
    }
  }
  if (status === 'closed') {
    return {
      headline: 'Before Round 1',
      checks: people,
      reminders: ['Read the rules out loud (tap the Rules button).', 'Get a deck of cards for every table.', 'Players can see their table on their phones.'],
    }
  }
  if (!ROUND_STATUS.test(status)) return { headline: '', checks: [], reminders: [] }
  const name = status === 'final' ? 'the final' : status === 'playoff' ? 'the play-off' : `Round ${round}`
  if (left == null) {
    return {
      headline: `Before the timer starts for ${name}`,
      checks: [
        { ok: tables.some((t) => t.teams.length), text: 'Teams are seated at tables' },
        { ok: dropped.length === 0, text: dropped.length ? `${dropped.map((t) => t.name).join(', ')} ${dropped.length > 1 ? 'have' : 'has'} no players left. Fix the table first.` : 'Every seated team has players' },
      ],
      reminders: ['Teams are sitting at their tables.', 'Deal 7 cards to every player.', 'Remind everyone: 10 seconds a turn.'],
    }
  }
  if (left > 0) {
    return { headline: `${name} is being played`, checks: [], reminders: [], block: `${mmss(left)} left. If a team goes out, press "End round early".` }
  }
  const unscored = tables.map((t, i) => ({ t, n: i + 1 })).filter(({ t, n }) => t.teams.length && !scores[`${round}_${n - 1}`]).map(({ n }) => n)
  return {
    headline: `Before you move on from ${name}`,
    checks: [{ ok: unscored.length === 0, text: unscored.length ? `Save a score for Table ${unscored.join(', Table ')}` : 'Every table has a score' }],
    reminders: ['Count the cards twice. It is easy to miss one.'],
  }
}

export const ready = (info) => !info.block && info.checks.every((c) => c.ok)

// The step before this one. null = can't go back.
export function previousStatus(status, session, scores) {
  const last = `round${session?.rounds ?? 2}`
  const prev = { registration: 'upcoming', closed: 'registration', round1: 'closed', round2: 'round1', round3: 'round2', playoff: last, final: session?.seating?.playoff ? 'playoff' : last }[status]
  if (!prev) return null
  const key = status.startsWith('round') ? status.slice(5) : status
  return Object.keys(scores).some((k) => k.startsWith(`${key}_`)) ? null : prev
}
