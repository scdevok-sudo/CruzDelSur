import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const toFechaStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function rangoSemana(offsetSemanas = 0) {
  const hoy = new Date()
  const dia = hoy.getDay() || 7
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - dia + 1 + offsetSemanas * 7)
  const viernes = new Date(lunes)
  viernes.setDate(lunes.getDate() + 6)
  return { inicio: toFechaStr(lunes), fin: toFechaStr(viernes) }
}

export function useAdminData() {
  const [loading, setLoading] = useState(true)
  const [turnosHoy, setTurnosHoy] = useState([])
  const [kpisSemana, setKpisSemana] = useState({
    turnosSemana: 0,
    confirmadosSemana: 0,
    canceladosSemana: 0,
    turnosProximaSemana: 0,
  })

  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    const hoy = toFechaStr(new Date())
    const { inicio: inicioSemana, fin: finSemana } = rangoSemana(0)
    const { inicio: inicioProxima, fin: finProxima } = rangoSemana(1)

    const [
      { data: turnosHoyData },
      { count: turnosSemana },
      { count: confirmadosSemana },
      { count: canceladosSemana },
      { count: turnosProximaSemana },
    ] = await Promise.all([
      supabase
        .from('turnos')
        .select(
          '*, profesional:profesionales(nombre, apellido), paciente:pacientes(nombre, apellido, obra_social), especialidad:especialidades(nombre)',
        )
        .eq('fecha', hoy)
        .order('hora', { ascending: true }),
      supabase
        .from('turnos')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', inicioSemana)
        .lte('fecha', finSemana),
      supabase
        .from('turnos')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', inicioSemana)
        .lte('fecha', finSemana)
        .eq('estado', 'confirmado'),
      supabase
        .from('turnos')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', inicioSemana)
        .lte('fecha', finSemana)
        .eq('estado', 'cancelado'),
      supabase
        .from('turnos')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', inicioProxima)
        .lte('fecha', finProxima),
    ])

    setTurnosHoy(turnosHoyData ?? [])
    setKpisSemana({
      turnosSemana: turnosSemana ?? 0,
      confirmadosSemana: confirmadosSemana ?? 0,
      canceladosSemana: canceladosSemana ?? 0,
      turnosProximaSemana: turnosProximaSemana ?? 0,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const horaActual = new Date().toTimeString().slice(0, 8)
  const confirmadosHoy = turnosHoy.filter((t) => t.estado === 'confirmado').length
  const sinAsignar = turnosHoy.filter((t) => !t.profesional_id).length
  const proximoTurno =
    turnosHoy.find((t) => t.hora > horaActual && t.estado !== 'cancelado') ?? null

  return {
    loading,
    turnosHoy,
    totalHoy: turnosHoy.length,
    confirmadosHoy,
    sinAsignar,
    proximoTurno,
    kpisSemana,
    refetch: fetchAdminData,
  }
}
