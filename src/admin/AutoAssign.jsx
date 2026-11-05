import { useState } from 'react'
import Button from '../components/Button'
import { useConfirm } from '../context'
import { autoAssign } from '../logic/teams'
import { applyGroups } from './actions'

export default function AutoAssign({ sid, teams, players, toast }) {
  const confirm = useConfirm()
  const hasUnassigned = players.some((p) => !p.teamId)
  const [all, setAll] = useState(!hasUnassigned)
  const [plan, setPlan] = useState(null)
  const scope = all ? players : players.filter((p) => !p.teamId)
  const teamIds = (all ? teams : teams.filter((t) => !players.some((p) => p.teamId === t.id))).map((t) => t.id)
  const byId = Object.fromEntries(players.map((p) => [p.id, p.name]))
  const label = (i) => teams.find((t) => t.id === teamIds[i])?.name ?? 'New team'

  const shuffle = () => setPlan(autoAssign(scope.map((p) => p.id), teamIds))
  const lock = async () => {
    if (all && players.some((p) => p.teamId) && !(await confirm('Everyone is shuffled again. The teams they are in now are replaced.', { title: 'Replace the current teams?', confirmLabel: 'Replace teams', danger: true }))) return
    try { await applyGroups(sid, teams, players, plan.groups, teamIds); setPlan(null); toast('Teams are set') } catch { toast('Something went wrong. Try again.') }
  }

  return (
    <div className="mb-3 rounded-2xl border-2 border-white/30 bg-white/5 p-3">
      <p className="font-extrabold">🎲 Auto-assign teams</p>
      <p className="mb-2 text-sm text-white/80">Teams of 3, with some of 4 if players are left over.</p>
      {!plan && (
        <>
          {hasUnassigned && (
            <label className="mb-2 flex min-h-12 items-center gap-3">
              <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} className="size-6 accent-uno-green" />
              Shuffle everyone, even players who already have a team
            </label>
          )}
          <Button className="w-full" disabled={!scope.length} onClick={shuffle}>{scope.length ? `Preview teams for ${scope.length} players` : 'No players to assign'}</Button>
        </>
      )}
      {plan && (
        <>
          <p className="mb-2 text-sm font-bold">Preview. Nothing is saved until you press "Lock teams".</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {plan.groups.map((g, i) => (
              <li key={i} className="rounded-xl border border-white/20 p-2">
                <p className="font-extrabold">{label(i)} <span className="font-semibold text-white/70">({g.length})</span></p>
                <p className="text-sm">{g.map((id) => byId[id]).join(', ')}</p>
              </li>
            ))}
          </ul>
          {plan.needTeams > 0 && <p className="mt-2 text-sm font-semibold text-uno-yellow">{plan.needTeams} new team{plan.needTeams > 1 ? 's' : ''} will be opened.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" className="flex-1" onClick={lock}>Lock teams</Button>
            <Button variant="ghost" onClick={shuffle}>Shuffle again</Button>
            <Button variant="ghost" onClick={() => setPlan(null)}>Cancel</Button>
          </div>
        </>
      )}
    </div>
  )
}
