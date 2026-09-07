import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEspecialidades() {
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEspecialidades = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .eq('activa', true)
      .order('nombre')

    if (error) {
      setError(error)
    } else {
      setEspecialidades(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEspecialidades()
  }, [fetchEspecialidades])

  return { especialidades, loading, error, refetch: fetchEspecialidades }
}
