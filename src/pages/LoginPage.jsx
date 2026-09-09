import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Pantalla de login para secretaria, profesionales y admin.
 * Usa Supabase Auth con email + contraseña.
 *
 * Flujo:
 * 1. Usuario ingresa email y contraseña
 * 2. Se llama a signIn del hook useAuth
 * 3. Si es exitoso: redirige según el rol
 *    - admin → /secretaria
 *    - profesional → /agenda
 * 4. Si falla: muestra el error debajo del formulario
 *
 * Identidad visual: Poppins, --teal, --dark, --bg (igual al resto de la app)
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, perfil } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // TODO (Agustín):
    // const { error } = await signIn(email, password)
    // if (error) { setError(error.message); setLoading(false); return }
    // if (perfil.rol === 'admin') navigate('/secretaria')
    // else navigate('/agenda')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[var(--border)] p-8 w-full max-w-sm">
        {/* TODO (Agustín): agregar logo de Cruz del Sur arriba */}
        <h1 className="text-xl font-bold text-[var(--dark)] mb-6 text-center">
          Ingresá a tu cuenta
        </h1>

        {/* TODO (Agustín): construir el formulario con los campos email y contraseña */}
        {/* Mostrar error debajo del form si existe */}
        {/* Botón con --teal, texto "Ingresar", estado loading */}

        <p className="text-center text-sm text-[var(--muted)] mt-4">
          Placeholder — formulario pendiente de implementar
        </p>
      </div>
    </div>
  )
}
