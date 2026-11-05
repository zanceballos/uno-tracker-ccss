const KEY = 'uno-role'
export const getRole = () => (localStorage.getItem(KEY) === 'organiser' ? 'organiser' : 'player')
export const setRole = (r) => (r ? localStorage.setItem(KEY, r) : localStorage.removeItem(KEY))
