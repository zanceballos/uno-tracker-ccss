import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { useConfirm } from '../context'
import Select from '../components/Select'
import { fmtDate } from '../fmtDate'
import { db } from '../firebase'
import { setActive } from './actions'
import SessionTools from './SessionTools'

export default function SessionPicker({ active, session, teams, toast }) {
  const confirm = useConfirm()
  const [list, setList] = useState([])
  useEffect(() => onSnapshot(collection(db, 'sessions'), (q) =>
    setList(q.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s) => !s.deleted).sort((a, b) => (b.date?.seconds ?? 0) - (a.date?.seconds ?? 0))),
  ), [])
  const change = async (id) => {
    if (id === active) return
    if (!(await confirm('Everyone will immediately see the other session.', { title: 'Switch active session?', confirmLabel: 'Switch' }))) return
    return setActive(id).then(() => toast('Active session changed. Everyone now sees it.')).catch(() => toast('Could not change session'))
  }
  return (
    <div className="flex flex-col gap-3">
      {list.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-bold">Active session</span>
          <Select
            label="Active session" value={active} onChange={change} className="w-full"
            options={list.map((s) => ({ value: s.id, label: `${s.name} · ${s.status} · ${fmtDate(s.date)}` }))}
          />
        </div>
      )}
      {session && <SessionTools key={session.id} session={session} teams={teams} others={list.filter((s) => s.id !== session.id)} toast={toast} />}
    </div>
  )
}
