import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import TurneraPage from './pages/TurneraPage'
import SecretariaPage from './pages/SecretariaPage'
import AgendaPage from './pages/AgendaPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/turno" replace />} />
        <Route path="/turno" element={<TurneraPage />} />
        <Route path="/secretaria" element={<SecretariaPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/turno" replace />} />
      </Routes>
    </div>
  )
}
