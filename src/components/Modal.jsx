import { useEffect } from 'react'
import Button from './Button'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="max-h-[85svh] w-full max-w-md overflow-y-auto rounded-3xl border-4 border-white bg-uno-charcoal p-5">
        {children}
        <Button className="mt-5 w-full" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
