import { useState } from 'react'
import { AlertCircle, CheckCircle2, Search } from 'lucide-react'
import { buscarPacientePorDni } from '../../lib/pacientes'
import { soloDigitos, validarDni, validarPaciente } from '../../lib/validaciones'
import ErrorState from '../ui/ErrorState'

const OBRAS_SOCIALES = ['Particular', 'IOMA', 'OSDE', 'Swiss Medical', 'Galeno', 'PAMI', 'Otra']

const inputBase =
  'w-full min-h-11 rounded-xl border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 disabled:bg-bg disabled:text-dark/60'
const inputOk = 'border-border focus:border-teal focus:ring-teal/20'
const inputMal = 'border-cancel focus:border-cancel focus:ring-cancel/20'

const claseInput = (error) => `${inputBase} ${error ? inputMal : inputOk}`

const ErrorCampo = ({ children }) => (
  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-cancel">
    <AlertCircle size={13} className="shrink-0" />
    {children}
  </span>
)

const Field = ({ label, error, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-dark">{label}</span>
    <input className={claseInput(error)} aria-invalid={!!error} {...props} />
    {error && <ErrorCampo>{error}</ErrorCampo>}
  </label>
)

export default function PacienteForm({ data, onChange }) {
  const [dniIngresado, setDniIngresado] = useState(data.dni ?? '')
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [buscadoUnaVez, setBuscadoUnaVez] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState(null)
  const [tocado, setTocado] = useState({})

  const errores = validarPaciente({ ...data, dni: dniIngresado })
  // El error de un campo recién se muestra cuando el paciente lo tocó.
  const errorDe = (campo) => (tocado[campo] ? errores[campo] : undefined)
  const marcarTocado = (campo) => () => setTocado((t) => ({ ...t, [campo]: true }))

  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value })
  // WhatsApp: dejamos escribir con espacios, pero nada que no sea dígito.
  const setTelefono = (e) =>
    onChange({ ...data, telefono: e.target.value.replace(/[^\d\s]/g, '').slice(0, 15) })

  const aplicarPaciente = (p) => {
    onChange({
      nombre: p.nombre ?? '',
      apellido: p.apellido ?? '',
      dni: p.dni ?? dniIngresado,
      telefono: p.telefono ?? '',
      email: p.email ?? '',
      obraSocial: p.obra_social ?? '',
      motivo: data.motivo ?? '',
      derivadoPor: data.derivadoPor ?? '',
    })
  }

  const cambiarDni = (e) => {
    const valor = soloDigitos(e.target.value).slice(0, 8)
    setDniIngresado(valor)
    setBuscadoUnaVez(false)
    setPacienteEncontrado(null)
    onChange({ ...data, dni: valor })
  }

  const buscar = async () => {
    setTocado((t) => ({ ...t, dni: true }))
    if (validarDni(dniIngresado) || buscando) return
    setBuscando(true)
    setErrorBusqueda(null)
    try {
      const paciente = await buscarPacientePorDni(dniIngresado)
      setBuscadoUnaVez(true)
      if (paciente) {
        setPacienteEncontrado(paciente)
        setModoEdicion(false)
        aplicarPaciente(paciente)
      } else {
        setPacienteEncontrado(null)
        setModoEdicion(true)
        onChange({ ...data, dni: dniIngresado })
      }
    } catch {
      setErrorBusqueda('No pudimos verificar tu DNI. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  const mostrarFormularioCompleto = buscadoUnaVez && (modoEdicion || !pacienteEncontrado)
  const soloLectura = pacienteEncontrado && !modoEdicion

  // Un paciente ya guardado puede tener datos que hoy no pasan la validación
  // (ej: teléfono viejo sin código de área). Se lo avisamos para que los corrija.
  const datosGuardadosIncompletos =
    soloLectura && Object.keys(errores).some((campo) => campo !== 'dni')

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-2">
        <label className="block flex-1">
          <span className="mb-1.5 block text-sm font-medium text-dark">DNI</span>
          <input
            className={claseInput(errorDe('dni'))}
            value={dniIngresado}
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            aria-invalid={!!errorDe('dni')}
            onChange={cambiarDni}
            onBlur={buscar}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscar())}
            placeholder="38500001"
          />
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={!dniIngresado.trim() || buscando}
          className="flex min-h-11 items-center gap-1.5 rounded-xl bg-teal px-4 text-sm font-semibold text-cream transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:bg-teal/40 cursor-pointer"
        >
          <Search size={16} />
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {errorDe('dni') && <ErrorCampo>{errorDe('dni')}</ErrorCampo>}

      {errorBusqueda && <ErrorState mensaje={errorBusqueda} onRetry={buscar} />}

      {pacienteEncontrado && !modoEdicion && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-confirm/30 bg-confirm/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="shrink-0 text-confirm" size={18} />
            <p className="text-sm font-medium text-dark">
              ¡Bienvenido/a de nuevo, {pacienteEncontrado.nombre}!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModoEdicion(true)}
            className="shrink-0 text-sm font-medium text-teal-dark underline-offset-2 hover:underline cursor-pointer"
          >
            No soy yo / editar datos
          </button>
        </div>
      )}

      {datosGuardadosIncompletos && (
        <div className="flex items-center gap-2 rounded-xl border border-pending/30 bg-pending/10 p-3 text-sm text-dark">
          <AlertCircle size={16} className="shrink-0 text-pending" />
          Nos faltan algunos de tus datos. Tocá &ldquo;editar datos&rdquo; para completarlos.
        </div>
      )}

      {mostrarFormularioCompleto && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nombre"
            value={data.nombre}
            onChange={set('nombre')}
            onBlur={marcarTocado('nombre')}
            error={errorDe('nombre')}
            disabled={soloLectura}
            autoComplete="given-name"
            required
            placeholder="Juan"
          />
          <Field
            label="Apellido"
            value={data.apellido}
            onChange={set('apellido')}
            onBlur={marcarTocado('apellido')}
            error={errorDe('apellido')}
            disabled={soloLectura}
            autoComplete="family-name"
            required
            placeholder="García"
          />
          <Field
            label="WhatsApp"
            value={data.telefono}
            onChange={setTelefono}
            onBlur={marcarTocado('telefono')}
            error={errorDe('telefono')}
            disabled={soloLectura}
            inputMode="tel"
            autoComplete="tel-national"
            required
            placeholder="221 555 1234"
          />
          <Field
            label="Email"
            type="email"
            value={data.email}
            onChange={set('email')}
            onBlur={marcarTocado('email')}
            error={errorDe('email')}
            disabled={soloLectura}
            autoComplete="email"
            placeholder="juan@mail.com"
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-dark">Obra social</span>
            <select
              className={claseInput(null)}
              value={data.obraSocial}
              onChange={set('obraSocial')}
              disabled={soloLectura}
            >
              <option value="">Seleccionar...</option>
              {OBRAS_SOCIALES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Derivado por"
            value={data.derivadoPor ?? ''}
            onChange={set('derivadoPor')}
            placeholder="Opcional"
          />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-dark">Motivo de la consulta</span>
            <textarea
              className={claseInput(null)}
              rows={3}
              value={data.motivo}
              onChange={set('motivo')}
              placeholder="Control, dolor, limpieza..."
            />
          </label>
        </div>
      )}
    </div>
  )
}
