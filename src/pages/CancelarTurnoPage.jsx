import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Spinner from '../components/ui/Spinner'

/**
 * Página pública accesible desde el link de cancelación del recordatorio de WhatsApp.
 * URL: /cancelar?token=XXXX
 *
 * Flujo:
 * 1. Leer el token de ?token=XXX en la URL
 * 2. Buscar el turno en Supabase por ese token
 * 3. Validar que el turno existe, no está cancelado y no es del pasado
 * 4. Mostrar los datos del turno y un botón "Cancelar turno"
 * 5. Al confirmar: actualizar estado a 'cancelado' en Supabase
 * 6. Mostrar pantalla de éxito con link a /turno para sacar uno nuevo
 *
 * Esta ruta NO requiere autenticación — es pública.
 */
export default function CancelarTurnoPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [turno, setTurno] = useState(null)
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'valido' | 'invalido' | 'ya_cancelado' | 'expirado' | 'cancelado'
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) { setEstado('invalido'); return }

    // TODO (Agustín):
    // 1. Buscar turno por token en Supabase con join a pacientes, profesionales, especialidades
    // 2. Si no existe: setEstado('invalido')
    // 3. Si estado === 'cancelado': setEstado('ya_cancelado')
    // 4. Si la fecha del turno ya pasó: setEstado('expirado')
    // 5. Si todo ok: setTurno(data), setEstado('valido')
  }, [token])

  const handleCancelar = async () => {
    // TODO (Agustín):
    // setLoading(true)
    // await supabase.from('turnos').update({ estado: 'cancelado' }).eq('token', token)
    // setEstado('cancelado')
    // setLoading(false)
  }

  // TODO (Agustín): renderizar cada estado con su pantalla correspondiente
  // 'cargando' → <Spinner />
  // 'invalido' → "Este link no es válido"
  // 'ya_cancelado' → "Este turno ya fue cancelado"
  // 'expirado' → "Ya no es posible cancelar este turno online. Llamanos al consultorio."
  // 'valido' → datos del turno + botón confirmar cancelación
  // 'cancelado' → pantalla de éxito con link a /turno

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[var(--border)] p-8 w-full max-w-sm text-center">
        <p className="text-[var(--muted)] text-sm">
          Placeholder — CancelarTurnoPage pendiente de implementar
        </p>
        <p className="text-xs mt-2 text-[var(--muted)]">Token: {token || 'no encontrado'}</p>
        <Link to="/turno" className="text-[var(--teal)] text-sm mt-4 block">
          Volver a la turnera
        </Link>
      </div>
    </div>
  )
}
