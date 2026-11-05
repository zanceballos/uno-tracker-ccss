import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmtDate } from '../fmtDate'
import Button from '../components/Button'
import LeaveTeam from '../components/LeaveTeam'
import Modal from '../components/Modal'
import TeamDetails from '../components/TeamDetails'
import Podium from '../components/Podium'
import { WILD_BG, teamColor } from '../components/teamColors'
import NameList from '../components/NameList'
import { useApp } from '../context'
import usePast from '../hooks/usePast'

const BANNER = {
  upcoming: ['Coming soon', 'Registration opens soon. Check back here!'],
  registration: ['Registration is open', 'Grab your team code and jump in.'],
  closed: ['Registration closed', 'Teams are locked. Find out who is on your team.'],
  round1: ['Round 1 is live', 'Find your table and play!'],
  round2: ['Round 2 is live', 'New tables, new rivals.'],
  round3: ['Round 3 is live', 'Last round before the final.'],
  playoff: ['Tie-break play-off', 'Tied teams play one game for the last finalist spot.'],
  final: ['Finals are on!', 'The top teams battle for the win.'],
  done: ['Session finished', 'Check out the final results.'],
}

const PANEL = 'rounded-3xl border border-white/15 bg-uno-charcoal p-4'
const ROW = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 active:scale-[0.99]'
const names = (t) => (t.members?.length ? t.members.join(', ') : t.name)
const EMPTY = 'rounded-2xl border-2 border-dashed border-white/40 px-4 py-6 text-center text-lg text-white/80'
const MEDAL = ['🥇', '🥈', '🥉']

const REWARDS = [
  ['Chagee', '/chagee-1.svg'],
  ['iTea', '/itea.jpeg'],
  ['KOI', '/koilogo.jpg'],
]

