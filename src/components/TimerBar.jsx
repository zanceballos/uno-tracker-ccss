const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function TimerBar({ secondsLeft, totalSeconds }) {
  const color = secondsLeft <= 60 ? 'bg-uno-red' : secondsLeft <= 120 ? 'bg-uno-yellow' : 'bg-uno-green'
  const pct = Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100))
  return (
    <div className="w-full">
      <p className="text-center text-6xl font-extrabold tabular-nums">{fmt(secondsLeft)}</p>
      <div
        role="progressbar"
        aria-label="Time left"
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        aria-valuenow={secondsLeft}
        className="mt-2 h-5 overflow-hidden rounded-full border-2 border-white bg-white/10"
      >
        <div className={`h-full transition-all duration-1000 ease-linear ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
