import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default function useAuth() {
  const [state, setState] = useState({ user: null, isAdmin: false, loading: true })
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try { await signInAnonymously(auth) } catch { setState({ user: null, isAdmin: false, loading: false }) }
      return
    }
    let isAdmin = false
    if (!user.isAnonymous) {
      try { isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists() } catch { /* not admin */ }
    }
    setState({ user, isAdmin, loading: false })
  }), [])
  return state
}
