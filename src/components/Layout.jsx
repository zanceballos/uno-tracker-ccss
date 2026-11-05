import { useEffect, useRef } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context'
import Backdrop from './Backdrop'
import Footer from './Footer'
import NavBar from './NavBar'
import { getRole } from '../role'
import RulesButton from './RulesButton'

const LIVE = ['closed', 'round1', 'round2', 'round3', 'playoff', 'final', 'done']

export default function Layout() {
  const { session, myTeam } = useApp()
  const navigate = useNavigate()
  const prev = useRef()
  const status = session?.status
  useEffect(() => {
    if (prev.current !== undefined && prev.current !== status && myTeam)
      navigate(LIVE.includes(status) ? '/session' : '/home')
    prev.current = status
  }, [status, myTeam, navigate])

  return (
    <div className="relative min-h-svh overflow-x-clip bg-uno-black">
      <Backdrop />
      <header className="relative mx-auto flex max-w-6xl md:hidden items-center justify-between px-4 py-3">
        <Link to="/home" className="flex min-h-12 items-center gap-2 text-xl font-extrabold">
          <span aria-hidden className="grid size-7 grid-cols-2 overflow-hidden rounded-md border-2 border-white">
            <i className="bg-uno-red" /><i className="bg-uno-yellow" /><i className="bg-uno-green" /><i className="bg-uno-blue" />
          </span>
          Uno Tracker
        </Link>
      </header>
      <NavBar role={getRole()} brand />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <RulesButton />
    </div>
  )
}
