import NameList from './NameList'
import TeamBadge from './TeamBadge'
import RankBadge from './RankBadge'
import { teamColor } from './teamColors'

export default function TeamCard({ team, rank, colorIndex, highlight, table, roster }) {
  const c = teamColor(colorIndex)
  return (
    <li
      className={`relative overflow-hidden rounded-2xl border-4 border-white p-3 shadow-lg transition-all duration-300 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.7)] ${c.bg} ${
        highlight ? 'ring-4 ring-offset-2 ring-offset-uno-black ring-white scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <TeamBadge colorIndex={colorIndex} name={team.name} className="text-lg lg:text-3xl" />
          {team.members?.length
            ? <NameList team={team} className="mt-2 text-base font-semibold lg:text-2xl" />
            : <p className="mt-2 text-base font-semibold lg:text-2xl">No players yet</p>}
        </div>
        {highlight && table != null && <p className="shrink-0 rounded-full bg-uno-black px-3 py-0.5 text-sm font-bold text-white lg:text-2xl">Table {table}</p>}
      </div>
      {roster ? (
        <p className="mt-2 text-sm font-bold">{team.members.length}/4 players</p>
      ) : (
        <div className="mt-2 flex items-end justify-between">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wide lg:text-2xl">Rank</span>
            <RankBadge rank={rank} />
          </div>
          <div className="-rotate-12 rounded-[50%] bg-white px-8 py-2 text-center text-uno-black">
            <span className="block text-5xl font-extrabold tabular-nums leading-none lg:text-6xl">{team.points}</span>
            <span className="block text-xs font-bold uppercase tracking-wide">points</span>
          </div>
        </div>
      )}
    </li>
  )
}
