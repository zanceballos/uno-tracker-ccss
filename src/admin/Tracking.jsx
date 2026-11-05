import { summarize } from '../logic/participants'
import { Section } from './ui'

export default function Tracking({ scores, teams, players }) {
  const { winners, participation } = summarize(scores, teams, players)
  const played = participation.filter((p) => p.rounds.length).length
  return (
    <Section id="tracking" title="Winners and who played" hint="Saved automatically when you score each table." collapsible defaultOpen>
      <h3 className="mb-1 font-extrabold">🏆 Winners</h3>
      {winners.length ? (
        <ul className="mb-4 space-y-1">
          {winners.map((w) => (
            <li key={w.key} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-sm font-bold text-white/70">{w.round} · Table {w.table}</span>
              <span className="flex justify-between gap-2 font-bold"><span>{w.team}</span><span className="shrink-0">+{w.points} pts</span></span>
              {w.members.length > 0 && <span className="block text-sm text-white/80">{w.members.join(', ')}</span>}
            </li>
          ))}
        </ul>
      ) : <p className="mb-4 rounded-xl border-2 border-dashed border-white/30 px-3 py-4 text-center text-white/80">No winners yet. Score a table to see it here.</p>}
      <h3 className="mb-1 font-extrabold">🃏 Who played</h3>
      <p className="mb-2 text-sm text-white/70">{played} of {participation.length} players have played at least once.</p>
      {participation.length ? (
        <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 px-3">
          {participation.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-2 py-2">
              <span className="min-w-0"><span className="block break-words font-bold">{p.name}</span><span className="text-sm text-white/70">{p.team}</span></span>
              {p.rounds.length
                ? <span className="flex shrink-0 flex-wrap justify-end gap-1">{p.rounds.map((r, i) => <span key={i} className="rounded-full bg-uno-green/20 px-2 py-0.5 text-xs font-bold text-uno-green">{r}</span>)}</span>
                : <span className="shrink-0 rounded-full bg-uno-yellow/20 px-2 py-0.5 text-xs font-bold text-uno-yellow">Not played yet</span>}
            </li>
          ))}
        </ul>
      ) : <p className="text-white/70">No players yet.</p>}
    </Section>
  )
}
