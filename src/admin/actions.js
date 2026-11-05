import { collection, deleteDoc, deleteField, doc, getDocs, increment, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { TEAM_COLORS } from '../components/teamColors'
import { db } from '../firebase'
import { assignTables } from '../logic/tables'
import { finalOrder, finalistPlan } from '../logic/ranking'
import { averagePoints } from '../logic/late'
import { resolveResult } from '../logic/scoring'
import { DEFAULT_ROUNDS } from '../logic/flow'
import { firstName } from '../firstName'
import { DEFAULT_PER_TEAM, summarize } from '../logic/participants'

export const ROUND_SECONDS = 900
const KEY = { round1: '1', round2: '2', round3: '3', final: 'final' }
const sref = (sid, ...p) => doc(db, 'sessions', sid, ...p)

export async function createSession({ name, date, teamCount, mode = 'choose' }) {
  const ref = doc(collection(db, 'sessions'))
  const b = writeBatch(db)
  b.set(ref, { name, date: Timestamp.fromDate(new Date(date)), status: 'upcoming', mode, rounds: DEFAULT_ROUNDS, format: { playersPerTeam: DEFAULT_PER_TEAM }, deleted: false, seating: {}, roundEndsAt: null, createdAt: serverTimestamp() })
  for (let i = 1; i <= teamCount; i++) {
    const colorIndex = (i - 1) % TEAM_COLORS.length
    b.set(doc(ref, 'teams', `t${i}`), { number: i, name: `${TEAM_COLORS[colorIndex].name} ${i}`, colorIndex, size: 0, points: 0 })
  }
  b.set(doc(db, 'meta', 'active'), { sessionId: ref.id })
  await b.commit()
}

export async function advance(session, teams, next, scores = {}) {
  const patch = { status: next, roundEndsAt: null }
  const active = teams.filter((t) => t.members?.length)
  let warning = null
  if (next.startsWith('round')) {
    const history = ['1', '2', '3'].map((k) => session.seating?.[k]).filter(Boolean).map((r) => r.map((t) => t.teams))
    const prev = session.seating?.[{ round2: '1', round3: '2' }[next]]
    const prevSeated = new Set((prev ?? []).flatMap((t) => t.teams))
    const priority = prev ? active.filter((t) => !prevSeated.has(t.id)).map((t) => t.id) : []
    const res = assignTables(active.map((t) => t.id), history, Math.random, priority)
    warning = res.warning
    patch[`seating.${KEY[next]}`] = res.tables.map((t) => ({ teams: t }))
  } else if (next === 'playoff' || next === 'final') {
    const plan = finalistPlan(session, teams, scores)
    const group = next === 'playoff' ? plan.tie?.teams : plan.finalists
    if (!group?.length) throw new Error('No teams to seat')
    patch[`seating.${next}`] = [{ teams: group.map((t) => t.id) }]
  }
  await updateDoc(sref(session.id), patch)
  return warning
}

export const setSeating = (session, round, tables) => updateDoc(sref(session.id), { [`seating.${round}`]: tables })

export const seatTeam = (session, round, tables, index, teamId) =>
  updateDoc(sref(session.id), { [`seating.${round}`]: tables.map((t, i) => (i === index ? { teams: [...t.teams, teamId] } : t)) })

export const startTimer = (sid) =>
  updateDoc(sref(sid), { roundEndsAt: Timestamp.fromMillis(Date.now() + ROUND_SECONDS * 1000) })

export const endRound = (sid) => updateDoc(sref(sid), { roundEndsAt: Timestamp.now() })

export const setPlayersPerTeam = (sid, n) => updateDoc(sref(sid), { 'format.playersPerTeam': n })

export const setRounds = (sid, rounds) => updateDoc(sref(sid), { rounds })

// winnerId (went out first) is optional: with no one out, the fewest cards gets 2 points and the rest 1. participants: { teamId: [playerId] }.
export async function saveScore(sid, key, entries, winnerId, old, participants = null) {
  const res = resolveResult(entries, winnerId || null)
  if (!res.ok) throw new Error(res.error)
  const { award } = res
  entries = res.entries
  winnerId = res.winnerId
  const { leaders, outId } = res
  const b = writeBatch(db)
  for (const e of entries) {
    if (/^\d_/.test(key)) {
      const delta = award[e.id] - (old?.award?.[e.id] ?? 0)
      if (delta) b.update(sref(sid, 'teams', e.id), { points: increment(delta) })
    } else if (key.startsWith('final')) {
      b.update(sref(sid, 'teams', e.id), { finalAward: award[e.id], finalCards: e.cards })
    }
  }
  b.set(sref(sid, 'scores', key), { award, winnerId, leaders, wentOut: !!outId, cards: Object.fromEntries(entries.map((e) => [e.id, e.cards])), ...(participants ? { participants } : {}) })
  await b.commit()
}

export async function finish(session, teams, players, scores = {}) {
  const ranked = finalOrder(teams)
  const { winners, participation } = summarize(scores, teams, players)
  const b = writeBatch(db)
  b.set(doc(db, 'pastSessions', session.id), {
    name: session.name,
    date: session.date,
    standings: ranked.map((t) => ({ name: t.name, points: t.points, finalAward: t.finalAward ?? null, colorIndex: t.colorIndex, members: t.members })),
    players: players.map((p) => ({ name: firstName(p.name), points: (() => { const t = teams.find((x) => x.id === p.teamId); return (t?.points ?? 0) + (t?.finalAward ?? 0) })() })),
    winners: winners.map((w) => ({ round: w.round, table: w.table, team: w.team, members: w.members, points: w.points })),
    participation: participation.map((p) => ({ name: firstName(p.name), team: p.team, played: p.rounds.length })),
    finishedAt: serverTimestamp(),
  })
  b.update(sref(session.id), { status: 'done', roundEndsAt: null })
  await b.commit()
}

export async function adjustPoints(sid, team, to) {
  const b = writeBatch(db)
  b.update(sref(sid, 'teams', team.id), { points: to })
  b.set(doc(collection(db, 'sessions', sid, 'adjustments')), { teamId: team.id, team: team.name, from: team.points, to, at: serverTimestamp() })
  await b.commit()
}

export async function addWalkIn(sid, name, teamId) {
  const b = writeBatch(db)
  b.set(doc(collection(db, 'sessions', sid, 'players')), { name, teamId, points: 0, createdAt: serverTimestamp() })
  b.update(sref(sid, 'teams', teamId), { size: increment(1) })
  await b.commit()
}

export const reopenRegistration = (sid) => updateDoc(sref(sid), { status: 'registration' })

export const goBack = (sid, prev) =>
  updateDoc(sref(sid), { status: prev, roundEndsAt: /^round|^playoff/.test(prev) ? Timestamp.now() : null })

export async function undoScore(sid, key, old) {
  const b = writeBatch(db)
  for (const [id, a] of Object.entries(old?.award ?? {})) {
    if (/^\d_/.test(key) && a) b.update(sref(sid, 'teams', id), { points: increment(-a) })
    else if (key.startsWith('final')) b.update(sref(sid, 'teams', id), { finalAward: deleteField(), finalCards: deleteField() })
  }
  b.delete(sref(sid, 'scores', key))
  await b.commit()
}

export async function movePlayer(sid, player, toId) {
  const b = writeBatch(db)
  b.update(sref(sid, 'players', player.id), { teamId: toId })
  if (player.teamId) b.update(sref(sid, 'teams', player.teamId), { size: increment(-1) })
  b.update(sref(sid, 'teams', toId), { size: increment(1) })
  await b.commit()
}

export async function removePlayer(sid, player) {
  const b = writeBatch(db)
  b.delete(sref(sid, 'players', player.id))
  if (player.teamId) b.update(sref(sid, 'teams', player.teamId), { size: increment(-1) })
  await b.commit()
}

export async function resetAll() {
  const wipe = async (colRef) => {
    const docs = (await getDocs(colRef)).docs
    for (let i = 0; i < docs.length; i += 400) {
      const b = writeBatch(db)
      docs.slice(i, i + 400).forEach((d) => b.delete(d.ref))
      await b.commit()
    }
  }
  for (const s of (await getDocs(collection(db, 'sessions'))).docs)
    for (const sub of ['teams', 'players', 'scores', 'adjustments']) await wipe(collection(s.ref, sub))
  await wipe(collection(db, 'sessions'))
  await wipe(collection(db, 'pastSessions'))
  await deleteDoc(doc(db, 'meta', 'active'))
}

export const setActive = (sessionId) => setDoc(doc(db, 'meta', 'active'), { sessionId })

export async function addTeam(sid, teams, started) {
  const number = Math.max(0, ...teams.map((t) => t.number)) + 1
  const colorIndex = (number - 1) % TEAM_COLORS.length
  const name = `${TEAM_COLORS[colorIndex].name} ${number}`
  const points = started ? averagePoints(teams) : 0
  await setDoc(sref(sid, 'teams', `t${number}`), { number, name, colorIndex, size: 0, points })
  return name
}

// groups: [[playerId]] (from autoAssign). teamIds: teams the groups go into, in order; extra teams are created.
export async function applyGroups(sid, teams, players, groups, teamIds) {
  const b = writeBatch(db)
  const ids = [...teamIds]
  const fresh = []
  let number = Math.max(0, ...teams.map((t) => t.number))
  while (ids.length < groups.length) {
    number++
    const colorIndex = (number - 1) % TEAM_COLORS.length
    fresh.push({ id: `t${number}`, number, name: `${TEAM_COLORS[colorIndex].name} ${number}`, colorIndex })
    ids.push(`t${number}`)
  }
  const to = {}
  groups.forEach((g, i) => g.forEach((pid) => { to[pid] = ids[i] }))
  const size = Object.fromEntries([...teams, ...fresh].map((t) => [t.id, 0]))
  for (const p of players) { const tid = p.id in to ? to[p.id] : p.teamId; if (tid) size[tid]++ }
  for (const [pid, tid] of Object.entries(to)) b.update(sref(sid, 'players', pid), { teamId: tid })
  for (const t of teams) b.update(sref(sid, 'teams', t.id), { size: size[t.id] })
  for (const t of fresh) b.set(sref(sid, 'teams', t.id), { number: t.number, name: t.name, colorIndex: t.colorIndex, size: size[t.id], points: 0 })
  await b.commit()
}

export const renamePlayer = (sid, pid, name) => updateDoc(sref(sid, 'players', pid), { name })

export const updateSession = (sid, { name, date, mode }) =>
  updateDoc(sref(sid), { name, mode, date: Timestamp.fromDate(new Date(date)) })

// The session is hidden (soft delete). Its past-leaderboard entry is removed, so Hall of fame and Overall players (summed from past sessions) drop its points too.
export async function deleteSession(sid, { wasActive, nextId }) {
  const b = writeBatch(db)
  b.update(sref(sid), { deleted: true })
  b.delete(doc(db, 'pastSessions', sid))
  if (wasActive) nextId ? b.set(doc(db, 'meta', 'active'), { sessionId: nextId }) : b.delete(doc(db, 'meta', 'active'))
  await b.commit()
}
