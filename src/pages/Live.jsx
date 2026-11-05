import { useState } from 'react'
import Podium from '../components/Podium'
import RoundEndedModal from '../components/RoundEndedModal'
import LiveDot from '../components/LiveDot'
import TeamCard from '../components/TeamCard'
import TimerBar from '../components/TimerBar'
import { teamColor } from '../components/teamColors'
import NameList from '../components/NameList'
import TeamBadge from '../components/TeamBadge'
import { useApp } from '../context'
import useCountdownTo from '../hooks/useCountdownTo'
import useOnline from '../hooks/useOnline'

export default function Live() {
  const { session, teams, myTeam } = useApp()
  const [q, setQ] = useState('')
  const online = useOnline()
  const left = useCountdownTo(session.roundEndsAt)
  const stage = session.status
  const round = stage === 'final' || stage === 'playoff' ? stage : stage.replace('round', '')
  const tables = session.seating?.[round] ?? []
  const tableOf = (id) => tables.findIndex((t) => t.teams.includes(id)) + 1 || null
  const ranked = teams.filter((t) => t.members.length).sort((a, b) => b.points - a.points)
  const term = q.trim().toLowerCase()
  const byId = Object.fromEntries(teams.map((t) => [t.id, t]))
  const myTable = myTeam && tableOf(myTeam.id)

  return (
    <div className="pb-4">
      <RoundEndedModal session={session} left={left} />
      <div className="sticky top-0 z-10 -mx-4 bg-uno-black/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2 rounded-full border-2 border-white px-4 py-2">
          <div>
            <p className="text-lg font-extrabold leading-tight">{stage === 'final' ? 'Finals' : stage === 'playoff' ? 'Play-off' : `Round ${round} of ${session.rounds ?? 3}`}</p>
            <p className="text-sm tabular-nums">
              {left == null ? 'Waiting to start' : left === 0 ? "Time's up!" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left`}
            </p>
          </div>
          <LiveDot connected={online} />
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <div>
      {myTable && (
        <p className="mt-3 rounded-2xl border-4 border-white bg-white px-4 py-3 text-center text-2xl font-extrabold text-uno-black">
          You are at Table {myTable}
        </p>
      )}
      {left == null
        ? <p className="mt-4 rounded-2xl border-2 border-dashed border-white/70 px-4 py-3 text-center font-semibold">Take your seats. The volunteers will start the timer soon.</p>
        : <div className="mt-4"><TimerBar secondsLeft={left} totalSeconds={900} /></div>}
      <h2 className="mb-2 mt-6 text-2xl font-extrabold lg:text-4xl">Who's playing</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {tables.map((t, i) => (!t.teams.length ? null : (
          <section key={i} className="rounded-2xl border-2 border-white/70 bg-uno-charcoal p-3 lg:p-4">
            <h3 className="mb-2 text-lg font-extrabold lg:text-3xl">Table {i + 1}</h3>
            <ul className="flex flex-col gap-1.5 lg:gap-2.5">
              {t.teams.map((id) => {
                const tm = byId[id]
                if (!tm?.members.length) return null
                const c = teamColor(tm.colorIndex)
                return (
                  <li key={id} className={`rounded-xl px-3 py-2 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.7)] lg:px-4 lg:py-3 ${c.bg}`}>
                    <div className="flex items-center justify-between gap-2">
                      <TeamBadge colorIndex={tm.colorIndex} name={tm.name} className="min-w-0 text-base lg:text-3xl" />
                      <span className="shrink-0 text-lg font-extrabold tabular-nums lg:text-3xl">{tm.points} pts</span>
                    </div>
                    <NameList team={tm} className="mt-2 text-base font-semibold lg:text-2xl" />
                  </li>
                )
              })}
            </ul>
          </section>
        )))}
        {!tables.length && <p className="text-white/80">Tables will appear shortly.</p>}
      </div>
      </div>
      <div>
      <h2 className="mb-2 mt-6 text-2xl font-extrabold lg:mt-3 lg:text-4xl">Leaderboard</h2>
      <label htmlFor="find" className="text-sm font-bold">Find my team</label>
      <input id="find" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Team or player name" className="mb-3 mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black" />
      {(() => {
        const isHit = (t) => (term && (t.name + t.members.join(' ')).toLowerCase().includes(term)) || (!term && t.id === myTeam?.id)
        const showPodium = ranked.length >= 3 && ranked[0].points > 0
        return (
          <>
            {showPodium
              ? <Podium items={ranked.map((t) => ({ ...t, highlight: isHit(t) }))} />
              : <p className="rounded-2xl border-2 border-dashed border-white/70 px-4 py-6 text-center text-lg font-semibold lg:py-10 lg:text-2xl">🏆 The podium appears once teams start scoring.</p>}
            {!ranked.length && <p className="mt-4 rounded-2xl border-2 border-dashed border-white/70 px-4 py-6 text-center text-lg font-semibold lg:text-2xl">No teams yet. They'll show up here as they join.</p>}
            <ul className="mt-4 flex flex-col gap-3">
              {ranked.map((t, i) => (showPodium && i < 3 ? null : (
                <TeamCard key={t.id} team={t} rank={i + 1} colorIndex={t.colorIndex} highlight={isHit(t)} table={tableOf(t.id)} />
              )))}
            </ul>
          </>
        )
      })()}
      </div>
      </div>
    </div>
  )
}
