import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TURNO_SELECT = `
  *,
  paciente:pacientes(*),
  profesional:profesionales(*),
  especialidad:especialidades(*)
`

// Trae turnos con filtros opcionales: { fecha, profesionalId, estado }
export function useTurnos({ fecha, profesionalId, estado } = {}) {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('turnos').select(TURNO_SELECT).order('hora')

    if (fecha) query = query.eq('fecha', fecha)
    if (profesionalId) query = query.eq('profesional_id', profesionalId)
    if (estado) query = query.eq('estado', estado)

    const { data, error } = await query

    if (error) {
      setError(error)
    } else {
      setTurnos(data ?? [])
      setError(null)
    }
    setLoading(false)
  }, [fecha, profesionalId, estado])

  useEffect(() => {
    fetchTurnos()
  }, [fetchTurnos])

  return { turnos, loading, error, refetch: fetchTurnos }
}

// Crea (o reutiliza) un paciente por DNI y crea el turno en estado "pendiente"
export async function crearTurno({
  paciente,
  fecha,
  hora,
  especialidadId,
  profesionalId,
  motivo,
  derivadoPor,
}) {
  let pacienteId = null

  if (paciente.dni) {
    const { data: existente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('dni', paciente.dni)
      .maybeSingle()
    if (existente) pacienteId = existente.id
  }

  if (!pacienteId) {
    const { data: nuevoPaciente, error: errPaciente } = await supabase
      .from('pacientes')
      .insert({
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        telefono: paciente.telefono,
        email: paciente.email,
        obra_social: paciente.obraSocial,
      })
      .select()
      .single()

    if (errPaciente) throw errPaciente
    pacienteId = nuevoPaciente.id
  }

  const { data: turno, error: errTurno } = await supabase
    .from('turnos')
    .insert({
      paciente_id: pacienteId,
      especialidad_id: especialidadId,
      profesional_id: profesionalId,
      fecha,
      hora,
      motivo,
      estado: 'pendiente',
      ...(derivadoPor?.trim() ? { derivado_por: derivadoPor.trim() } : {}),
    })
    .select(TURNO_SELECT)
    .single()

  if (errTurno) throw errTurno
  return turno
}

export async function asignarProfesional(turnoId, profesionalId) {
  const { data, error } = await supabase
    .from('turnos')
    .update({ profesional_id: profesionalId, estado: 'confirmado' })
    .eq('id', turnoId)
    .select(TURNO_SELECT)
    .single()

  if (error) throw error
  return data
}

export async function cambiarEstadoTurno(turnoId, estado) {
  const { data, error } = await supabase
    .from('turnos')
    .update({ estado })
    .eq('id', turnoId)
    .select(TURNO_SELECT)
    .single()

  if (error) throw error
  return data
}
