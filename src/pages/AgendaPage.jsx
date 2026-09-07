import { useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import AgendaHoy from '../components/profesional/AgendaHoy'
import VistaSemanal from '../components/profesional/VistaSemanal'
import AgendarTurnoModal from '../components/profesional/AgendarTurnoModal'
import { useProfesionales } from '../hooks/useProfesionales'
import { useTurnos } from '../hooks/useTurnos'
import { supabase } from '../lib/supabase'

const PROFESIONAL_ID_KEY = 'cds_profesional_id'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function inicioDeSemana() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7 // lunes = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

const TURNO_SELECT = `*, paciente:pacientes(*), profesional:profesionales(*), especialidad:especialidades(*)`

export default function AgendaPage() {
  const [vista, setVista] = useState('hoy')
  const [profesionalId, setProfesionalId] = useState(() => localStorage.getItem(PROFESIONAL_ID_KEY) ?? '')
  const [turnosSemana, setTurnosSemana] = useState([])
  const [loadingSemana, setLoadingSemana] = useState(false)
  const [modalAgendarOpen, setModalAgendarOpen] = useState(false)

  const { profesionales, loading: loadingProf } = useProfesionales()
  const { turnos: turnosHoy, loading: loadingHoy, refetch: refetchHoy } = useTurnos({
    fecha: todayStr(),
    profesionalId: profesionalId || undefined,
  })

  useEffect(() => {
    if (profesionales.length && !profesionalId) {
      setProfesionalId(profesionales[0].id)
    }
  }, [profesionales, profesionalId])

  const seleccionarProfesional = (id) => {
    setProfesionalId(id)
    localStorage.setItem(PROFESIONAL_ID_KEY, id)
  }

  const weekStart = inicioDeSemana()

  useEffect(() => {
    if (vista !== 'semana' || !profesionalId) return
    async function fetchSemana() {
      setLoadingSemana(true)
      const fin = new Date(weekStart)
      fin.setDate(fin.getDate() + 6)
      const { data } = await supabase
        .from('turnos')
        .select(TURNO_SELECT)
        .eq('profesional_id', profesionalId)
        .gte('fecha', weekStart.toISOString().slice(0, 10))
        .lte('fecha', fin.toISOString().slice(0, 10))
      setTurnosSemana(data ?? [])
      setLoadingSemana(false)
    }
    fetchSemana()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, profesionalId])

  const profesionalActual = profesionales.find((p) => p.id === profesionalId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark sm:text-3xl">Mi agenda</h1>
          <p className="mt-1 text-dark/60">
            {profesionalActual
              ? `${profesionalActual.nombre} ${profesionalActual.apellido} · ${profesionalActual.especialidad?.nombre ?? 'Odontología'}`
              : 'Elegí una profesional'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={profesionalId}
            onChange={(e) => seleccionarProfesional(e.target.value)}
            disabled={loadingProf}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-dark focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          >
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>
          <Button onClick={() => setModalAgendarOpen(true)} disabled={!profesionalActual}>
            <CalendarPlus size={16} />
            Agendar turno
          </Button>
        </div>
      </div>

      <AgendarTurnoModal
        open={modalAgendarOpen}
        onClose={() => setModalAgendarOpen(false)}
        profesional={profesionalActual}
        onCreado={refetchHoy}
      />

      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setVista('hoy')}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            vista === 'hoy' ? 'bg-teal text-cream' : 'bg-bg text-dark/70 hover:bg-teal-light'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setVista('semana')}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
            vista === 'semana' ? 'bg-teal text-cream' : 'bg-bg text-dark/70 hover:bg-teal-light'
          }`}
        >
          Semana
        </button>
      </div>

      <Card className="p-5 sm:p-6">
        {vista === 'hoy' ? (
          <AgendaHoy turnos={turnosHoy} loading={loadingHoy} />
        ) : (
          <>
            {loadingSemana ? (
              <p className="py-10 text-center text-sm text-dark/50">Cargando semana...</p>
            ) : (
              <VistaSemanal turnos={turnosSemana} weekStart={weekStart} />
            )}
          </>
        )}
      </Card>
    </div>
  )
}
