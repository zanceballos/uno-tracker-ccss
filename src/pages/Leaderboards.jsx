import { useState } from 'react'
import Modal from '../components/Modal'
import TeamDetails from '../components/TeamDetails'
import usePast from '../hooks/usePast'
import { HallOfFame, OverallPlayers, PastBoards } from './Welcome'

export default function Leaderboards() {
  const { past, ranking } = usePast()
  const [detail, setDetail] = useState(null)
  return (
    <div className="pt-4">
      <h1 className="mb-4 text-4xl font-extrabold">Leaderboards</h1>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
          <HallOfFame past={past} onSelect={setDetail} />
          <PastBoards past={past} onSelect={setDetail} />
        </div>
        <OverallPlayers ranking={ranking} />
      </div>
      {detail && <Modal title="Team details" onClose={() => setDetail(null)}><TeamDetails team={detail} /></Modal>}
    </div>
  )
}
