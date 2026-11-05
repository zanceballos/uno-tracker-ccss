import { useEffect, useState } from 'react'
import Button from './Button'
import FullRules from './FullRules'

const SECTIONS = [
  { icon: '🎯', title: 'The goal', items: ['Win points in every round.', 'The best teams play the final.', 'Nobody is knocked out early!'] },
  { icon: '🃏', title: 'Each round', items: ['Sit at your table. Check your phone for the number.', 'Everyone gets 7 cards. Normal UNO rules.', 'The round ends when someone has no cards left.', 'Maximum 15 minutes.'] },
  { icon: '⏱️', title: 'Turn rules', items: ['Each turn lasts 10 seconds.', 'Too slow? Draw 1 card and your turn is skipped.', 'Put a card down by mistake, like when it is not your turn? Draw 1 card as a penalty. Then play carries on.'] },
  { icon: '⭐', title: 'Points', items: ['🥇 Team that goes out first: 3 points', '🥈 Fewest cards left (the others): 2 points', '🥉 Everyone else: 1 point', 'Time ran out? Fewest cards wins.'] },
  { icon: '🏆', title: 'The final', items: ['The top 3 teams play one last game.', 'Tied for a spot? A quick play-off decides.', 'The final winner takes the title!'] },
  { icon: '👥', title: 'Team changes', items: ['New players join the smallest team (max 4).', 'Someone leaves? Your team plays on, or joins another team.'] },
  { icon: '🤝', title: 'Not sure about a rule?', items: ['Ask your table helper.', 'Still unsure? The floater decides.', 'No rule for it? Replay the turn.', 'Good sports win a prize too!'] },
]

export default function RulesButton() {
  const [open, setOpen] = useState(false)
  const [sec, setSec] = useState(0)
  const [full, setFull] = useState(false)
  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 md:bottom-4 min-h-12 rounded-full border-2 border-white bg-uno-black px-5 text-lg font-bold shadow-xl transition active:scale-95"
      >
        📖 Rules
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Game rules"
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l-4 border-white bg-uno-charcoal p-5"
          >
            {full ? (
              <>
                <button onClick={() => setFull(false)} className="mb-2 inline-flex min-h-12 items-center gap-1 font-bold underline">← Quick guide</button>
                <h2 className="mb-1 text-3xl font-extrabold">Full rules</h2>
                <FullRules />
                <Button className="mt-5 w-full" onClick={() => setOpen(false)}>Got it</Button>
              </>
            ) : (
              <>
            <h2 className="mb-1 text-3xl font-extrabold">How to play</h2>
            <p className="mb-4 text-white/80">Tap a card to read more.</p>
            <div className="mb-4 flex flex-col gap-2">
              {SECTIONS.map((x, i) => (
                <div key={x.title} className="rounded-2xl border-2 border-white/30 bg-white/5">
                  <button
                    aria-expanded={sec === i}
                    aria-controls={`rules-${i}`}
                    onClick={() => setSec(sec === i ? -1 : i)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-lg font-extrabold"
                  >
                    <span aria-hidden className="text-2xl">{x.icon}</span>
                    <span className="flex-1">{x.title}</span>
                    <span aria-hidden className={`text-sm transition-transform ${sec === i ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {sec === i && (
                    <ul id={`rules-${i}`} className="space-y-2 px-4 pb-4 text-lg">
                      {x.items.map((t) => <li key={t} className="flex gap-2"><span aria-hidden className="text-uno-yellow">•</span><span>{t}</span></li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mb-2 w-full" onClick={() => setFull(true)}>More details: full rules</Button>
            <Button className="w-full" onClick={() => setOpen(false)}>Got it</Button>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  )
}
