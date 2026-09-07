import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calcularSlotsDisponibles } from '../lib/slots'

const toFechaStr = (fecha) => {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Devuelve los slots libres para una profesional en una fecha, consultando
// su disponibilidad semanal y los turnos ya tomados (no cancelados).
export function useSlotsDisponibles(profesionalId, fecha, duracionMin = 30) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSlots = useCallback(async () => {
    if (!profesionalId || !fecha) {
      setSlots([])
      return
    }
    setLoading(true)

    const fechaStr = toFechaStr(fecha)

    const [
      { data: disponibilidad, error: errDisp },
      { data: turnos, error: errTurnos },
      { data: excepciones, error: errExc },
    ] = await Promise.all([
      supabase.from('disponibilidad').select('*').eq('profesional_id', profesionalId),
      supabase
        .from('turnos')
        .select('hora')
        .eq('profesional_id', profesionalId)
        .eq('fecha', fechaStr)
        .neq('estado', 'cancelado'),
      supabase
        .from('excepciones_disponibilidad')
        .select('*')
        .or(`profesional_id.eq.${profesionalId},profesional_id.is.null`),
    ])

    if (errDisp || errTurnos) {
      setError(errDisp ?? errTurnos)
      setSlots([])
    } else {
      setError(null)
      setSlots(
        calcularSlotsDisponibles({
          disponibilidad: disponibilidad ?? [],
          turnosOcupados: turnos ?? [],
          fecha,
          duracionMin,
          // la tabla puede no existir todavía si no se corrió la migración v2
          excepciones: errExc ? [] : (excepciones ?? []),
        }),
      )
    }
    setLoading(false)
  }, [profesionalId, fecha, duracionMin])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  return { slots, loading, error, refetch: fetchSlots }
}
