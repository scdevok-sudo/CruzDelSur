import { supabase } from './supabase'

// Genera slots de N minutos entre hora_inicio y hora_fin (formato "HH:MM" o "HH:MM:SS")
export function generarSlots(horaInicio, horaFin, duracionMin = 30) {
  const [h1, m1] = horaInicio.split(':').map(Number)
  const [h2, m2] = horaFin.split(':').map(Number)

  const inicio = h1 * 60 + m1
  const fin = h2 * 60 + m2

  const slots = []
  for (let t = inicio; t + duracionMin <= fin; t += duracionMin) {
    const h = String(Math.floor(t / 60)).padStart(2, '0')
    const m = String(t % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
  }
  return slots
}

// dia_semana: 1=lunes ... 6=sábado (0=domingo no se usa)
export function diaSemanaISO(fecha) {
  const dow = fecha.getDay() // 0=domingo, 1=lunes...6=sábado
  return dow === 0 ? 7 : dow
}

// Aplica excepciones (feriado/cerrado/horario_reducido) sobre una lista de slots ya generada
function aplicarExcepciones(slots, excepciones, fecha) {
  const fechaStr = toISODate(fecha)
  const delDia = (excepciones ?? []).filter((e) => e.fecha === fechaStr)

  if (delDia.some((e) => e.tipo === 'feriado' || e.tipo === 'cerrado')) {
    return []
  }

  let resultado = slots
  for (const e of delDia.filter((e) => e.tipo === 'horario_reducido')) {
    if (!e.hora_inicio || !e.hora_fin) continue
    const inicio = e.hora_inicio.slice(0, 5)
    const fin = e.hora_fin.slice(0, 5)
    resultado = resultado.filter((s) => s >= inicio && s < fin)
  }
  return resultado
}

function toISODate(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

// Calcula los horarios libres de una profesional en una fecha dada.
// `excepciones`: filas de excepciones_disponibilidad ya filtradas para esa profesional
// (profesional_id = la profesional o null = todo el consultorio).
export function calcularSlotsDisponibles({
  disponibilidad,
  turnosOcupados,
  fecha,
  duracionMin = 30,
  excepciones = [],
}) {
  const diaSemana = diaSemanaISO(fecha)

  const bloquesDelDia = disponibilidad.filter((d) => d.dia_semana === diaSemana)

  const todosLosSlots = bloquesDelDia.flatMap((b) =>
    generarSlots(b.hora_inicio, b.hora_fin, duracionMin),
  )

  const ocupados = new Set(
    turnosOcupados.map((t) => t.hora.slice(0, 5)),
  )

  const libres = todosLosSlots.filter((s) => !ocupados.has(s)).sort()

  return aplicarExcepciones(libres, excepciones, fecha)
}

// Busca los próximos `cantidad` turnos disponibles de una profesional, arrancando mañana.
// Devuelve array de { fecha: Date, hora: string }. Busca hasta 30 días hacia adelante.
export async function getProximosTurnosDisponibles(profesionalId, cantidad = 3, duracionMin = 30) {
  if (!profesionalId) return []

  const [{ data: disponibilidad, error: errDisp }, { data: excepciones, error: errExc }] =
    await Promise.all([
      supabase.from('disponibilidad').select('*').eq('profesional_id', profesionalId),
      supabase
        .from('excepciones_disponibilidad')
        .select('*')
        .or(`profesional_id.eq.${profesionalId},profesional_id.is.null`),
    ])

  if (errDisp || (errExc && errExc.code !== '42P01')) {
    throw errDisp ?? errExc
  }

  const disponibilidadSafe = disponibilidad ?? []
  const excepcionesSafe = errExc ? [] : (excepciones ?? [])

  const resultado = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (let offset = 1; offset <= 30 && resultado.length < cantidad; offset++) {
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() + offset)

    const diaSemana = diaSemanaISO(fecha)
    if (!disponibilidadSafe.some((d) => d.dia_semana === diaSemana)) continue

    const fechaStr = toISODate(fecha)
    const { data: turnos, error: errTurnos } = await supabase
      .from('turnos')
      .select('hora')
      .eq('profesional_id', profesionalId)
      .eq('fecha', fechaStr)
      .neq('estado', 'cancelado')
    if (errTurnos) throw errTurnos

    const slots = calcularSlotsDisponibles({
      disponibilidad: disponibilidadSafe,
      turnosOcupados: turnos ?? [],
      fecha,
      duracionMin,
      excepciones: excepcionesSafe,
    })

    for (const hora of slots) {
      if (resultado.length >= cantidad) break
      resultado.push({ fecha, hora })
    }
  }

  return resultado
}
