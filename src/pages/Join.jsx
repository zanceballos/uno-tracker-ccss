import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import Button from '../components/Button'
import LeaveTeam from '../components/LeaveTeam'
import TeamBadge from '../components/TeamBadge'
import { teamColor } from '../components/teamColors'
import { useApp, useConfirm } from '../context'
import { leaveTeam } from '../leaveTeam'
import { db } from '../firebase'
import useOnline from '../hooks/useOnline'

export default function Join() {
  const { session, teams, user, myTeam, myName, registered, loading } = useApp()
  const confirm = useConfirm()
  const mixed = session?.mode === 'mixed'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const online = useOnline()

  if (loading) return <p className="pt-6 text-center">Loading…</p>
  if (myTeam) {
    const c = teamColor(myTeam.colorIndex)
    return (
      <div className="mx-auto max-w-xl pt-6 text-center">
        <p className={`rounded-3xl border-4 border-white p-8 text-3xl font-extrabold ${c.bg} ${c.text}`}>{c.letter} · You're in Team {myTeam.name}</p>
        <p className="mt-4 font-bold">Your team so far</p>
        <p>{myTeam.members.join(', ')}</p>
        <p className="mt-3 text-white/80">Keep this page handy. We'll move you along when the session starts.</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <LeaveTeam />
          <Link to="/home" className="inline-flex min-h-12 items-center underline">Back to home</Link>
        </div>
      </div>
    )
  }
  if (mixed && registered) {
    const leave = async () => {
      if (session.status !== 'registration') return
      if (!(await confirm('You will be taken off the list. You can join again afterwards.', { title: 'Leave the game?', confirmLabel: 'Leave', danger: true }))) return
      try { await leaveTeam(session.id, user.uid, null) } catch { setErr('Could not leave. Try again.') }
    }
    return (
      <div className="mx-auto max-w-xl pt-6 text-center">
        <p className="rounded-3xl border-4 border-white p-8 text-2xl font-extrabold"><span aria-hidden className="block text-5xl">⏳</span>You're in, {myName}!</p>
        <p className="mt-4 text-xl font-bold">Waiting for the organiser to assign your team</p>
        <p className="mt-2 text-white/80">Keep this page open. Your team will show up here.</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          {session.status === 'registration' && <button type="button" onClick={leave} className="min-h-12 rounded-full border-2 border-white/60 px-6 font-bold">Leave</button>}
          {err && <p role="alert" className="text-sm font-semibold text-uno-yellow">{err}</p>}
          <Link to="/home" className="inline-flex min-h-12 items-center underline">Back to home</Link>
        </div>
      </div>
    )
  }
  if (session?.status !== 'registration') return <Navigate to="/home" replace />

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!user) return setErr('Could not connect. Refresh the page and try again.')
    if (!name.trim()) return setErr('Please enter your name or nickname.')
    if (mixed) {
      setBusy(true)
      try {
        await setDoc(doc(db, 'sessions', session.id, 'players', user.uid), { name: name.trim(), teamId: null, points: 0, createdAt: serverTimestamp() })
        localStorage.setItem('uno-reg', JSON.stringify({ sessionId: session.id, teamId: null, name: name.trim() }))
      } catch { setErr('Could not join. Check your connection and try again.') } finally { setBusy(false) }
      return
    }
    const m = code.trim().match(/^(?:(red|yellow|green|blue|orange|purple|pink|teal|silver)\s*)?(\d+)$/i)
    const team = m && teams.find((t) => t.number === Number(m[2]) && (!m[1] || teamColor(t.colorIndex).name.toLowerCase() === m[1].toLowerCase()))
    if (!team) return setErr("We can't find that team code. Try something like Blue 3.")
    if ((team.size ?? 0) >= 4) return setErr(`Team ${team.name} is full (4 players). Ask a volunteer for help.`)
    setBusy(true)
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'sessions', session.id, 'teams', team.id)
        const size = (await tx.get(ref)).data().size ?? 0
        if (size >= 4) throw new Error('full')
        tx.set(doc(db, 'sessions', session.id, 'players', user.uid), { name: name.trim(), teamId: team.id, points: 0, createdAt: serverTimestamp() })
        tx.update(ref, { size: size + 1 })
      })
      localStorage.setItem('uno-reg', JSON.stringify({ sessionId: session.id, teamId: team.id, name: name.trim() }))
    } catch (ex) {
      setErr(ex.message === 'full' ? `Team ${team.name} just filled up. Try another team.` : 'Could not join. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl pt-4 lg:max-w-5xl">
      <h1 className="text-4xl font-extrabold">Join the game</h1>
      <label htmlFor="name" className="mt-5 block font-bold">Your first name or nickname</label>
      <p className="text-sm text-white/80">Just one word, no surnames. Everyone can see it.</p>
      <input id="name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} autoComplete="given-name" className="mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black" />
      {mixed && <p className="mt-4 rounded-xl border-2 border-white/40 bg-white/5 px-4 py-3 text-lg">The organiser will put you in a team. Just type your name and join!</p>}
      {!mixed && <p className="mt-5 font-bold">Pick a team</p>}
      {!mixed && <p className="text-sm text-white/80">See who's already in each team and join your friends. Teams of 3 are ideal, 4 is the maximum.</p>}
      {!mixed && <div className="mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-4">
        {teams.map((t) => {
          const c = teamColor(t.colorIndex)
          const n = t.members.length
          const full = n >= 4
          const sel = code === t.name
          return (
            <button key={t.id} type="button" disabled={full} aria-pressed={sel} onClick={() => setCode(t.name)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left lg:gap-4 lg:p-5 transition active:scale-95 disabled:opacity-50 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.7)] ${c.bg} ${sel ? 'border-white ring-4 ring-white' : 'border-white/60'}`}>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-current text-xl font-extrabold lg:size-16 lg:text-4xl">{c.letter}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-lg font-extrabold lg:text-3xl"><TeamBadge name={t.name} className="min-w-0" /><span className="shrink-0">{full ? 'Full' : `${n}/4`}</span></span>
                <span className="mt-1 block text-base font-semibold lg:text-2xl">{n ? t.members.join(', ') : 'No players yet'}</span>
              </span>
            </button>
          )
        })}
      </div>}
      {!mixed && <><label htmlFor="code" className="mt-4 block font-bold">Or type a team code</label>
      <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. Blue 3" className="mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black" /></>}
      {!online && <p role="alert" className="mt-4 rounded-xl border-2 border-uno-yellow bg-uno-yellow/10 px-4 py-2 font-semibold">You're offline. Reconnect to join a team.</p>}
      {err && <p role="alert" className="mt-4 rounded-xl border-2 border-uno-red bg-uno-red/20 px-4 py-2 font-semibold">{err}</p>}
      <Button type="submit" variant="primary" disabled={busy || !online} className="mt-5 w-full">{busy ? 'Joining…' : mixed ? 'Join' : 'Join team'}</Button>
    </form>
  )
}