export function HallOfFame({ past, onSelect }) {
  const winners = past
    .filter((s) => s.standings?.length)
    .map((s) => ({ ...s.standings[0], id: s.id, session: s.name, date: s.date }))
    .sort((a, b) => b.points - a.points || (b.date?.seconds ?? 0) - (a.date?.seconds ?? 0))
  if (!winners.length) {
    return (
      <section className={PANEL}>
        <h2 className="mb-3 text-2xl font-extrabold">🏆 Hall of fame</h2>
        <p className={EMPTY}>No winners yet. The champion of each session will be crowned here!</p>
      </section>
    )
  }
  const [best, ...rest] = winners
  return (
    <section className={PANEL}>
      <h2 className="text-2xl font-extrabold">🏆 Hall of fame</h2>
      <p className="mb-3 text-sm text-white/70">Winning teams of every session, ranked by points. Tap a team for details.</p>
      <button type="button" onClick={() => onSelect(best)} className="w-full rounded-3xl border-4 border-white bg-yellow-400 p-4 text-center text-uno-black transition active:scale-[0.99]">
        <span className="block text-sm font-bold uppercase tracking-widest">Best team overall</span>
        <span className="block break-words text-2xl font-extrabold">{names(best)}</span>
        {best.members?.length > 0 && <span className="block font-semibold">{best.name}</span>}
        <span className="mt-1 block font-bold">{best.points} points · {best.session} · {fmtDate(best.date)}</span>
      </button>
      {rest.length > 0 && (
        <>
          <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wider text-white/70">Other winning teams</h3>
          <ol className="flex flex-col gap-2">
            {rest.map((w, i) => (
              <li key={w.id}>
                <button type="button" onClick={() => onSelect(w)} className={ROW}>
                  <span className="flex items-start justify-between gap-2 font-bold">
                    <span className="break-words">{MEDAL[i + 1] ?? `${i + 2}.`} {names(w)}</span>
                    <span className="shrink-0 tabular-nums">{w.points} pts</span>
                  </span>
                  {w.members?.length > 0 && <span className="block text-sm text-white/80">{w.name}</span>}
                  <span className="block text-xs text-white/60">{w.session} · {fmtDate(w.date)}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}

export function PastBoards({ past, onSelect }) {
  const [open, setOpen] = useState(null)
  const show = (s) => (t) => onSelect({ ...t, session: s.name, date: s.date })
  return (
    <section className={PANEL}>
      <h2 className="mb-3 text-2xl font-extrabold">Past leaderboards</h2>
      {!past.length && <p className={EMPTY}>No past sessions yet. Finished leaderboards will be saved here.</p>}
      <ul className="flex flex-col gap-2">
        {past.map((s) => (
          <li key={s.id} className="rounded-2xl border border-white/10 bg-white/5">
            <button aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)} className="flex min-h-12 w-full items-center justify-between gap-2 px-4 text-left font-bold">
              <span>{s.name} <span className="text-sm font-medium text-white/70">· {fmtDate(s.date)}</span></span>
              <span aria-hidden>{open === s.id ? '−' : '+'}</span>
            </button>
            {open === s.id && (
              <div className="px-3 pb-3">
                <Podium onSelect={show(s)} items={(s.standings ?? []).map((t) => ({ ...t, sub: t.finalAward != null ? `Final: ${t.finalAward} pts` : undefined }))} date={fmtDate(s.date)} />
                {s.winners?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-bold text-white/70">Round winners</p>
                    <ul className="text-sm">{s.winners.map((w, i) => <li key={i}>{w.round} · Table {w.table}: <b>{w.team}</b></li>)}</ul>
                  </div>
                )}
                <ol start={4} className="mt-3 space-y-1">
                  {(s.standings ?? []).slice(3).map((t, i) => (
                    <li key={t.name}>
                      <button type="button" onClick={() => show(s)(t)} className="w-full rounded-lg px-2 py-1 text-left hover:bg-white/5">
                        <span className="flex justify-between gap-2"><span className="flex min-w-0 gap-2"><span>{i + 4}.</span><NameList team={t} /></span><b className="shrink-0 tabular-nums">{t.points}</b></span>
                        {t.members?.length > 0 && <span className="block pl-5 text-sm text-white/80">{t.name}</span>}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function OverallPlayers({ ranking }) {
  return (
    <section className={PANEL}>
      <h2 className="mb-3 text-2xl font-extrabold">Overall players</h2>
      {!ranking.length && <p className={EMPTY}>No player rankings yet. Play a session to get on the board!</p>}
      <ol hidden={!ranking.length} className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 px-3">
        {ranking.slice(0, 10).map((p, i) => (
          <li key={p.name} className="flex justify-between gap-2 py-2">
            <span className="break-words">{MEDAL[i] ?? `${i + 1}.`} {p.name}</span>
            <span className="shrink-0"><b className="tabular-nums">{p.points} pts</b> <span className="text-sm text-white/70">· {p.sessions} {p.sessions === 1 ? 'session' : 'sessions'}</span></span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Welcome() {
  const { session, myTeam, loading } = useApp()
  const { past, ranking } = usePast()
  const [detail, setDetail] = useState(null)
  const navigate = useNavigate()
  const status = session?.status ?? 'upcoming'
  const [title, text] = BANNER[status]
  const c = myTeam && teamColor(myTeam.colorIndex)
  return (
    <div className="pt-4">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-start">
        <div>
          <h1 className="text-center text-5xl font-extrabold leading-none">{session?.name ?? 'Uno Night'}</h1>
          <div className={`${WILD_BG} mt-5 rounded-3xl p-1`}>
            <div className="rounded-[20px] bg-uno-black px-5 py-6 text-center">
              {loading ? <p>Loading…</p> : (
                <>
                  <p className="text-3xl font-extrabold">{title}</p>
                  <p className="mt-1 text-lg">{text}</p>
                  {session && <p className="mt-3 text-sm text-white/80">{status === 'done' ? 'Played on' : 'Session date'}: <b>{fmtDate(session.date)}</b></p>}
                  {status === 'done' && <p className="text-sm text-white/80">The next session will be announced here.</p>}
                </>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-col items-center gap-3">
            {status === 'registration' && !myTeam && <Button variant="primary" className="w-full" onClick={() => navigate('/join')}>Join</Button>}
            {myTeam && (
              <>
                <p className={`w-full rounded-2xl border-4 border-white px-4 py-3 text-center text-xl font-extrabold ${c.bg} ${c.text}`}>
                  {c.letter} · You're in Team {myTeam.name}
                </p>
                <LeaveTeam />
                {!['upcoming', 'registration'].includes(status) && <Button className="w-full" onClick={() => navigate('/session')}>{status === 'done' ? 'See results' : 'Go to my team'}</Button>}
              </>
            )}
          </div>
          {!myTeam && ['closed', 'round1', 'round2', 'round3', 'playoff', 'final', 'done'].includes(status) && (
            <Button className="mt-3 w-full" onClick={() => navigate('/session')}>{status === 'done' ? 'See results' : 'Watch live: players and points'}</Button>
          )}
          <div className={`${WILD_BG} mt-6 rounded-3xl p-1`}>
            <div className="rounded-[20px] bg-uno-black p-4 text-center">
              <p className="text-2xl font-extrabold">{status === 'registration' ? 'Scan to join!' : 'Scan to follow the game'}</p>
              <p className="mb-3 text-sm text-white/80">Point your phone camera at the code</p>
              <img src="/qr-code.png" alt="QR code that opens this website" width="224" height="224" className="mx-auto size-48 rounded-2xl bg-white p-2 lg:size-56" />
              <p className="mt-3 text-sm text-white/80">Or join via</p>
              <a href="https://uno-tracker-f0143.web.app" className="inline-flex min-h-12 items-center break-all text-lg font-extrabold text-uno-yellow underline">uno-tracker-f0143.web.app</a>
            </div>
          </div>
          <section className="mt-4 rounded-3xl border-4 border-yellow-400 bg-uno-charcoal p-4 text-center">
            <p aria-hidden className="text-3xl">🧋</p>
            <h2 className="text-xl font-extrabold">This week's winner reward</h2>
            <p className="text-white/80">A bubble tea of their choice!</p>
            <ul className="mt-3 flex justify-center gap-4">
              {REWARDS.map(([name, src]) => (
                <li key={name} className="flex flex-col items-center gap-1">
                  <img src={src} alt={`${name} logo`} className="size-20 rounded-full border-4 border-white bg-white object-contain p-1.5" />
                  <span className="text-sm font-bold">{name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="flex flex-col gap-6">
          <HallOfFame past={past} onSelect={setDetail} />
          <PastBoards past={past} onSelect={setDetail} />
          <OverallPlayers ranking={ranking} />
        </div>
      </div>
      {detail && <Modal title="Team details" onClose={() => setDetail(null)}><TeamDetails team={detail} /></Modal>}
    </div>
  )
}
