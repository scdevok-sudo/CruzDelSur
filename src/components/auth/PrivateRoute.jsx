import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

/**
 * Componente que protege rutas que requieren autenticación.
 *
 * Uso en App.jsx:
 *   <Route path="/secretaria" element={
 *     <PrivateRoute rolRequerido="admin">
 *       <SecretariaPage />
 *     </PrivateRoute>
 *   } />
 *
 * Si no hay sesión → redirige a /login
 * Si el rol no coincide → redirige a /login
 * Si hay sesión y el rol es correcto → renderiza children
 */
export function PrivateRoute({ children, rolRequerido }) {
  const { user, perfil, loading } = useAuth()

  if (loading) return <Spinner />

  // TODO (Agustín):
  // if (!user) return <Navigate to="/login" replace />
  // if (rolRequerido && perfil?.rol !== rolRequerido) return <Navigate to="/login" replace />
  // return children

  // Temporalmente devuelve children para no romper la app mientras se implementa
  return children
}
