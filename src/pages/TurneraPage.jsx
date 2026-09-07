import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import StepWizard from '../components/turnera/StepWizard'
import EspecialidadGrid from '../components/turnera/EspecialidadGrid'
import ProfCard from '../components/turnera/ProfCard'
import Calendar from '../components/turnera/Calendar'
import TimeGrid from '../components/turnera/TimeGrid'
import PacienteForm from '../components/turnera/PacienteForm'
import { useEspecialidades } from '../hooks/useEspecialidades'
import { useProfesionales } from '../hooks/useProfesionales'
import { useSlotsDisponibles } from '../hooks/useDisponibilidad'
import { useTurnos, crearTurno } from '../hooks/useTurnos'
import { getProximosTurnosDisponibles } from '../lib/slots'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fechaToStr = (fecha) => {
  if (!fecha) return null
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

const formatFecha = (fecha) =>
  fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

const emptyPaciente = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  obraSocial: '',
  motivo: '',
  derivadoPor: '',
}

export default function TurneraPage() {
  const [step, setStep] = useState(1)
  const [especialidad, setEspecialidad] = useState(null)
  const [profesional, setProfesional] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  const [paciente, setPaciente] = useState(emptyPaciente)
  const [submitting, setSubmitting] = useState(false)
  const [turnoCreado, setTurnoCreado] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [proximosTurnos, setProximosTurnos] = useState([])
  const [loadingProximos, setLoadingProximos] = useState(false)

  const { especialidades, loading: loadingEsp, error: errorEsp } = useEspecialidades()
  const { profesionales, loading: loadingProf, error: errorProf } = useProfesionales({
    especialidadId: especialidad?.id,
  })
  const { turnos: turnosHoy } = useTurnos({ fecha: todayStr() })
  const { slots, loading: loadingSlots } = useSlotsDisponibles(profesional?.id, fecha)

  useEffect(() => {
    if (!profesional?.id) {
      setProximosTurnos([])
      return
    }
    let cancelado = false
    setLoadingProximos(true)
    getProximosTurnosDisponibles(profesional.id, 3)
      .then((r) => !cancelado && setProximosTurnos(r))
      .catch(() => !cancelado && setProximosTurnos([]))
      .finally(() => !cancelado && setLoadingProximos(false))
    return () => {
      cancelado = true
    }
  }, [profesional?.id])

  const cargaPorProfesional = useMemo(() => {
    const map = {}
    for (const t of turnosHoy) {
      if (!t.profesional_id) continue
      map[t.profesional_id] = (map[t.profesional_id] ?? 0) + 1
    }
    return map
  }, [turnosHoy])

  const puedeAvanzar = {
    1: !!especialidad,
    2: !!profesional,
    3: !!fecha,
    4: !!hora,
    5:
      paciente.nombre.trim() &&
      paciente.apellido.trim() &&
      paciente.dni.trim() &&
      paciente.telefono.trim(),
  }[step]

  const irSiguiente = async () => {
    if (step < 5) {
      setStep(step + 1)
      return
    }
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const turno = await crearTurno({
        paciente,
        fecha: fechaToStr(fecha),
        hora: `${hora}:00`,
        especialidadId: profesional.especialidad_id,
        profesionalId: profesional.id,
        motivo: paciente.motivo,
        derivadoPor: paciente.derivadoPor,
      })
      setTurnoCreado(turno)
      setStep(6)
    } catch (err) {
      setErrorMsg(err.message ?? 'No se pudo guardar el turno. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const irAtras = () => setStep((s) => Math.max(1, s - 1))

  const elegirEspecialidad = (esp) => {
    setEspecialidad(esp)
    setProfesional(null)
    setFecha(null)
    setHora(null)
  }

  const elegirProximoTurno = ({ fecha: f, hora: h }) => {
    setFecha(f)
    setHora(h)
    setStep(5)
  }

  const reiniciar = () => {
    setStep(1)
    setEspecialidad(null)
    setProfesional(null)
    setFecha(null)
    setHora(null)
    setPaciente(emptyPaciente)
    setTurnoCreado(null)
    setErrorMsg(null)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-dark sm:text-3xl">Reservá tu turno</h1>
        <p className="mt-1 text-dark/60">Cruz del Sur · Consultorios Médicos</p>
      </div>

      <StepWizard step={step} />

      <Card className="p-5 sm:p-8">
        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-dark">Elegí una especialidad</h2>
            {loadingEsp ? (
              <p className="text-sm text-dark/50">Cargando especialidades...</p>
            ) : errorEsp ? (
              <p className="text-sm text-cancel">
                No se pudieron cargar las especialidades: {errorEsp.message}
              </p>
            ) : (
              <EspecialidadGrid
                especialidades={especialidades}
                selected={especialidad}
                onSelect={elegirEspecialidad}
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-dark">Elegí una profesional</h2>
            {loadingProf ? (
              <p className="text-sm text-dark/50">Cargando profesionales...</p>
            ) : errorProf ? (
              <p className="text-sm text-cancel">
                No se pudieron cargar las profesionales: {errorProf.message}
              </p>
            ) : profesionales.length === 0 ? (
              <p className="text-sm text-dark/50">No hay profesionales disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profesionales.map((p) => (
                  <ProfCard
                    key={p.id}
                    profesional={p}
                    turnosHoy={cargaPorProfesional[p.id] ?? 0}
                    selected={profesional?.id === p.id}
                    onSelect={setProfesional}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-dark">Elegí una fecha</h2>

            {!loadingProximos && proximosTurnos.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-dark/60">
                  Turnos más próximos disponibles
                </p>
                <div className="flex flex-wrap gap-2">
                  {proximosTurnos.map(({ fecha: f, hora: h }) => (
                    <button
                      key={`${fechaToStr(f)}-${h}`}
                      onClick={() => elegirProximoTurno({ fecha: f, hora: h })}
                      className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm font-medium transition-all hover:border-teal hover:bg-teal-light"
                    >
                      {formatFecha(f)} · {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!loadingProximos && proximosTurnos.length === 0 && (
              <p className="mb-5 text-sm text-dark/50">
                No hay turnos disponibles en los próximos 30 días. Comunicate al WhatsApp del
                consultorio.
              </p>
            )}

            <Calendar selected={fecha} onSelect={setFecha} profesionalId={profesional?.id} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-dark">Elegí un horario</h2>
            <TimeGrid slots={slots} selected={hora} onSelect={setHora} loading={loadingSlots} />
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-dark">Tus datos</h2>
            <PacienteForm data={paciente} onChange={setPaciente} />

            {profesional?.precio_consulta != null && (
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-pending/30 bg-pending/10 p-4">
                <Wallet className="shrink-0 text-pending" size={22} />
                <div>
                  <p className="text-sm font-semibold text-dark">Valor de la consulta</p>
                  <p className="text-2xl font-bold text-dark">
                    ${profesional.precio_consulta.toLocaleString('es-AR')} ARS
                  </p>
                  {!profesional.atiende_obra_social && (
                    <p className="mt-1 text-xs text-dark/50">
                      Atención particular · Consultar reintegro con su obra social
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && turnoCreado && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-confirm/10">
              <CalendarCheck className="text-confirm" size={32} />
            </div>
            <h2 className="text-xl font-bold text-dark">¡Turno reservado!</h2>
            <p className="mt-1 text-dark/60">Te esperamos en el consultorio.</p>

            <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl bg-bg p-4 text-left text-sm">
              <Resumen label="Especialidad" value={especialidad?.nombre} />
              <Resumen label="Profesional" value={`${profesional.nombre} ${profesional.apellido}`} />
              <Resumen label="Fecha" value={fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })} />
              <Resumen label="Horario" value={hora} />
              <Resumen label="Paciente" value={`${paciente.nombre} ${paciente.apellido}`} />
              <Resumen label="Código" value={turnoCreado.token} />
            </div>

            <Button className="mt-6" onClick={reiniciar}>
              Reservar otro turno
            </Button>
          </div>
        )}

        {errorMsg && <p className="mt-4 text-sm text-cancel">{errorMsg}</p>}

        {step < 6 && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={irAtras} disabled={step === 1}>
              <ChevronLeft size={16} /> Atrás
            </Button>
            <Button onClick={irSiguiente} disabled={!puedeAvanzar || submitting}>
              {step === 5 ? (submitting ? 'Guardando...' : 'Confirmar turno') : 'Siguiente'}
              {step < 5 && <ChevronRight size={16} />}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

function Resumen({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-dark/50">{label}</span>
      <span className="font-medium text-dark">{value}</span>
    </div>
  )
}
