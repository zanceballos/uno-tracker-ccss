import Button from '../components/Button'
import { ready } from '../logic/guard'

export default function NextStep({ info, desc, primary, secondary = [], onBack, backBlocked }) {
  const ok = ready(info)
  const missing = info.checks.filter((c) => !c.ok)
  return (
    <div>
      {info.headline && <p className="mb-2 font-extrabold">{info.headline}</p>}
      {info.checks.length > 0 && (
        <ul className="mb-2 space-y-1">
          {info.checks.map((c) => <li key={c.text} className={`flex gap-2 ${c.ok ? 'text-uno-green' : 'font-bold text-uno-yellow'}`}><span aria-hidden>{c.ok ? '✅' : '⬜'}</span>{c.text}</li>)}
        </ul>
      )}
      {info.reminders.length > 0 && (
        <ul className="mb-3 space-y-1 text-sm text-white/80">
          {info.reminders.map((r) => <li key={r} className="flex gap-2"><span aria-hidden>💡</span>{r}</li>)}
        </ul>
      )}
      {desc && ok && <p className="mb-3">{desc}</p>}
      {primary && <Button variant="primary" className="w-full" disabled={!ok} onClick={primary.onClick}>{primary.label}</Button>}
      {!ok && <p className="mt-2 font-semibold text-uno-yellow">{info.block ?? `Not yet: ${missing[0].text.toLowerCase()}.`}</p>}
      {secondary.map((b) => <Button key={b.label} variant="ghost" className="mt-2 w-full" disabled={!b.always && (!ok || b.disabled)} onClick={b.onClick}>{b.label}</Button>)}
      {onBack && <Button variant="ghost" className="mt-2 w-full" disabled={backBlocked} onClick={onBack}>← Go back one step</Button>}
      {backBlocked && onBack && <p className="mt-1 text-sm text-white/70">Undo this round's scores first to go back.</p>}
    </div>
  )
}
