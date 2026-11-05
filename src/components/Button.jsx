import { WILD_BG } from './teamColors'

const base =
  'min-h-12 px-6 rounded-full font-bold text-lg transition active:scale-95 disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white'

export default function Button({ variant = 'solid', className = '', children, ...props }) {
  if (variant === 'primary') {
    return (
      <button className={`${WILD_BG} p-[3px] rounded-full min-h-12 transition active:scale-95 ${className}`} {...props}>
        <span className="flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-uno-black px-6 text-lg font-bold text-white">
          {children}
        </span>
      </button>
    )
  }
  const styles = variant === 'ghost' ? 'border-2 border-white/60 text-white hover:bg-white/10' : 'bg-white text-uno-black hover:bg-white/90'
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  )
}
