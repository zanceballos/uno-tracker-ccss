import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function usePast() {
  const [past, setPast] = useState([])
  useEffect(() => onSnapshot(collection(db, 'pastSessions'), (q) =>
    setPast(q.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date?.seconds ?? 0) - (a.date?.seconds ?? 0))),
  ), [])
  const totals = new Map()
  for (const s of past)
    for (const p of s.players ?? []) {
      const first = String(p.name).trim()
      const k = first.toLowerCase()
      totals.set(k, { name: first, points: (totals.get(k)?.points ?? 0) + (p.points ?? 0), sessions: (totals.get(k)?.sessions ?? 0) + 1 })
    }
  return { past, ranking: [...totals.values()].sort((a, b) => b.points - a.points) }
}
