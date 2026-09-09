import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook de autenticación principal.
 * Expone el usuario actual, su perfil (rol + profesional_id) y métodos de auth.
 *
 * Uso:
 *   const { user, perfil, loading, signIn, signOut } = useAuth()
 *
 * perfil.rol puede ser 'admin' o 'profesional'
 * perfil.profesional_id es el UUID del registro en tabla profesionales (null si es admin)
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null) // { rol, profesional_id }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO (Agustín):
    // 1. Obtener la sesión actual con supabase.auth.getSession()
    // 2. Suscribirse a cambios con supabase.auth.onAuthStateChange()
    // 3. Cuando hay user, traer su perfil de la tabla `profiles`
    // 4. Guardar user y perfil en estado
    // 5. Limpiar la suscripción en el cleanup del useEffect
    setLoading(false)
  }, [])

  const signIn = async (email, password) => {
    // TODO (Agustín): supabase.auth.signInWithPassword({ email, password })
    // Retornar { error } si falla
  }

  const signOut = async () => {
    // TODO (Agustín): supabase.auth.signOut()
    // Limpiar localStorage (cds_profesional_id, cds_rol)
  }

  return { user, perfil, loading, signIn, signOut }
}
