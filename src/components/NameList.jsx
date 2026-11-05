export default function NameList({ team, center, className = '' }) {
  const names = team.members?.length ? team.members : [team.name]
  return (
    <span role="list" className={`block ${center ? 'mx-auto w-fit text-left' : ''} ${className}`}>
      {names.map((n, i) => (
        <span role="listitem" key={`${n}${i}`} className="flex gap-1.5 leading-tight">
          <span aria-hidden>•</span><span className="min-w-0 break-words">{n}</span>
        </span>
      ))}
    </span>
  )
}
