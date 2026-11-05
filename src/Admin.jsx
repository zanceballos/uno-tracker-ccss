import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { collection, onSnapshot } from 'firebase/firestore'
import AdminLogin from './admin/AdminLogin'
import RoundGuide from './admin/RoundGuide'
import SessionPicker from './admin/SessionPicker'
import { pickSeat } from './logic/late'
import { finalistPlan } from './logic/ranking'
import PointsEditor from './admin/PointsEditor'
import TeamEditor from './admin/TeamEditor'
import { ROUND_SECONDS, advance, createSession, finish, endRound, goBack, resetAll, saveScore, seatTeam, setPlayersPerTeam, setRounds, setSeating, startTimer, undoScore } from './admin/actions'
import NextStep from './admin/NextStep'
import Tracking from './admin/Tracking'
import { DEFAULT_PER_TEAM } from './logic/participants'
import { MODES } from './logic/modes'
import { MAX_ROUNDS, nextAfterLeague } from './logic/flow'
import { prereqs, previousStatus, ready } from './logic/guard'
import Button from './components/Button'
import Modal from './components/Modal'
import Backdrop from './components/Backdrop'
import NavBar from './components/NavBar'
import RoundEndedModal from './components/RoundEndedModal'
import RulesButton from './components/RulesButton'
import Select from './components/Select'
import { Alert, Section, Stepper, Tile } from './admin/ui'
import TableCard from './components/TableCard'
import TimerBar from './components/TimerBar'
import Toast from './components/Toast'
import { WILD_BG } from './components/teamColors'
import { useApp, useConfirm } from './context'
import { auth, db } from './firebase'
import useCountdownTo from './hooks/useCountdownTo'
import useOnline from './hooks/useOnline'

const ACTIONS = [
  { label: 'Open registration', ok: (s) => s === 'upcoming', to: () => 'registration' },
  { label: 'Close registration', ok: (s) => s === 'registration', to: () => 'closed' },
  { label: 'Start Round 1', ok: (s) => s === 'closed', to: () => 'round1' },
  { label: 'Start final', ok: (s, r, p) => s === 'playoff' && p.state === 'resolved', to: () => 'final' },
  { label: 'Finish session', ok: (s) => s === 'final', to: () => 'done' },
]
const DESC = {
  'Open registration': 'Players can join with a team code.',
  'Close registration': 'Locks sign-ups. You can still edit teams afterwards.',
  'Start Round 1': 'Seats the teams at tables and shows players where to sit.',
  'Next round': 'Re-seats the teams at new tables.',
  'Start play-off': 'Tied teams play one game for the last finalist spot.',
  'Start final': 'Seats the finalists together. The final winner takes the title.',
  'Finish session': 'Saves the results to the leaderboards.',
}
const STEPS = [
  { key: 'upcoming', label: 'Upcoming' }, { key: 'registration', label: 'Registration' }, { key: 'closed', label: 'Teams set' },
  { key: 'round1', label: 'Round 1' }, { key: 'round2', label: 'Round 2' }, { key: 'round3', label: 'Round 3' },
  { key: 'playoff', label: 'Play-off' }, { key: 'final', label: 'Final' }, { key: 'done', label: 'Done' },
]
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const KEY = { round1: '1', round2: '2', round3: '3', playoff: 'playoff', final: 'final' }

function NewSession({ toast, onDone }) {
  const [f, setF] = useState({ name: '', date: '', teamCount: 5, mode: 'choose' })
  const input = 'mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black'
  const submit = async (e) => {
    e.preventDefault()
    try { await createSession({ ...f, teamCount: Number(f.teamCount) }); toast('Session created'); onDone() } catch { toast('Could not create session') }
  }
  return (
    <form onSubmit={submit} className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <label className="mt-3 block font-bold">Name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></label>
      <label className="mt-3 block font-bold">Date and time<input required type="datetime-local" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={input} /></label>
      <label className="mt-3 block font-bold">Number of teams<input required type="number" min="2" max="12" value={f.teamCount} onChange={(e) => setF({ ...f, teamCount: e.target.value })} className={input} /></label>
      <span className="mt-3 block font-bold">How do players get teams?</span>
      <Select label="Team mode" value={f.mode} onChange={(mode) => setF({ ...f, mode })} options={MODES} className="mt-1 w-full" />
      <Button type="submit" variant="primary" className="mt-4 w-full">Create session</Button>
    </form>
  )
}

