const SHAPES = [
  '-left-10 -top-8 rotate-12 bg-uno-red/25',
  '-right-12 top-24 -rotate-12 bg-uno-yellow/20',
  '-bottom-10 -left-8 -rotate-6 bg-uno-green/25',
  '-bottom-12 -right-10 rotate-12 bg-uno-blue/30',
]

export default function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      {SHAPES.map((s) => <div key={s} className={`absolute size-44 rounded-3xl border-4 border-white/10 ${s}`} />)}
    </div>
  )
}
