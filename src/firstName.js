// Public pages show only the first word of what a player typed (no surnames).
export const firstName = (n) => String(n ?? '').trim().split(/\s+/)[0]
