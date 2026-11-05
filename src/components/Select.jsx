import { useEffect, useRef, useState } from 'react'

export default function Select({ value, onChange, options, label, placeholder = 'Select…', align = 'left', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => (e.type === 'keydown' ? e.key === 'Escape' && setOpen(false) : !ref.current?.contains(e.target) && setOpen(false))
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])
  const current = options.find((o) => o.value === value)
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between gap-2 rounded-xl bg-white px-3 text-left text-base font-bold text-uno-black transition active:scale-95"
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <span aria-hidden className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <ul role="listbox" aria-label={label} className={`absolute z-40 mt-1 max-h-60 min-w-full w-max overflow-y-auto rounded-xl border-2 border-white bg-uno-black p-1 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`flex min-h-12 w-full items-center gap-2 rounded-lg px-3 text-left font-semibold hover:bg-white/15 ${o.value === value ? 'bg-white/10' : ''}`}
              >
                <span aria-hidden className="w-4">{o.value === value ? '✓' : ''}</span>{o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
