import { finalistPlan } from './ranking'

export const DEFAULT_ROUNDS = 2
export const MAX_ROUNDS = 3

// "Play another round?" after round `current` (number). yes = next round status or null if at the cap.
export function afterRound(session, current) {
  const rounds = session?.rounds ?? DEFAULT_ROUNDS
  return {
    yes: current < MAX_ROUNDS ? { status: `round${current + 1}`, rounds: Math.max(rounds, current + 1) } : null,
    skip: { rounds: current },
  }
}

// What follows the league once rounds are done: 'final', 'playoff', or null (tie needs a human decision).
export function nextAfterLeague(session, teams, scores) {
  const { state } = finalistPlan(session, teams, scores)
  return state === 'clear' || state === 'resolved' ? 'final' : state === 'needsPlayoff' ? 'playoff' : null
}
