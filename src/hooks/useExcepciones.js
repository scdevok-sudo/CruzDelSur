import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useExcepciones() {
  const [excepciones, setExcepciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExcepciones = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('excepciones_disponibilidad')
      .select('*, profesional:profesionales(*)')
      .order('fecha', { ascending: true })

    if (error) {
      setError(error)
    } else {
      setExcepciones(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExcepciones()
  }, [fetchExcepciones])

  return { excepciones, loading, error, refetch: fetchExcepciones }
}

export async function crearExcepcion({ fecha, tipo, profesionalId, horaInicio, horaFin, motivo }) {
  const { data, error } = await supabase
    .from('excepciones_disponibilidad')
    .insert({
      fecha,
      tipo,
      profesional_id: profesionalId || null,
      hora_inicio: tipo === 'horario_reducido' ? horaInicio : null,
      hora_fin: tipo === 'horario_reducido' ? horaFin : null,
      motivo: motivo?.trim() || null,
    })
    .select('*, profesional:profesionales(*)')
    .single()

  if (error) throw error
  return data
}

export async function eliminarExcepcion(id) {
  const { error } = await supabase.from('excepciones_disponibilidad').delete().eq('id', id)
  if (error) throw error
}
