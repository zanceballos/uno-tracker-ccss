export default function LiveDot({ connected }) {
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold">
      <span className={`size-2.5 rounded-full ${connected ? 'bg-uno-green animate-live-pulse' : 'bg-gray-400'}`} />
      {connected ? 'Live' : 'Reconnecting...'}
    </span>
  )
}
