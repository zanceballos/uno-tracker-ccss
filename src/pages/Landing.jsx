import { useNavigate } from 'react-router-dom'
import Backdrop from '../components/Backdrop'
import { WILD_BG } from '../components/teamColors'
import { setRole } from '../role'

const CHOICES = [
  { role: 'player', to: '/home', icon: '🎮', title: "I'm a Player", text: 'Join a team and follow the game' },
  { role: 'organiser', to: '/admin', icon: '🧑‍✈️', title: "I'm an Organiser", text: 'Game Master: run the tournament' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="relative min-h-svh overflow-x-clip bg-uno-black">
    <Backdrop />
    <div className="relative mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-5xl font-extrabold leading-none">Uno Tracker</h1>
      <p className="text-center text-xl">Who are you?</p>
      {CHOICES.map((c) => (
        <button key={c.role} type="button" onClick={() => { setRole(c.role); navigate(c.to) }} className={`${WILD_BG} rounded-3xl p-1 transition active:scale-95`}>
          <span className="flex min-h-36 flex-col items-center justify-center gap-1 rounded-[20px] bg-uno-black px-4 py-6 text-center">
            <span aria-hidden className="text-5xl">{c.icon}</span>
            <span className="text-3xl font-extrabold">{c.title}</span>
            <span className="text-lg text-white/80">{c.text}</span>
          </span>
        </button>
      ))}
    </div>
    </div>
  )
}
