import { useState } from 'react'
import { Section } from './ui'

const STEPS = {
  setup: [
    'Announce the tables. Players can see theirs on their phones.',
    'Teams sit at their assigned tables.',
    'Shuffle, then deal 7 cards to every player.',
    'Turn over the top card to start the discard pile.',
    'Remind players of the turn rules: 10 seconds a turn (late = draw 1 and skip), and draw 1 for a card played by mistake.',
    'Facilitators ready? Press "Start timer".',
  ],
  play: [
    'Facilitators watch the 10-second turns and apply the penalties.',
    'Settle disputes with the rules sheet. The floater makes the final call.',
    'The round ends when a player has no cards left, or after 15 minutes.',
    'Time up? Count the cards. The fewest gets 2 points, the others 1.',
    'A walk-in arrives or someone leaves? Use Teams & players.',
  ],
  score: [
    'Note who went out first at each table.',
    'Count the cards left for each team.',
    'Enter the results in the table scores and save.',
    'Check every table shows "Scored ✓".',
    'Players rotate to their next tables.',
    'Press the next-step button (next round, play-off or final).',
  ],
}
const TABS = [['setup', '1 · Set up'], ['play', '2 · Play'], ['score', '3 · Score']]

export default function RoundGuide({ phase, title }) {
  const [tab, setTab] = useState(null)
  const [done, setDone] = useState({})
  const cur = tab ?? phase
  return (
    <Section title={title} hint="Tick each step as you go. Nothing is locked, it's just a checklist." collapsible defaultOpen>
      <div role="tablist" aria-label="Round phase" className="mb-3 grid grid-cols-3 gap-1">
        {TABS.map(([k, label]) => (
          <button
            key={k} role="tab" aria-selected={cur === k} onClick={() => setTab(k)}
            className={`min-h-12 rounded-lg px-2 text-sm font-bold ${cur === k ? 'bg-white text-uno-black' : 'border border-white/20'} ${phase === k && cur !== k ? 'ring-2 ring-uno-yellow' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="space-y-1">
        {STEPS[cur].map((t, i) => {
          const id = `${cur}:${i}`
          return (
            <li key={id}>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                <input type="checkbox" checked={!!done[id]} onChange={() => setDone({ ...done, [id]: !done[id] })} className="mt-0.5 size-6 shrink-0 accent-uno-green" />
                <span className={done[id] ? 'text-white/50 line-through' : ''}>{t}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
