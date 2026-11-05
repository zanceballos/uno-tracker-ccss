import Podium from '../components/Podium'
import TeamCard from '../components/TeamCard'
import { WILD_BG } from '../components/teamColors'
import { useApp } from '../context'
import NameList from '../components/NameList'
import TeamBadge from '../components/TeamBadge'
import { finalOrder } from '../logic/ranking'
import { fmtDate } from '../fmtDate'

export default function Results() {
  const { session, teams, myTeam } = useApp()
  const ranked = finalOrder(teams)
  const items = ranked.map((t) => ({ ...t, sub: t.finalAward != null ? `Final: ${t.finalAward} pts` : undefined, highlight: t.id === myTeam?.id }))
  return (
    <div className="pt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <div>
        {ranked[0] && (
          <div className={`${WILD_BG} rounded-3xl p-1`}>
            <div className="rounded-[20px] bg-uno-black px-5 py-6 text-center">
              <p aria-hidden className="text-6xl">🏆</p>
              <p className="text-sm font-bold uppercase tracking-widest">Winner</p>
              <NameList team={ranked[0]} center className="text-2xl font-extrabold" />
              {ranked[0].members.length > 0 && <TeamBadge colorIndex={ranked[0].colorIndex} name={ranked[0].name} className="mt-2 text-lg" />}
              <p className="mt-2 text-sm text-white/80">{session?.name} · {fmtDate(session?.date)}</p>
            </div>
          </div>
        )}
        <h2 className="mb-3 mt-6 text-2xl font-extrabold">Final standings</h2>
        <Podium items={items} />
      </div>
      {ranked.length > 3 && (
        <div className="mt-6 lg:mt-0">
          <h2 className="mb-3 text-2xl font-extrabold">Other teams</h2>
          <ul className="flex flex-col gap-3">
            {ranked.slice(3).map((t, i) => <TeamCard key={t.id} team={t} rank={i + 4} colorIndex={t.colorIndex} highlight={t.id === myTeam?.id} />)}
          </ul>
        </div>
      )}
    </div>
  )
}
