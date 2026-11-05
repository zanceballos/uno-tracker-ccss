import { teamColor } from './teamColors'

// Team name as a bordered pill so it never reads like a player name.
export default function TeamBadge({ colorIndex, name, className = '' }) {
  const c = colorIndex != null ? teamColor(colorIndex) : null
  return (
    <span className={`inline-flex max-w-full items-center gap-[0.4em] rounded-full border-2 border-white/80 bg-uno-black/70 py-0.5 pl-[0.4em] pr-[0.8em] font-extrabold leading-tight text-white ${c ? '' : 'pl-[0.8em]'} ${className}`}>
      {c && <span className={`grid size-[1.5em] shrink-0 place-items-center rounded-full text-[0.65em] [text-shadow:none] ${c.bg} ${c.text}`}>{c.letter}</span>}
      <span className="truncate">{name}</span>
    </span>
  )
}
