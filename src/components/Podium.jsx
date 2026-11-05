import NameList from './NameList'
import TeamBadge from './TeamBadge'

const STYLES = [
  { label: '1st', icon: '👑', block: 'bg-yellow-400', h: 'h-28', order: 'order-2' },
  { label: '2nd', icon: '🥈', block: 'bg-gray-300', h: 'h-20', order: 'order-1' },
  { label: '3rd', icon: '🥉', block: 'bg-amber-600', h: 'h-14', order: 'order-3' },
]

export default function Podium({ items, date, onSelect }) {
  const Tag = onSelect ? 'button' : 'div'
  return (
    <div>
      {date && <p className="mb-2 text-center text-sm font-semibold text-white/80">Won on {date}</p>}
      <ol aria-label="Top three" className="flex items-end gap-2">
        {items.slice(0, 3).map((t, i) => {
          const s = STYLES[i]
          return (
            <li key={t.name} className={`flex min-w-0 flex-1 flex-col items-center ${s.order}`}>
              <Tag type={onSelect ? 'button' : undefined} onClick={onSelect ? () => onSelect(t) : undefined} className="flex w-full min-w-0 flex-col items-center text-center">
                <span aria-hidden className={i === 0 ? 'text-4xl' : 'text-3xl'}>{s.icon}</span>
                <TeamBadge colorIndex={t.colorIndex} name={t.name} className="text-xs sm:text-sm lg:text-3xl" />
                {t.members?.length > 0 && <NameList team={t} center className="mt-1 text-xs font-semibold text-white/90 sm:text-sm lg:text-2xl" />}
                {t.sub && <span className="mt-0.5 w-full break-words text-xs font-bold text-uno-yellow">{t.sub}</span>}
              </Tag>
              <div className={`mt-1 flex w-full ${s.h} flex-col items-center justify-center rounded-t-2xl border-4 border-b-0 border-white ${s.block} text-uno-black ${t.highlight ? 'ring-4 ring-white ring-offset-2 ring-offset-uno-black' : ''}`}>
                <span className="text-sm font-extrabold lg:text-3xl">{s.label}</span>
                <span className="text-3xl font-extrabold leading-none tabular-nums lg:text-5xl">{t.points}</span>
                <span className="text-xs font-bold">pts</span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
