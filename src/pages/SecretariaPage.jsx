import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, UserX, CalendarRange, XCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import KPICard from '../components/secretaria/KPICard'
import TurnosTable from '../components/secretaria/TurnosTable'
import AsignacionModal from '../components/secretaria/AsignacionModal'
import { useTurnos, asignarProfesional } from '../hooks/useTurnos'
import { useProfesionales } from '../hooks/useProfesionales'
import { supabase } from '../lib/supabase'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'cancelado', label: 'Cancelados' },
]

export default function SecretariaPage() {
  const [filtro, setFiltro] = useState('todos')
  const [turnoParaAsignar, setTurnoParaAsignar] = useState(null)
  const [semanaCount, setSemanaCount] = useState(0)

  const hoy = todayStr()
  const { turnos, loading, refetch } = useTurnos({
    fecha: hoy,
    estado: filtro === 'todos' ? undefined : filtro,
  })
  const { profesionales } = useProfesionales()

  useEffect(() => {
    async function fetchSemana() {
      const inicio = new Date()
      const fin = new Date()
      fin.setDate(fin.getDate() + 7)
      const { count } = await supabase
        .from('turnos')
        .select('id', { count: 'exact', head: true })
        .gte('fecha', inicio.toISOString().slice(0, 10))
        .lte('fecha', fin.toISOString().slice(0, 10))
        .neq('estado', 'cancelado')
      setSemanaCount(count ?? 0)
    }
    fetchSemana()
  }, [turnos])

  const kpis = useMemo(() => {
    const sinAsignar = turnos.filter((t) => t.estado === 'pendiente').length
    const cancelados = turnos.filter((t) => t.estado === 'cancelado').length
    return { hoy: turnos.length, sinAsignar, cancelados }
  }, [turnos])

  const cargaPorProfesional = useMemo(() => {
    const map = {}
    for (const t of turnos) {
      if (!t.profesional_id || t.estado !== 'confirmado') continue
      map[t.profesional_id] = (map[t.profesional_id] ?? 0) + 1
    }
    return map
  }, [turnos])

  const handleAsignar = async (turno, profesional) => {
    await asignarProfesional(turno.id, profesional.id)
    await refetch()
    setTurnoParaAsignar(null)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">Panel de secretaría</h1>
        <p className="mt-1 text-dark/60">Gestioná los turnos de hoy y asigná profesionales.</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard label="Turnos hoy" value={kpis.hoy} icon={CalendarDays} accent="teal" />
        <KPICard label="Sin asignar" value={kpis.sinAsignar} icon={UserX} accent="pending" />
        <KPICard label="Esta semana" value={semanaCount} icon={CalendarRange} accent="sand" />
        <KPICard label="Cancelados" value={kpis.cancelados} icon={XCircle} accent="cancel" />
      </div>

      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                filtro === f.key
                  ? 'bg-teal text-cream'
                  : 'bg-bg text-dark/70 hover:bg-teal-light'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <TurnosTable turnos={turnos} loading={loading} onAsignar={setTurnoParaAsignar} />
      </Card>

      <AsignacionModal
        turno={turnoParaAsignar}
        profesionales={profesionales}
        cargaPorProfesional={cargaPorProfesional}
        onAsignar={handleAsignar}
        onClose={() => setTurnoParaAsignar(null)}
      />
    </div>
  )
}
