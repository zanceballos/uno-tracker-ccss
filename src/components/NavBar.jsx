import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { setRole } from '../role'

const ITEMS = {
  player: [
    { to: '/home', icon: '🏠', label: 'Home', short: 'Home' },
    { to: '/join', icon: '✋', label: 'Join', short: 'Join' },
    { to: '/session', icon: '🔴', label: 'Live Game', short: 'Live' },
    { to: '/leaderboards', icon: '🏆', label: 'Leaderboards', short: 'Scores' },
  ],
  organiser: [
    { to: '/admin', icon: '📋', label: 'Dashboard', short: 'Home' },
    { to: '/admin#sessions', icon: '🗂️', label: 'Sessions', short: 'Sessions' },
    { to: '/admin#teams', icon: '👥', label: 'Players and Teams', short: 'Teams' },
    { to: '/admin#round', icon: '🃏', label: 'Live Round', short: 'Round' },
    { to: '/leaderboards', icon: '🏆', label: 'Leaderboards', short: 'Scores' },
  ],
}

export default function NavBar({ role, brand }) {
  const [more, setMore] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const switchRole = () => { setRole(null); setMore(false); navigate('/') }
  const logout = async () => { await signOut(auth); switchRole() }
  const item = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white md:min-h-0 md:h-10 md:flex-none md:flex-row md:gap-2 md:rounded-full md:px-4 md:text-[15px] md:font-semibold'
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-uno-black md:sticky md:top-0 md:bottom-auto md:border-b md:border-t-0 md:border-white/10 md:bg-uno-black/85 md:backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-stretch md:items-center md:gap-1 md:px-4 md:py-3">
        {brand && (
          <Link to={role === 'organiser' ? '/admin' : '/home'} className="mr-6 hidden items-center gap-2 text-xl font-extrabold md:flex">
            <span aria-hidden className="grid size-7 grid-cols-2 overflow-hidden rounded-md border-2 border-white">
              <i className="bg-uno-red" /><i className="bg-uno-yellow" /><i className="bg-uno-green" /><i className="bg-uno-blue" />
            </span>
            Uno Tracker
          </Link>
        )}
        {ITEMS[role].map((i) => {
          const [path, h = ''] = i.to.split('#')
          const on = pathname === path && hash === (h && `#${h}`)
          return (
            <Link key={i.to} to={i.to} aria-current={on ? 'page' : undefined} className={`${item} ${on ? 'bg-white text-uno-black' : 'text-white md:text-white/70 hover:bg-white/10 md:hover:text-white'}`}>
              <span aria-hidden className="text-xl md:text-lg">{i.icon}</span>
              <span className="md:hidden">{i.short}</span><span className="hidden md:inline">{i.label}</span>
            </Link>
          )
        })}
        <div className="relative flex flex-1 md:ml-auto md:flex-none">
          <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className={`${item} w-full text-white md:text-white/70 hover:bg-white/10 md:hover:text-white`}>
            <span aria-hidden className="text-xl md:text-lg">⋯</span><span className="md:hidden">More</span><span className="hidden md:inline">Menu</span>
          </button>
          {more && (
            <div className="absolute bottom-full right-1 mb-2 flex w-56 flex-col gap-1 rounded-2xl border-2 border-white bg-uno-charcoal p-2 shadow-xl md:bottom-auto md:right-0 md:top-full md:mb-0 md:mt-2">
              <button type="button" onClick={switchRole} className="min-h-12 rounded-xl px-3 text-left font-bold hover:bg-white/10">🔄 Switch role</button>
              {role === 'organiser' && <button type="button" onClick={logout} className="min-h-12 rounded-xl px-3 text-left font-bold hover:bg-white/10">🚪 Log out</button>}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
