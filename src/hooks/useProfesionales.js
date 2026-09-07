import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProfesionales({ especialidadId } = {}) {
  const [profesionales, setProfesionales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfesionales = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('profesionales')
      .select('*, especialidad:especialidades(*), disponibilidad(*)')
      .eq('activo', true)
      .order('nombre')

    if (especialidadId) query = query.eq('especialidad_id', especialidadId)

    const { data, error } = await query

    if (error) {
      setError(error)
    } else {
      setProfesionales(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [especialidadId])

  useEffect(() => {
    fetchProfesionales()
  }, [fetchProfesionales])

  return { profesionales, loading, error, refetch: fetchProfesionales }
}
