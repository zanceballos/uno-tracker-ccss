import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import Backdrop from '../components/Backdrop'
import Button from '../components/Button'
import { auth } from '../firebase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try { await signInWithEmailAndPassword(auth, email.trim(), password) }
    catch { setErr('Wrong email or password.') }
    finally { setBusy(false) }
  }
  const input = 'mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black'
  return (
    <div className="relative min-h-svh overflow-x-clip bg-uno-black">
    <Backdrop />
    <div className="relative mx-auto flex min-h-svh max-w-sm flex-col justify-center px-4">
      <form onSubmit={submit} className="rounded-3xl border-4 border-white bg-uno-charcoal p-6">
        <h1 className="text-3xl font-extrabold">Admin login</h1>
        <label htmlFor="email" className="mt-5 block font-bold">Email</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} required />
        <label htmlFor="pw" className="mt-4 block font-bold">Password</label>
        <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} required />
        {err && <p role="alert" className="mt-4 rounded-xl border-2 border-uno-red bg-uno-red/20 px-4 py-2 font-semibold">{err}</p>}
        <Button type="submit" variant="primary" disabled={busy} className="mt-5 w-full">{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
      <Link to="/" className="mt-4 inline-flex min-h-12 items-center justify-center underline">← Back to public site</Link>
    </div>
    </div>
  )
}
