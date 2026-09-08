import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function toFechaStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Determina el estado de un día a partir de las excepciones cargadas para el mes.
function getEstadoDia(fechaStr, profesionalId, excepciones) {
  const excepcion = excepciones.find(
    (e) => e.fecha === fechaStr && (e.profesional_id === profesionalId || e.profesional_id === null),
  )
  if (!excepcion) return { estado: 'disponible', excepcion: null }
  if (excepcion.tipo === 'feriado' || excepcion.tipo === 'cerrado') {
    return { estado: 'cerrado', excepcion }
  }
  if (excepcion.tipo === 'horario_reducido') {
    return { estado: 'reducido', excepcion }
  }
  return { estado: 'disponible', excepcion: null }
}

export default function Calendar({ selected, onSelect, profesionalId }) {
  const today = startOfDay(new Date())
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [excepciones, setExcepciones] = useState([])
  const [cargandoExc, setCargandoExc] = useState(true)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  useEffect(() => {
    let cancelado = false
    async function fetchExcepciones() {
      setCargandoExc(true)
      const primerDiaMes = toFechaStr(new Date(year, month, 1))
      const ultimoDiaMes = toFechaStr(new Date(year, month + 1, 0))
      const { data, error } = await supabase
        .from('excepciones_disponibilidad')
        .select('fecha, tipo, profesional_id, hora_inicio, hora_fin')
        .gte('fecha', primerDiaMes)
        .lte('fecha', ultimoDiaMes)
      // la tabla puede no existir todavía si no se corrió la migración v2
      if (cancelado) return
      setExcepciones(error ? [] : (data ?? []))
      setCargandoExc(false)
    }
    fetchExcepciones()
    return () => {
      cancelado = true
    }
  }, [year, month])

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const isDisabled = (date) => {
    if (!date) return true
    const day = date.getDay()
    return date < today || day === 0 || day === 6
  }

  const diaSeleccionadoInfo = selected
    ? getEstadoDia(toFechaStr(selected), profesionalId, excepciones)
    : null

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-dark/60 hover:bg-teal-light hover:text-teal cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-semibold text-dark">
          {MESES[month]} {year}
        </p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-dark/60 hover:bg-teal-light hover:text-teal cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-dark/50">
        {DIAS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 gap-1 transition-opacity ${
          cargandoExc ? 'pointer-events-none opacity-40' : ''
        }`}
      >
        {cells.map((date, i) => {
          if (!date) return <div key={i} />
          const fueraDeRango = isDisabled(date)
          const isSelected = selected && isSameDay(date, selected)
          const fechaStr = toFechaStr(date)
          const { estado, excepcion } = fueraDeRango
            ? { estado: 'disponible', excepcion: null }
            : getEstadoDia(fechaStr, profesionalId, excepciones)
          const cerrado = estado === 'cerrado'
          const reducido = estado === 'reducido'
          const disabled = fueraDeRango || cerrado

          const title = cerrado
            ? excepcion?.motivo || 'Sin atención este día'
            : reducido
              ? `Horario reducido: ${excepcion.hora_inicio?.slice(0, 5)} a ${excepcion.hora_fin?.slice(0, 5)}`
              : undefined

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !cerrado && onSelect(date)}
              title={title}
              className={`cd aspect-square min-h-10 rounded-lg text-sm font-medium transition-colors ${
                cerrado
                  ? 'cerrado cursor-not-allowed font-semibold'
                  : reducido
                    ? 'reducido cursor-pointer font-semibold'
                    : disabled
                      ? 'cursor-not-allowed text-dark/25'
                      : isSelected
                        ? 'bg-teal text-cream cursor-pointer'
                        : 'text-dark hover:bg-teal-light cursor-pointer'
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {diaSeleccionadoInfo?.estado === 'reducido' && (
        <p className="mt-2 flex items-center gap-1 text-xs text-pending">
          <span>⚠️</span>
          Horario reducido: {diaSeleccionadoInfo.excepcion.hora_inicio?.slice(0, 5)} a{' '}
          {diaSeleccionadoInfo.excepcion.hora_fin?.slice(0, 5)}
        </p>
      )}

      <div className="mt-3 flex gap-4 text-xs text-dark/50">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-cancel bg-[#fdeaea]" />
          Sin atención
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-[#c47f00] bg-[#fff8e6]" />
          Horario reducido
        </span>
      </div>
    </div>
  )
}
