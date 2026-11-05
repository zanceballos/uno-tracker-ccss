import TeamCard from '../components/TeamCard'
import { useApp } from '../context'

export default function Waiting() {
  const { teams, myTeam } = useApp()
  return (
    <div className="pt-4">
      <h1 className="text-4xl font-extrabold">Registration closed</h1>
      <p className="mb-4 mt-1">Teams are set. Tables are announced when Round 1 starts.</p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => <TeamCard key={t.id} team={t} roster colorIndex={t.colorIndex} highlight={t.id === myTeam?.id} />)}
      </ul>
    </div>
  )
}