export default function Admin() {
  const { user, isAdmin, loading, session, teams, players } = useApp()
  const confirm = useConfirm()
  const online = useOnline()
  const [toast, setToast] = useState('')
  const [scores, setScores] = useState({})
  const [newOpen, setNewOpen] = useState(false)
  const left = useCountdownTo(session?.roundEndsAt)
  const sid = session?.id
  const rounds = session?.rounds ?? 3

  useEffect(() => {
    if (!sid || !isAdmin) return
    return onSnapshot(collection(db, 'sessions', sid, 'scores'), (q) => setScores(Object.fromEntries(q.docs.map((d) => [d.id, d.data()]))))
  }, [sid, isAdmin])

  const { hash } = useLocation()
  useEffect(() => {
    if (!isAdmin) return
    const el = document.getElementById(hash.slice(1)) ?? (hash === '#round' ? document.getElementById('next') : null)
    if (!el) return window.scrollTo({ top: 0, behavior: 'smooth' })
    if (el.tagName === 'DETAILS') el.open = true
    el.scrollIntoView({ behavior: 'smooth' })
  }, [hash, isAdmin])

  if (loading) return <p className="p-6 text-center">Loading…</p>
  if (!user || user.isAnonymous) return <AdminLogin />
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-sm p-6 text-center">
        <p className="text-xl font-bold">This account isn't an admin.</p>
        <Button className="mt-4" onClick={() => signOut(auth)}>Sign out</Button>
      </div>
    )
  }

  const status = session?.status
  const round = KEY[status]
  const tables = (round && session.seating?.[round]) ?? []
  const byId = Object.fromEntries(teams.map((t) => [t.id, t]))
  const seated = new Set(tables.flatMap((t) => t.teams))
  const late = round && round !== 'final' && round !== 'playoff' ? teams.filter((t) => t.members.length && !seated.has(t.id)) : []
  const empty = teams.filter((t) => !t.members.length)
  const inPlay = round && round !== 'final'
  const dropped = inPlay ? empty.filter((t) => seated.has(t.id)) : []
  const scoredAt = tables.map((_, j) => scores[`${round}_${j}`])
  const lonely = inPlay ? tables.map((t, i) => ({ i, t })).filter(({ t }) => t.teams.length === 1 && !dropped.some((d) => d.id === t.teams[0])) : []
  const perTeam = session?.format?.playersPerTeam ?? DEFAULT_PER_TEAM
  const unscored = tables.filter((_, i) => !scores[`${round}_${i}`]).length

  const run = async (a) => {
    if (!ready(info)) return setToast('Finish the checklist first')
    const next = a.to(status)
    if (next.startsWith('round') && teams.length - empty.length < 2) return setToast('Need at least 2 teams with players')
    const skip = next.startsWith('round') && empty.length ? `\n\n${empty.map((t) => t.name).join(', ')} have no players and will be skipped.` : ''
    const warn = skip + (round && next !== 'done'
      ? `${unscored ? `\n\n${unscored} table(s) have no score yet.` : ''}${late.length ? `\n\n${late.map((t) => t.name).join(', ')} not seated this round.` : ''}`
      : '')
    if (!(await confirm(`Everyone's screens will update.${warn}`, { title: `${a.label}?`, confirmLabel: a.label }))) return
    try {
      const w = next === 'done' ? await finish(session, teams, players, scores) : await advance(session, teams, next, scores)
      setToast(w || `${a.label} done`)
    } catch { setToast('Something went wrong. Try again.') }
  }
  const back = async () => {
    const prev = previousStatus(status, session, scores)
    if (!(await confirm('Everyone will go back one step. Scores that are saved stay saved.', { title: 'Go back one step?', confirmLabel: 'Go back' }))) return
    goBack(sid, prev).then(() => setToast('Went back one step')).catch(() => setToast('Could not go back'))
  }
  const undo = (i) => async () => {
    if (!(await confirm('The points from this table will be taken away so you can enter it again.', { title: `Undo Table ${i + 1}?`, confirmLabel: 'Undo score' }))) return
    undoScore(sid, `${round}_${i}`, scores[`${round}_${i}`]).then(() => setToast(`Table ${i + 1} score removed`)).catch(() => setToast('Could not undo the score'))
  }
  const restartT = async () => {
    if (!(await confirm('The 15-minute countdown starts again for everyone.', { title: 'Restart timer?', confirmLabel: 'Restart' }))) return
    startTimer(sid).then(() => setToast('Timer restarted')).catch(() => setToast('Could not restart timer'))
  }
  const endT = async () => {
    if (!(await confirm('Everyone will see "Round ended". Use this when a player has gone out.', { title: 'End the round now?', confirmLabel: 'End round' }))) return
    endRound(sid).then(() => setToast('Round ended')).catch(() => setToast('Could not end the round'))
  }
  const wipeAll = async () => {
    const ok = await confirm('This permanently deletes ALL sessions, teams, players, scores and past leaderboards.', {
      title: 'Delete everything?', confirmLabel: 'Delete all', danger: true, confirmText: 'DELETE',
    })
    if (!ok) return
    try { await resetAll(); setToast('All sessions and standings deleted') } catch { setToast('Could not delete everything') }
  }
  const save = (i) => (entries, winnerId, participants) =>
    saveScore(sid, `${round}_${i}`, entries, winnerId, scores[`${round}_${i}`], participants).then(() => setToast(`Table ${i + 1} scored`)).catch((e) => setToast(e.message.length < 90 ? e.message : 'Could not save score'))

  const plan = finalistPlan(session, teams, scores)
  const lastRound = status === `round${rounds}`
  const action = ACTIONS.find((a) => a.ok(status, rounds, plan))
  const hint = status === 'done' ? 'This session is finished. Pick another one, or create a new session, under Session settings.'
    : plan.state === 'blocked' && (lastRound || status === 'playoff') ? `${plan.tie.teams.length} teams are tied for the last ${plan.tie.spots} finalist spot(s) and a play-off can't settle it. Use Fix points to break the tie.`
    : status === 'playoff' ? 'Score the play-off table to continue.' : ''
  const timerPending = round && left == null
  const startT = () => startTimer(sid).then(() => setToast('Timer started')).catch(() => setToast('Could not start timer'))
  const info = prereqs({ status, left, teams, players, tables, scores, round, dropped })
  const n = Number(round)
  const isLeagueRound = /^\d$/.test(round ?? '')
  const to = isLeagueRound ? nextAfterLeague({ ...session, rounds: n }, teams, scores) : null
  const goRound = async () => {
    if (!(await confirm(`Teams are moved to new tables for Round ${n + 1}.`, { title: `Play Round ${n + 1}?`, confirmLabel: `Play Round ${n + 1}` }))) return
    try { if (n + 1 > rounds) await setRounds(sid, n + 1); setToast((await advance(session, teams, `round${n + 1}`, scores)) || `Round ${n + 1} is set`) } catch { setToast('Something went wrong. Try again.') }
  }
  const goFinals = async () => {
    const skipping = n < rounds
    if (!(await confirm(skipping ? `Only ${n} round${n > 1 ? 's' : ''} will count. The remaining rounds are skipped.` : 'Everyone will see the next screen.', { title: skipping ? 'Skip to the finals?' : to === 'playoff' ? 'Start the play-off?' : 'Start the final?', confirmLabel: skipping ? 'Skip to finals' : 'Go' }))) return
    try { await setRounds(sid, n); await advance({ ...session, rounds: n }, teams, to, scores); setToast(to === 'playoff' ? 'Play-off is set' : 'Final is set') } catch { setToast('Something went wrong. Try again.') }
  }
  const secondary = []
  let main = null
  if (['upcoming', 'registration', 'closed'].includes(status)) main = action && { label: action.label, desc: DESC[action.label], onClick: () => run(action) }
  else if (timerPending) main = { label: `Start timer (${mmss(ROUND_SECONDS)})`, desc: 'Players are seated. Start the clock when everyone is ready.', onClick: startT }
  else if (left > 0) secondary.push({ label: 'End round early', always: true, onClick: endT })
  else if (left === 0 && isLeagueRound) {
    const fin = { label: to === 'playoff' ? 'Go to the play-off' : n < rounds ? 'Skip to the finals' : 'Go to the final', onClick: goFinals, disabled: !to }
    const more = n < MAX_ROUNDS && { label: n < rounds ? `Play Round ${n + 1}` : `Play an extra round (Round ${n + 1})`, onClick: goRound }
    main = n < rounds ? more : fin
    secondary.push(...[n < rounds ? fin : more].filter(Boolean))
  } else if (left === 0) main = action && { label: action.label, desc: DESC[action.label], onClick: () => run(action) }
  const prev = previousStatus(status, session, scores)
  const canBack = status !== 'upcoming' && status !== 'done' && !(left > 0)
  const phase = status === 'closed' || left == null ? 'setup' : left > 0 ? 'play' : 'score'
  const guideTitle = status === 'closed' ? 'Before Round 1' : status === 'final' ? 'Final guide' : status === 'playoff' ? 'Play-off guide' : `Round ${round} guide`
  const preRound = ['upcoming', 'registration', 'closed'].includes(status)

  return (
    <div className="relative min-h-svh overflow-x-clip bg-uno-black">
      <Backdrop />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-uno-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="grid size-8 shrink-0 grid-cols-2 overflow-hidden rounded-md border-2 border-white">
              <i className="bg-uno-red" /><i className="bg-uno-yellow" /><i className="bg-uno-green" /><i className="bg-uno-blue" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase leading-none tracking-wider text-white/70">Admin</p>
              <h1 className="truncate text-lg font-extrabold leading-tight">{session?.name ?? 'No session yet'}</h1>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
          </div>
        </div>
      </header>
      <NavBar role="organiser" />

      {!online && (
        <div role="alert" className="relative border-b border-uno-yellow/60 bg-uno-yellow/10 px-3 py-2 text-center font-semibold">
          You're offline. Changes are saved on this device and will sync when you reconnect, so players won't see them yet.
        </div>
      )}
      <div className="relative mx-auto max-w-6xl px-3 pt-4">
        <Button variant="primary" className="mb-3 w-full sm:w-auto" onClick={() => setNewOpen(true)}>+ New session</Button>
    <Section id="sessions" title="Session settings" hint={session ? `${session.name}: switch, edit, duplicate or delete` : 'Create your first session'} collapsible defaultOpen={!session}>
      <SessionPicker active={sid} session={session} teams={teams} toast={setToast} />
      {session && preRound && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <span className="mb-1 block text-sm font-bold">Rounds before the final</span>
          <Select label="Rounds" value={rounds} className="w-28" onChange={(v) => setRounds(sid, v).then(() => setToast(`${v} rounds, then the final`))} options={[{ value: 2, label: '2' }, { value: 3, label: '3' }]} />
          <p className="mt-1 text-sm text-white/70">Use 2 for 9 or fewer players.</p>
        </div>
      )}
    </Section>
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-4 px-3 pb-28 pt-4 md:pb-12 lg:grid-cols-[22rem_1fr] lg:items-start">
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          {session && (
            <>
              <Section title="Session progress"><Stepper steps={STEPS.filter((s) => (rounds === 3 || s.key !== 'round3') && (s.key !== 'playoff' || status === 'playoff' || session.seating?.playoff))} current={status} /></Section>
              <Section id="next" title="Next step">
                {status === 'done' ? <p>{hint}</p> : (
                  <>
                    <NextStep info={info} desc={main?.desc} primary={main} secondary={secondary} onBack={canBack ? back : null} backBlocked={!prev} />
                    {hint && status !== 'playoff' && <p className="mt-3 font-semibold text-uno-yellow">{hint}</p>}
                  </>
                )}
              </Section>
              <div className="grid grid-cols-2 gap-2">
                <Tile label="Teams" value={teams.length} />
                <Tile label="Players" value={players.length} />
                <Tile label="Round" value={round ? (round === 'final' ? 'Final' : round === 'playoff' ? 'Play-off' : `${round} / ${rounds}`) : '—'} />
                <Tile label="Time left" value={left == null ? '—' : mmss(left)} />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {session && (
            <>
              {['closed', 'round1', 'round2', 'round3', 'playoff', 'final'].includes(status) && <RoundGuide key={status} phase={phase} title={guideTitle} />}
              {status === 'final' && (
                <div className={`${WILD_BG} rounded-2xl p-1`}>
                  <div className="rounded-xl bg-uno-black p-4 text-center"><span aria-hidden className="text-4xl">🏆</span><p className="text-2xl font-extrabold">Final: winner takes the title</p></div>
                </div>
              )}
              {round && left != null && <Section title="Round timer"><TimerBar secondsLeft={left} totalSeconds={ROUND_SECONDS} /><div className="mt-3 flex flex-wrap gap-2"><Button variant="ghost" onClick={restartT}>Restart timer</Button>{left > 0 && <Button variant="ghost" onClick={endT}>End round early</Button>}</div></Section>}
              {lastRound && plan.state === 'needsPlayoff' && <Alert>Tie for a finalist spot: {plan.tie.teams.map((t) => t.name).join(', ')}. A play-off game decides it.</Alert>}
              {players.length > 20 && <Alert>{players.length} players: add a casual volunteer-led table for anyone who doesn't want to compete.</Alert>}
              {teams.length > 9 && <Alert>{teams.length} teams: add a casual non-scoring table (only 9 teams can be seated).</Alert>}
              {empty.length > 0 && ['closed', 'round1', 'round2', 'round3'].includes(status) && <Alert>{empty.map((t) => t.name).join(', ')} {empty.length > 1 ? 'have' : 'has'} no players and will be skipped when seating the next round.</Alert>}
              {dropped.map((t) => {
                const at = tables.findIndex((x) => x.teams.includes(t.id))
                const sub = late[0]
                const apply = (next, msg) => setSeating(session, round, next).then(() => setToast(msg)).catch(() => setToast('Could not update the table'))
                return (
                  <Alert key={t.id} action={sub
                    ? <Button onClick={() => apply(tables.map((x, k) => (k === at ? { teams: x.teams.map((id) => (id === t.id ? sub.id : id)) } : x)), `Team ${sub.name} takes Table ${at + 1}`)}>Replace with {sub.name}</Button>
                    : <Button onClick={() => apply(tables.map((x, k) => (k === at ? { teams: x.teams.filter((id) => id !== t.id) } : x)), `Team ${t.name} removed from Table ${at + 1}`)}>Remove from Table {at + 1}</Button>}>
                    Team {t.name} has no players left (Table {at + 1}). {sub ? `${sub.name} is waiting and can take their place.` : 'No team is waiting to replace them.'}
                  </Alert>
                )
              })}
              {lonely.map(({ i, t }) => {
                const to = pickSeat(tables.map((x, k) => (k === i ? { teams: ['-', '-', '-'] } : x)), scoredAt)
                const team = byId[t.teams[0]]
                return (
                  <Alert key={`lone${i}`} action={to && <Button onClick={() => setSeating(session, round, tables.map((x, k) => (k === i ? { teams: [] } : k === to.i ? { teams: [...x.teams, t.teams[0]] } : x))).then(() => setToast(`Team ${team?.name} moved to Table ${to.i + 1}`)).catch(() => setToast('Could not update the table'))}>Move to Table {to.i + 1}</Button>}>
                    Table {i + 1} has only Team {team?.name}. {to ? '' : 'No other table has room, so score it as a one-team table.'}
                  </Alert>
                )
              })}
              {late.map((t) => {
                const spot = pickSeat(tables, tables.map((_, j) => scores[`${round}_${j}`]))
                return (
                  <Alert key={t.id} action={spot && <Button onClick={() => seatTeam(session, round, tables, spot.i, t.id).then(() => setToast(`Team ${t.name} seated at Table ${spot.i + 1}`)).catch(() => setToast('Could not seat team'))}>Seat at Table {spot.i + 1}</Button>}>
                    {spot ? `Team ${t.name} isn't seated in this round.` : `Team ${t.name} can't be seated: all tables are full. They join from the next round.`}
                  </Alert>
                )
              })}
              {round && (
                <Section id="round" title={round === 'final' ? 'Final table' : round === 'playoff' ? 'Play-off table' : `Round ${round} tables`} hint="Pick who went out first, enter cards left, then save.">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-bold">Players per team</span>
                    <Select label="Players per team" value={perTeam} className="w-24" onChange={(v) => setPlayersPerTeam(sid, v).catch(() => setToast('Could not change this'))} options={[1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }))} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tables.map((t, i) => (!t.teams.length ? null : (
                      <TableCard key={`${round}_${i}_${perTeam}_${t.teams.join('')}_${scores[`${round}_${i}`] ? 1 : 0}`} players={players} perTeam={perTeam} history={Object.entries(scores).filter(([k]) => k !== `${round}_${i}`).map(([, v]) => v.participants).filter(Boolean)} index={i} teams={t.teams.map((id) => byId[id]).filter(Boolean)} saved={scores[`${round}_${i}`]} onSave={save(i)} onUndo={undo(i)} />
                    )))}
                  </div>
                </Section>
              )}
              {!['upcoming', 'registration'].includes(status) && <Tracking scores={scores} teams={teams} players={players} />}
              {status !== 'done' && (
                <Section id="teams" title="Teams & players" hint="Add kids who have no phone, move players, or open another team." collapsible defaultOpen={status !== 'upcoming'}>
                  {teams.length ? (
                    <TeamEditor sid={sid} mode={session.mode} teams={teams} players={players} toast={setToast} canAddTeam={['upcoming', 'registration', 'closed', 'round1', 'round2', 'round3'].includes(status)} started={status.startsWith('round')} />
                  ) : <p className="text-white/70">No teams yet.</p>}
                </Section>
              )}
              {!['upcoming', 'registration'].includes(status) && (
                <Section title="Fix points" hint="Set a team's total directly if points were entered by mistake." collapsible>
                  <PointsEditor sid={sid} teams={teams} toast={setToast} />
                </Section>
              )}
            </>
          )}
          {!session && <Section title="Welcome">No active session. Create one under Session settings to get started.</Section>}
        </div>

        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
          {import.meta.env.DEV && (
            <Section title="Developer tools" hint="Development builds only." collapsible danger>
              <p className="mb-3 text-sm text-white/80">Deletes every session, team, player, score and past leaderboard.</p>
              <Button variant="ghost" className="!border-uno-red" onClick={wipeAll}>Delete all sessions &amp; standings</Button>
            </Section>
          )}
        </div>
      </div>
      {newOpen && <Modal title="New session" onClose={() => setNewOpen(false)}><h2 className="text-2xl font-extrabold">New session</h2><NewSession toast={setToast} onDone={() => setNewOpen(false)} /></Modal>}
      {session && round && <RoundEndedModal session={session} left={left} admin nextLabel={action?.label} />}
      <RulesButton />
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
