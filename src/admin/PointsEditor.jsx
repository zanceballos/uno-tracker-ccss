import { useState } from 'react'
import Button from '../components/Button'
import { teamColor } from '../components/teamColors'
import { useConfirm } from '../context'
import { adjustPoints } from './actions'

function Row({ sid, team, toast }) {
  const confirm = useConfirm()
  const [v, setV] = useState('')
  const c = teamColor(team.colorIndex)
  const target = v === '' ? null : Number(v)
  const save = async () => {
    if (target == null || Number.isNaN(target) || target < 0) return toast('Enter a valid points total')
    if (!(await confirm(`${team.name}: ${team.points} → ${target} points.`, { title: 'Fix points?', confirmLabel: 'Update' }))) return
    try { await adjustPoints(sid, team, target); toast(`${team.name} corrected: ${team.points} → ${target} points`); setV('') }
    catch { toast('Could not update points') }
  }
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-xl p-2 ${c.bg} ${c.text}`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-current text-sm font-extrabold">{c.letter}</span>
      <span className="min-w-0 flex-1 truncate font-bold">{team.name}</span>
      <span className="font-extrabold tabular-nums">{team.points} pts</span>
      <input type="number" min="0" inputMode="numeric" aria-label={`New total for ${team.name}`} placeholder="New total" value={v} onChange={(e) => setV(e.target.value)} className="h-12 w-24 rounded-lg bg-white px-2 text-center font-bold text-uno-black" />
      <Button onClick={save} disabled={target == null} className="!min-h-12 !px-4 !text-base">Fix</Button>
    </div>
  )
}

export default function PointsEditor({ sid, teams, toast }) {
  return (
    <div>
      <p className="mb-2 text-sm text-white/80">Set a team's total directly if points were entered by mistake. Each change is logged.</p>
      <div className="flex flex-col gap-2">{teams.map((t) => <Row key={t.id} sid={sid} team={t} toast={toast} />)}</div>
    </div>
  )
}
