import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export const STATUSES = ['upcoming', 'registration', 'closed', 'round1', 'round2', 'round3', 'playoff', 'final', 'done']

const EMPTY = { id: null, session: null, sessionLoaded: false, teams: [], players: [], playersReady: false }

export default function useSession() {
  const [sessionId, setSessionId] = useState(null)
  const [metaReady, setMetaReady] = useState(false)
  const [data, setData] = useState(EMPTY)

  useEffect(() => onSnapshot(
    doc(db, 'meta', 'active'),
    (s) => { setSessionId(s.data()?.sessionId ?? null); setMetaReady(true) },
    () => setMetaReady(true),
  ), [])

  useEffect(() => {
    if (!sessionId) return
    const patch = (p) => setData((d) => ({ ...(d.id === sessionId ? d : { ...EMPTY, id: sessionId }), ...p }))
    const base = doc(db, 'sessions', sessionId)
    const unsubs = [
      onSnapshot(base, (s) => patch({ session: s.exists() && !s.data().deleted ? { id: s.id, ...s.data() } : null, sessionLoaded: true }), () => patch({ sessionLoaded: true })),
      onSnapshot(collection(base, 'teams'), (q) => patch({ teams: q.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.number - b.number) })),
      onSnapshot(collection(base, 'players'), (q) => patch({ players: q.docs.map((d) => ({ id: d.id, ...d.data() })), playersReady: true }), () => patch({ playersReady: true })),
    ]
    return () => unsubs.forEach((u) => u())
  }, [sessionId])

  const cur = sessionId && data.id === sessionId ? data : EMPTY
  return {
    session: cur.session,
    teams: cur.teams,
    players: cur.players,
    playersReady: sessionId ? cur.playersReady : true,
    loading: !metaReady || (!!sessionId && !cur.sessionLoaded),
  }
}
