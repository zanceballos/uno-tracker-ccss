import { useCallback, useEffect, useState } from 'react'
import { ConfirmContext } from '../context'
import Button from './Button'

export default function ConfirmProvider({ children }) {
  const [req, setReq] = useState(null)
  const [typed, setTyped] = useState('')
  const confirm = useCallback((message, opts = {}) => new Promise((resolve) => {
    setTyped('')
    setReq({ message, ...opts, resolve })
  }), [])
  const close = (v) => { req.resolve(v); setReq(null) }

  useEffect(() => {
    if (!req) return
    const esc = (e) => { if (e.key === 'Escape') { req.resolve(false); setReq(null) } }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [req])

  const locked = req?.confirmText && typed !== req.confirmText
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {req && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => close(false)}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="cfm-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl border-4 border-white bg-uno-charcoal p-5">
            <h2 id="cfm-title" className="text-2xl font-extrabold">{req.title ?? 'Are you sure?'}</h2>
            <p className="mt-2 whitespace-pre-line">{req.message}</p>
            {req.confirmText && (
              <label className="mt-3 block text-sm font-bold">
                Type {req.confirmText} to confirm
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus className="mt-1 h-12 w-full rounded-xl bg-white px-4 text-lg text-uno-black" />
              </label>
            )}
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => close(false)}>Cancel</Button>
              <Button className={`flex-1 ${req.danger ? '!bg-uno-red' : ''}`} disabled={locked} onClick={() => close(true)}>{req.confirmLabel ?? 'Confirm'}</Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
