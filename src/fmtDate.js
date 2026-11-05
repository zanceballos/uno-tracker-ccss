const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null)

export const fmtDate = (v) => toDate(v)?.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) ?? 'To be announced'
