import { fmtDate } from '../fmtDate'
import { teamColor } from './teamColors'

export default function TeamDetails({ team }) {
  const c = team.colorIndex != null ? teamColor(team.colorIndex) : null
  return (
    <div>
      <p className="flex items-center gap-2 text-3xl font-extrabold leading-tight">
        {c && <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-lg ${c.bg} ${c.text}`}>{c.letter}</span>}
        <span className="break-words">{team.name}</span>
      </p>
      <p className="mt-2 text-xl font-bold">{team.points} points{team.finalAward != null && ` · Final: ${team.finalAward} pts`}</p>
      {team.session && <p className="text-white/80">{team.session}{team.date ? ` · ${fmtDate(team.date)}` : ''}</p>}
      <h3 className="mb-1 mt-4 text-lg font-bold text-uno-yellow">Players</h3>
      {team.members?.length ? (
        <ul className="space-y-1 text-lg">{team.members.map((m, i) => <li key={`${m}${i}`} className="break-words">{m}</li>)}</ul>
      ) : <p className="text-white/70">Player names weren't saved for this session.</p>}
    </div>
  )
}
