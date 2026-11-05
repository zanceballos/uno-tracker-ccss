import { Navigate } from 'react-router-dom'
import { useApp } from '../context'
import Live from './Live'
import Results from './Results'
import Waiting from './Waiting'

export default function Play() {
  const { session, loading } = useApp()
  if (loading) return <p className="pt-6 text-center">Loading…</p>
  const s = session?.status
  if (s === 'closed') return <Waiting />
  if (['round1', 'round2', 'round3', 'playoff', 'final'].includes(s)) return <Live />
  if (s === 'done') return <Results />
  return <Navigate to="/home" replace />
}
