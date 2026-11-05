import { useState } from 'react'
import Button from './Button'
import { playCounts, suggestParticipants } from '../logic/participants'
import { resolveResult } from '../logic/scoring'
import { teamColor } from './teamColors'

export default function TableCard({ index, teams, saved, onSave, onUndo, players = [], history = [], perTeam = 2 }) {
  const [winner, setWinner] = useState(saved?.cards?.[saved.winnerId] === 0 ? saved.winnerId : '')
  const [cards, setCards] = useState(() => Object.fromEntries(teams.map((t) => [t.id, saved?.cards?.[t.id] ?? ''])))
  const [err, setErr] = useState('')
  const counts = playCounts(history)
  const [part, setPart] = useState(() => ({ ...suggestParticipants(players, teams.map((t) => t.id), history, perTeam), ...(saved?.participants ?? {}) }))
  const toggle = (tid, pid) => setPart((p) => ({ ...p, [tid]: p[tid]?.includes(pid) ? p[tid].filter((x) => x !== pid) : [...(p[tid] ?? []), pid] }))
  const entries = teams.map((t) => ({ id: t.id, cards: t.id === winner ? 0 : cards[t.id] }))
  const res = resolveResult(entries, winner || null)
  const submit = (e) => {
    e.preventDefault()
    if (!res.ok) return setErr(res.error)
    const none = teams.find((t) => players.some((p) => p.teamId === t.id) && !part[t.id]?.length)
    if (none) return setErr(`Pick who played for ${none.name}.`)
    setErr('')
    onSave(entries, winner || null, part)
  }
  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/15 bg-uno-charcoal p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Table {index + 1}</h2>
        {saved && <span className="rounded-full bg-uno-green px-3 py-0.5 text-sm font-bold text-uno-black">Scored ✓</span>}
      </div>
      <div className="flex flex-col gap-2">
        {teams.map((t) => {
          const c = teamColor(t.colorIndex)
          const won = winner === t.id
          return (
            <div key={t.id} className={`flex flex-wrap items-center gap-2 rounded-xl p-2 ${c.bg} ${c.text}`}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-current text-sm font-extrabold">{c.letter}</span>
              <span className="min-w-0 flex-1 truncate font-bold">{t.name}</span>
              <label className="flex min-h-12 items-center gap-1 rounded-lg bg-white/90 px-3 text-sm font-bold text-uno-black">
                <input type="checkbox" checked={won} onChange={() => setWinner(won ? '' : t.id)} className="size-5" />
                Went out
              </label>
              <input
                type="number" min="0" inputMode="numeric" aria-label={`Cards left for ${t.name}`}
                disabled={won} placeholder="Cards"
                value={won ? 0 : cards[t.id]}
                onChange={(e) => setCards({ ...cards, [t.id]: e.target.value })}
                className="h-12 w-20 rounded-lg bg-white px-2 text-center text-lg font-bold text-uno-black disabled:opacity-50"
              />
              {players.some((p) => p.teamId === t.id) && (
                <div className="w-full">
                  <p className="text-sm font-bold">Who played? <span className="font-semibold opacity-80">(number = times played before)</span></p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {players.filter((p) => p.teamId === t.id).map((p) => {
                      const on = part[t.id]?.includes(p.id)
                      return (
                        <button key={p.id} type="button" aria-pressed={on} onClick={() => toggle(t.id, p.id)} className={`min-h-12 rounded-full border-2 border-current px-3 text-sm font-bold ${on ? 'bg-white text-uno-black' : ''}`}>
                          {on ? '✓ ' : ''}{p.name}{counts[p.id] ? ` (${counts[p.id]})` : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {saved?.award?.[t.id] != null && <span className="w-full text-right text-sm font-bold">+{saved.award[t.id]} pts</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-white/70">Type the cards left for each team. Tick "Went out" only if a team played all its cards.</p>
      {res.ok && <p className="mt-1 text-sm font-bold text-uno-green">Winner: {teams.find((t) => t.id === res.winnerId)?.name}{winner ? '' : ' (fewest cards)'}</p>}
      {err && <p role="alert" className="mt-2 text-sm font-semibold text-uno-yellow">{err}</p>}
      <Button type="submit" className="mt-3 w-full">{saved ? 'Update score' : 'Save score'}</Button>
      {saved && onUndo && <Button type="button" variant="ghost" className="mt-2 w-full" onClick={onUndo}>Undo this score</Button>}
    </form>
  )
}
