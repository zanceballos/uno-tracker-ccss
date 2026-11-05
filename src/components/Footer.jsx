const MEMBERS = [
  ['Lim Chin Neng', 'clim229@e.ntu.edu.sg'],
  ['Gia Bianca Napay Castillo', 'giabianc001@e.ntu.edu.sg'],
  ['Ong Si Qi', 'ongs0158@e.ntu.edu.sg'],
  ['Sun Mohan', 'msun007@e.ntu.edu.sg'],
  ['Moh Wen Jun Dominic', 'dmoh003@e.ntu.edu.sg'],
  ['Muhammad Izzan Bin Razak', 'muha0325@e.ntu.edu.sg'],
]

export default function Footer() {
  return (
    <footer className="relative mx-auto max-w-6xl border-t-2 border-white/20 px-4 pb-24 pt-6 text-sm">
      <p className="font-extrabold">A project by NTU CSL Students, Group 2 Tuesday</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBERS.map(([name, email]) => (
          <li key={email} className="min-w-0">
            <p className="font-bold">{name}</p>
            <a href={`mailto:${email}`} className="inline-flex min-h-12 items-center break-all text-white/80 underline">{email}</a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
