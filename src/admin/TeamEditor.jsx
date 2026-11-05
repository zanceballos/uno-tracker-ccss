import { useState } from 'react'
import Button from '../components/Button'
import { useConfirm } from '../context'
import Select from '../components/Select'
import { teamColor } from '../components/teamColors'
import AutoAssign from './AutoAssign'
import { addTeam, addWalkIn, movePlayer, removePlayer, renamePlayer } from './actions'

function TeamAdd({ team, full, onAdd }) {
  const [v, setV] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (onAdd(team, v)) setV('')
  }
  return (
    <form onSubmit={submit} className="mt-2 flex gap-1">
      <input value={v} onChange={(e) => setV(e.target.value)} disabled={full} aria-label={`Add player to ${team.name}`} placeholder={full ? 'Team is full' : '+ Add player'} className="h-12 min-w-0 flex-1 rounded-lg bg-white px-3 text-uno-black disabled:opacity-50" />
      <button type="submit" disabled={full || !v.trim()} className="min-h-12 rounded-lg bg-white px-4 font-bold text-uno-black active:scale-95 disabled:opacity-50">Add</button>
    </form>
  )
}

function InlineName({ value, onSave }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(value)
  if (!edit) {
    return (
      <button type="button" aria-label={`Rename ${value}`} onClick={() => { setV(value); setEdit(true) }} className="group flex min-h-12 min-w-0 flex-1 items-center gap-1 text-left">
        <span className="truncate">{value}</span><span aria-hidden className="text-xs text-white/50 group-hover:text-white">✎</span>
      </button>
    )
  }
  const done = (save) => { setEdit(false); if (save && v.trim() && v.trim() !== value) onSave(v.trim()) }
  return (
    <input
      autoFocus value={v} maxLength={30} aria-label={`New name for ${value}`} onChange={(e) => setV(e.target.value)} onBlur={() => done(false)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); done(true) } else if (e.key === 'Escape') done(false) }}
      className="h-12 min-w-0 flex-1 rounded-lg bg-white px-3 text-uno-black"
    />
  )
}

export default function TeamEditor({ sid, mode, teams, players, toast, canAddTeam, started }) {
  const confirm = useConfirm()
  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState('')
  const count = (t) => players.filter((p) => p.teamId === t.id).length
  const waiting = players.filter((p) => !p.teamId)
  const rename = (p) => (nm) => run(() => renamePlayer(sid, p.id, nm), `Renamed to ${nm}`)
  const smallest = [...teams].sort((a, b) => count(a) - count(b))[0]
  const target = teams.find((t) => t.id === (teamId || smallest?.id))

  const run = async (fn, msg) => {
    try { await fn(); toast(msg) } catch { toast('Something went wrong. Try again.') }
  }
  const addTo = (team, nm) => {
    if (!nm.trim() || !team) return false
    if (count(team) >= 4) { toast(`Team ${team.name} is full (4 players)`); return false }
    run(() => addWalkIn(sid, nm.trim(), team.id), `Added ${nm.trim()} to Team ${team.name}, now ${count(team) + 1} players`)
    return true
  }
  const add = (e) => {
    e.preventDefault()
    if (addTo(target, name)) setName('')
  }
  const move = (p, to) => {
    const dest = teams.find((t) => t.id === to)
    if (count(dest) >= 4) return toast(`Team ${dest.name} is full (4 players)`)
    run(() => movePlayer(sid, p, to), `Moved ${p.name} to Team ${dest.name}, now ${count(dest) + 1} players`)
  }
  const remove = async (p) => {
    const t = teams.find((x) => x.id === p.teamId)
    if (await confirm(`Remove ${p.name} from Team ${t.name}?`, { title: 'Player left?', confirmLabel: 'Remove' }))
      run(() => removePlayer(sid, p), `${p.name} left Team ${t.name}, now ${count(t) - 1} players`)
  }

  const newTeam = () => run(async () => { await addTeam(sid, teams, started) }, started ? `Team added with the lowest team's score, now ${teams.length + 1} teams` : `Team added, now ${teams.length + 1} teams`)

  return (
    <div>
      {mode === 'mixed' && players.length > 0 && <AutoAssign sid={sid} teams={teams} players={players} toast={toast} />}
      {waiting.length > 0 && (
        <section className="mb-3 rounded-2xl border-2 border-uno-yellow/60 bg-uno-yellow/10 p-2">
          <h3 className="mb-1 px-2 font-extrabold">Waiting for a team ({waiting.length})</h3>
          <ul className="space-y-1">
            {waiting.map((p) => (
              <li key={p.id} className="flex items-center gap-1">
                <InlineName value={p.name} onSave={rename(p)} />
                <Select label={`Put ${p.name} in a team`} value="" placeholder="Team…" align="right" className="w-28" onChange={(to) => move(p, to)} options={teams.filter((x) => count(x) < 4).map((x) => ({ value: x.id, label: x.name }))} />
                <button onClick={() => run(() => removePlayer(sid, p), `${p.name} removed`)} className="min-h-12 rounded-lg border-2 border-white/60 px-3 text-sm font-bold active:scale-95">Remove</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mb-2 text-sm text-white/70">Tap a player's name to rename it. Enter saves, Esc cancels.</p>
      {canAddTeam && <Button variant="ghost" className="mb-3" onClick={newTeam}>+ Open another team</Button>}
      <form onSubmit={add} className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Player name" placeholder="Add any player (walk-in, no phone)" className="h-12 min-w-0 flex-1 rounded-xl bg-white px-4 text-lg text-uno-black" />
        <Select
          label="Team" value={target?.id ?? ''} onChange={setTeamId} className="w-40"
          options={teams.map((t) => ({ value: t.id, label: `${t.name} (${count(t)})` }))}
        />
        <Button type="submit">Add player</Button>
      </form>
      <div className="grid gap-2 sm:grid-cols-2">
        {teams.map((t) => {
          const c = teamColor(t.colorIndex)
          return (
            <section key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-2">
              <h3 className={`mb-1 flex items-center justify-between rounded-lg px-2 py-1 font-extrabold ${c.bg} ${c.text}`}>
                <span>{c.letter} · {t.name}</span><span>{count(t)}/4</span>
              </h3>
              <ul className="space-y-1">
                {players.filter((p) => p.teamId === t.id).map((p) => (
                  <li key={p.id} className="flex items-center gap-1">
                    <InlineName value={p.name} onSave={rename(p)} />
                    <Select
                      label={`Move ${p.name}`} value="" placeholder="Move…" align="right" className="w-28"
                      onChange={(to) => move(p, to)}
                      options={teams.filter((x) => x.id !== t.id).map((x) => ({ value: x.id, label: x.name }))}
                    />
                    <button onClick={() => remove(p)} className="min-h-12 rounded-lg border-2 border-white/60 px-3 text-sm font-bold active:scale-95">Left</button>
                  </li>
                ))}
                {!count(t) && <li className="text-sm text-white/70">No players yet</li>}
              </ul>
              <TeamAdd team={t} full={count(t) >= 4} onAdd={addTo} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
