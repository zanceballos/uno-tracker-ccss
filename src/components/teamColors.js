export const TEAM_COLORS = [
  { name: 'Red', letter: 'R', bg: 'bg-uno-red', text: 'text-uno-black', ring: 'ring-uno-red', border: 'border-uno-red' },
  { name: 'Yellow', letter: 'Y', bg: 'bg-uno-yellow', text: 'text-uno-black', ring: 'ring-uno-yellow', border: 'border-uno-yellow' },
  { name: 'Green', letter: 'G', bg: 'bg-uno-green', text: 'text-uno-black', ring: 'ring-uno-green', border: 'border-uno-green' },
  { name: 'Blue', letter: 'B', bg: 'bg-uno-blue', text: 'text-white', ring: 'ring-uno-blue', border: 'border-uno-blue' },
  { name: 'Orange', letter: 'O', bg: 'bg-uno-orange', text: 'text-uno-black', ring: 'ring-uno-orange', border: 'border-uno-orange' },
  { name: 'Purple', letter: 'P', bg: 'bg-uno-purple', text: 'text-white', ring: 'ring-uno-purple', border: 'border-uno-purple' },
  { name: 'Pink', letter: 'K', bg: 'bg-uno-pink', text: 'text-uno-black', ring: 'ring-uno-pink', border: 'border-uno-pink' },
  { name: 'Teal', letter: 'T', bg: 'bg-uno-teal', text: 'text-uno-black', ring: 'ring-uno-teal', border: 'border-uno-teal' },
  { name: 'Silver', letter: 'S', bg: 'bg-uno-silver', text: 'text-uno-black', ring: 'ring-uno-silver', border: 'border-uno-silver' },
]

export const teamColor = (i) => TEAM_COLORS[i % TEAM_COLORS.length]

export const WILD_BG =
  'bg-[conic-gradient(var(--color-uno-red)_0_25%,var(--color-uno-yellow)_0_50%,var(--color-uno-green)_0_75%,var(--color-uno-blue)_0_100%)]'
