import { deleteDoc, doc, runTransaction } from 'firebase/firestore'
import { db } from './firebase'

export async function leaveTeam(sid, uid, teamId) {
  if (!teamId) await deleteDoc(doc(db, 'sessions', sid, 'players', uid))
  else await runTransaction(db, async (tx) => {
    const teamRef = doc(db, 'sessions', sid, 'teams', teamId)
    const size = (await tx.get(teamRef)).data().size ?? 0
    tx.delete(doc(db, 'sessions', sid, 'players', uid))
    if (size > 0) tx.update(teamRef, { size: size - 1 })
  })
  localStorage.removeItem('uno-reg')
}
