import { useState } from 'react'
import { useApp, useConfirm } from '../context'
import { leaveTeam } from '../leaveTeam'
import Button from './Button'

export default function LeaveTeam() {
  const { session, user, myTeam } = useApp()
  const confirm = useConfirm()
  const [err, setErr] = useState('')
  if (session?.status !== 'registration' || !myTeam) return null
  const leave = async () => {
    const ok = await confirm(`You'll leave Team ${myTeam.name}. You can join another team afterwards.`, { title: 'Leave team?', confirmLabel: 'Leave team', danger: true })
    if (!ok) return
    try { await leaveTeam(session.id, user.uid, myTeam.id) } catch { setErr('Could not leave the team. Try again.') }
  }
  return (
    <div className="w-full">
      <Button variant="ghost" className="w-full" onClick={leave}>Leave team</Button>
      {err && <p role="alert" className="mt-2 text-sm font-semibold text-uno-yellow">{err}</p>}
    </div>
  )
}
