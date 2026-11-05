import { useState } from 'react'
import Button from '../components/Button'
import Select from '../components/Select'
import { useConfirm } from '../context'
import { MODES } from '../logic/modes'
import { createSession, deleteSession, updateSession } from './actions'

const p2 = (n) => String(n).padStart(2, '0')
const toLocal = (ts) => {
  const d = ts?.toDate?.() ?? new Date()
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`
}

export default function SessionTools({ session, teams, others, toast }) {
  const confirm = useConfirm()
  const [f, setF] = useState({ name: session.name, date: toLocal(session.date), mode: session.mode ?? 'choose' })
  const input = 'mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black'
  const canMode = ['upcoming', 'registration'].includes(session.status)
  const run = async (fn, msg) => { try { await fn(); toast(msg) } catch { toast('Something went wrong. Try again.') } }
  const save = (e) => { e.preventDefault(); run(() => updateSession(session.id, f), 'Session saved') }
  const duplicate = async () => {
    if (!(await confirm('A new empty session is made with the same name, date, mode and number of teams. Everyone will see it.', { title: 'Duplicate this session?', confirmLabel: 'Duplicate' }))) return
    run(() => createSession({ name: `${session.name} (copy)`, date: session.date.toDate(), teamCount: teams.length, mode: session.mode ?? 'choose' }), 'Session duplicated')
  }
  const remove = async () => {
    if (!(await confirm(`"${session.name}" will be hidden and players will no longer see it.\n\nIts results are also removed from the Hall of fame, Past leaderboards and Overall players, so players lose the points they earned in it. Other sessions are not touched. This cannot be undone.`, { title: 'Delete this session?', confirmLabel: 'Delete session', danger: true }))) return
    run(() => deleteSession(session.id, { wasActive: true, nextId: others[0]?.id }), 'Session deleted')
  }
  return (
    <details className="mt-4 border-t border-white/10 pt-2">
      <summary className="min-h-12 cursor-pointer py-2 font-bold">✎ Edit, duplicate or delete this session</summary>
      <form onSubmit={save}>
        <label className="mt-2 block font-bold">Name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></label>
        <label className="mt-3 block font-bold">Date and time<input required type="datetime-local" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={input} /></label>
        <span className="mt-3 block font-bold">How do players get teams?</span>
        <Select label="Team mode" value={f.mode} onChange={(mode) => canMode && setF({ ...f, mode })} options={MODES} className="mt-1 w-full" />
        {!canMode && <p className="mt-1 text-sm text-white/70">The mode can only change before registration closes.</p>}
        <Button type="submit" className="mt-3 w-full">Save changes</Button>
      </form>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={duplicate}>Duplicate</Button>
        <Button variant="ghost" className="!border-uno-red" onClick={remove}>Delete</Button>
      </div>
    </details>
  )
}
