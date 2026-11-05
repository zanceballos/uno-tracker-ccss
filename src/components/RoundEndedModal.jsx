import { useState } from 'react'
import Modal from './Modal'

export default function RoundEndedModal({ session, left, admin, nextLabel }) {
  const [seen, setSeen] = useState(null)
  const st = session.status
  const key = `${session.id}:${st}:${session.roundEndsAt?.seconds}`
  if (left !== 0 || seen === key) return null
  const last = st === `round${session.rounds ?? 3}`
  const label = st === 'final' ? 'The final' : st === 'playoff' ? 'The play-off' : `Round ${st.replace('round', '')}`
  const next = st === 'final' ? 'Next: the winner and final standings will be announced.'
    : st === 'playoff' ? 'Next: the finalists will be announced.'
    : last ? 'Next: the volunteers will announce the finalists (and a play-off if teams are tied).'
    : 'Next: your new table for the next round will appear on this page. Stay put until the volunteers say move.'
  return (
    <Modal title="Round ended" onClose={() => setSeen(key)}>
      <p aria-hidden className="text-5xl">⏰</p>
      <h2 className="text-2xl font-extrabold">{label} has ended!</h2>
      {admin ? (
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Tell players to stop and count their cards.</li>
          <li>Enter each table's result (who went out first, cards left) and save.</li>
          <li>When every table shows "Scored ✓", press {nextLabel ? `"${nextLabel}"` : 'the next-step button'}.</li>
        </ol>
      ) : (
        <>
          <p className="mt-2">Stop playing and put your cards down. Count your cards and tell your table helper.</p>
          <p className="mt-2 font-bold">{next}</p>
        </>
      )}
    </Modal>
  )
}
