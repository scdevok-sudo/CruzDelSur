import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import TurneraPage from './pages/TurneraPage'
import SecretariaPage from './pages/SecretariaPage'
import AgendaPage from './pages/AgendaPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import CancelarTurnoPage from './pages/CancelarTurnoPage'
// import { PrivateRoute } from './components/auth/PrivateRoute'

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cancelar" element={<CancelarTurnoPage />} />
        {/* Cuando PrivateRoute esté implementado, envolver las rutas protegidas:
        <Route path="/secretaria" element={
          <PrivateRoute rolRequerido="admin"><SecretariaPage /></PrivateRoute>
        } /> */}
        <Route path="*" element={<Navigate to="/turno" replace />} />
      </Routes>
    </div>
  )
}
