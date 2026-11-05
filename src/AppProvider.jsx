import { useMemo } from 'react'
import { AppContext } from './context'
import { firstName } from './firstName'
import useAuth from './hooks/useAuth'
import useSession from './hooks/useSession'


export default function AppProvider({ children }) {
  const auth = useAuth()
  const { session, teams, players, playersReady, loading } = useSession()
  const value = useMemo(() => {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem('uno-reg')) } catch { /* ignore */ }
    const mine = players.find((p) => p.id === auth.user?.uid)
    const fallback = saved && saved.sessionId === session?.id && !playersReady ? saved : null
    const teamId = mine?.teamId ?? fallback?.teamId
    const view = teams.map((t) => ({
      ...t,
      points: t.points ?? 0,
      members: players.filter((p) => p.teamId === t.id).map((p) => firstName(p.name)),
    }))
    return {
      ...auth, session, players, loading: loading || auth.loading,
      teams: view,
      myName: mine?.name ?? fallback?.name,
      registered: !!(mine || fallback),
      myTeam: view.find((t) => t.id === teamId) ?? null,
    }
  }, [auth, session, teams, players, playersReady, loading])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
