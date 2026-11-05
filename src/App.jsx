import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Admin from './Admin'
import AppProvider from './AppProvider'
import ConfirmProvider from './components/ConfirmProvider'
import Layout from './components/Layout'
import Join from './pages/Join'
import Landing from './pages/Landing'
import Leaderboards from './pages/Leaderboards'
import Play from './pages/Play'
import Welcome from './pages/Welcome'

export default function App() {
  return (
    <AppProvider>
      <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="home" element={<Welcome />} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="join" element={<Join />} />
            <Route path="session" element={<Play />} />
            <Route path="live" element={<Play />} />
          </Route>
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ConfirmProvider>
    </AppProvider>
  )
}
