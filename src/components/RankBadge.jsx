const MEDALS = {
  1: ['bg-yellow-400 text-uno-black', '★'],
  2: ['bg-gray-300 text-uno-black', '☆'],
  3: ['bg-amber-700 text-white', '☆'],
}

export default function RankBadge({ rank }) {
  const [style, icon] = MEDALS[rank] ?? ['bg-uno-black text-white', '']
  return (
    <span
      aria-label={`Rank ${rank}`}
      className={`inline-flex size-11 items-center justify-center rounded-full border-2 border-white text-lg font-extrabold lg:size-20 lg:border-4 lg:text-4xl ${style}`}
    >
      {icon}{rank}
    </span>
  )
}
