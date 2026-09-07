import { CalendarDays, CircleCheck, CircleX, CalendarPlus, TriangleAlert } from 'lucide-react'
import Card from '../components/ui/Card'
import KPICard from '../components/secretaria/KPICard'
import ExcepcionesTable from '../components/admin/ExcepcionesTable'
import { useAdminData } from '../hooks/useAdminData'
import { useExcepciones } from '../hooks/useExcepciones'
import { useProfesionales } from '../hooks/useProfesionales'

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function fechaHoyTexto() {
  const hoy = new Date()
  const dia = DIAS[hoy.getDay()]
  const fecha = hoy.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
  return `${dia}, ${fecha}`
}

export default function AdminPage() {
  const { loading, turnosHoy, totalHoy, confirmadosHoy, sinAsignar, proximoTurno, kpisSemana } =
    useAdminData()
  const { excepciones, loading: loadingExcepciones, refetch } = useExcepciones()
  const { profesionales } = useProfesionales()

  const profesionalesHoy = profesionales
    .map((prof) => ({
      ...prof,
      turnos: turnosHoy.filter((t) => t.profesional_id === prof.id),
    }))
    .filter((prof) => prof.turnos.length > 0)

  const turnosSinAsignar = turnosHoy.filter((t) => !t.profesional_id)
  const columnas = profesionalesHoy.length + (turnosSinAsignar.length > 0 ? 1 : 0)

  const kpis = [
    { label: 'Turnos esta semana', value: kpisSemana.turnosSemana, icon: CalendarDays, accent: 'teal' },
    { label: 'Confirmados', value: kpisSemana.confirmadosSemana, icon: CircleCheck, accent: 'teal' },
    { label: 'Cancelados', value: kpisSemana.canceladosSemana, icon: CircleX, accent: 'cancel' },
    { label: 'Próxima semana', value: kpisSemana.turnosProximaSemana, icon: CalendarPlus, accent: 'sand' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-6">
        {/* SECCIÓN 1 — Header con resumen del día */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-dark p-6">
          <div>
            <p className="mb-1 text-sm text-white/50">Panel de administración · Cruz del Sur</p>
            <h1 className="text-2xl font-bold text-white">{saludo()}, Flor 👋</h1>
            <p className="mt-1 text-sm text-white/40">{fechaHoyTexto()}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-xl bg-white/10 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{totalHoy}</p>
              <p className="text-xs text-white/50">Turnos hoy</p>
            </div>
            <div className="rounded-xl bg-white/10 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-confirm">{confirmadosHoy}</p>
              <p className="text-xs text-white/50">Confirmados</p>
            </div>
            <div className="rounded-xl bg-amber-400/20 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{sinAsignar}</p>
              <p className="text-xs text-white/50">Sin asignar</p>
            </div>
            {proximoTurno && (
              <div className="rounded-xl bg-teal/30 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-teal-light">{proximoTurno.hora.slice(0, 5)}</p>
                <p className="text-xs text-white/50">Próximo turno</p>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN 2 — Agenda de hoy por profesional */}
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-dark">Agenda de hoy</h2>
          {loading ? (
            <p className="py-10 text-center text-sm text-dark/50">Cargando agenda...</p>
          ) : columnas === 0 ? (
            <p className="py-10 text-center text-sm text-dark/50">No hay turnos cargados para hoy.</p>
          ) : (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${Math.min(columnas, 4)}, minmax(220px, 1fr))` }}
            >
              {profesionalesHoy.map((prof) => (
                <div key={prof.id} className="overflow-hidden rounded-xl border border-border">
                  <div className="border-b border-border bg-bg px-4 py-3">
                    <p className="text-sm font-bold text-dark">Dra. {prof.apellido}</p>
                    <p className="text-xs text-dark/50">
                      {prof.turnos.length} turno{prof.turnos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    {prof.turnos.map((t) => (
                      <div
                        key={t.id}
                        className={`rounded-lg border px-3 py-2.5 text-sm ${
                          t.estado === 'confirmado'
                            ? 'border-green-200 bg-confirm/10'
                            : 'border-amber-200 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-dark">{t.hora.slice(0, 5)}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              t.estado === 'confirmado'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {t.estado}
                          </span>
                        </div>
                        <p className="mt-0.5 font-medium text-dark">
                          {t.paciente?.nombre} {t.paciente?.apellido}
                        </p>
                        {t.motivo && <p className="mt-0.5 text-xs text-dark/50">{t.motivo}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {turnosSinAsignar.length > 0 && (
                <div className="overflow-hidden rounded-xl border-2 border-amber-300">
                  <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="flex items-center gap-1 text-sm font-bold text-amber-700">
                      <TriangleAlert size={14} /> Sin asignar
                    </p>
                    <p className="text-xs text-amber-600">{turnosSinAsignar.length} requieren atención</p>
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    {turnosSinAsignar.map((t) => (
                      <div key={t.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm">
                        <span className="font-bold text-dark">{t.hora.slice(0, 5)}</span>
                        <p className="mt-0.5 font-medium text-dark">
                          {t.paciente?.nombre} {t.paciente?.apellido}
                        </p>
                        <p className="text-xs text-dark/50">{t.especialidad?.nombre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* SECCIÓN 3 — KPIs de la semana */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>

        {/* SECCIÓN 4 — Excepciones de disponibilidad */}
        <Card className="p-5 sm:p-6">
          <ExcepcionesTable
            excepciones={excepciones}
            loading={loadingExcepciones}
            profesionales={profesionales}
            refetch={refetch}
          />
        </Card>
      </div>
    </div>
  )
}
