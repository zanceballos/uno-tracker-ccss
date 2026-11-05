const BOX = 'rounded-2xl border bg-uno-charcoal p-4'

export function Section({ id, title, hint, collapsible, defaultOpen, danger, className = '', children }) {
  const tone = danger ? 'border-uno-red/60' : 'border-white/15'
  const head = (
    <div>
      <h2 className="text-lg font-extrabold">{title}</h2>
      {hint && <p className="text-sm text-white/70">{hint}</p>}
    </div>
  )
  if (collapsible) {
    return (
      <details id={id} open={defaultOpen} className={`scroll-mt-32 ${BOX} ${tone} ${className}`}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2">
          {head}<span aria-hidden className="text-white/70">▾</span>
        </summary>
        <div className="mt-3">{children}</div>
      </details>
    )
  }
  return (
    <section id={id} className={`scroll-mt-32 ${BOX} ${tone} ${className}`}>
      <div className="mb-3">{head}</div>
      {children}
    </section>
  )
}

export function Tile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-white/70">{label}</p>
      <p className="text-3xl font-extrabold tabular-nums leading-tight">{value}</p>
    </div>
  )
}

export function Alert({ children, action }) {
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-uno-yellow/60 bg-uno-yellow/10 px-4 py-3">
      <p className="font-semibold">{children}</p>
      {action}
    </div>
  )
}

export function Stepper({ steps, current }) {
  const idx = Math.max(0, steps.findIndex((s) => s.key === current))
  return (
    <div>
      <p className="text-sm text-white/70">You are here: step {idx + 1} of {steps.length}</p>
      <p className="text-2xl font-extrabold leading-tight">{steps[idx].label}</p>
      <ol aria-label="Session progress" className="mt-3 flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <li key={s.key} aria-current={i === idx ? 'step' : undefined}
            className={`rounded-full px-3 py-1 text-sm font-bold ${i < idx ? 'bg-uno-green/20 text-uno-green' : i === idx ? 'bg-uno-yellow text-uno-black' : 'border border-white/20 text-white/70'}`}>
            {i < idx ? '✓ ' : i === idx ? '● ' : ''}{s.label}
          </li>
        ))}
      </ol>
    </div>
  )
}
