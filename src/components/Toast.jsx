import { useEffect, useRef } from 'react'

export default function Toast({ message, onClose, duration = 4000 }) {
  const close = useRef(onClose)
  useEffect(() => { close.current = onClose })
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => close.current(), duration)
    return () => clearTimeout(t)
  }, [message, duration])
  if (!message) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-20 z-50 md:bottom-4 mx-auto max-w-sm rounded-xl border-2 border-white bg-uno-black px-4 py-3 text-center font-bold text-white shadow-xl transition-opacity duration-300">
      {message}
    </div>
  )
}
