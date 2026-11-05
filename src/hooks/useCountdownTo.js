import { useEffect, useState } from 'react'

export default function useCountdownTo(ts) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const end = ts?.toMillis ? ts.toMillis() : ts ?? null
  return end == null ? null : Math.max(0, Math.round((end - now) / 1000))
}
