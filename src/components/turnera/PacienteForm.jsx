import { useState } from 'react'
import { CheckCircle2, Search } from 'lucide-react'
import { buscarPacientePorDni } from '../../lib/pacientes'

const OBRAS_SOCIALES = ['Particular', 'IOMA', 'OSDE', 'Swiss Medical', 'Galeno', 'PAMI', 'Otra']

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-dark/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:bg-bg disabled:text-dark/60'

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-dark">{label}</span>
    <input className={inputClass} {...props} />
  </label>
)

export default function PacienteForm({ data, onChange }) {
  const [dniIngresado, setDniIngresado] = useState(data.dni ?? '')
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [buscadoUnaVez, setBuscadoUnaVez] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState(null)

  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value })

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

  const buscar = async () => {
    if (!dniIngresado.trim() || buscando) return
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
    } catch (err) {
      setErrorBusqueda(err.message ?? 'No se pudo buscar el paciente.')
    } finally {
      setBuscando(false)
    }
  }

  const mostrarFormularioCompleto = buscadoUnaVez && (modoEdicion || !pacienteEncontrado)
  const soloLectura = pacienteEncontrado && !modoEdicion

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-2">
        <label className="block flex-1">
          <span className="mb-1.5 block text-sm font-medium text-dark">DNI</span>
          <input
            className={inputClass}
            value={dniIngresado}
            onChange={(e) => {
              setDniIngresado(e.target.value)
              setBuscadoUnaVez(false)
              setPacienteEncontrado(null)
            }}
            onBlur={buscar}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscar())}
            placeholder="38500001"
          />
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={!dniIngresado.trim() || buscando}
          className="flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:bg-teal/40"
        >
          <Search size={16} />
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {errorBusqueda && <p className="text-sm text-cancel">{errorBusqueda}</p>}

      {pacienteEncontrado && !modoEdicion && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-confirm/30 bg-confirm/10 px-4 py-3">
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

      {mostrarFormularioCompleto && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Nombre"
            value={data.nombre}
            onChange={set('nombre')}
            disabled={soloLectura}
            required
            placeholder="Juan"
          />
          <Field
            label="Apellido"
            value={data.apellido}
            onChange={set('apellido')}
            disabled={soloLectura}
            required
            placeholder="García"
          />
          <Field
            label="WhatsApp"
            value={data.telefono}
            onChange={set('telefono')}
            disabled={soloLectura}
            required
            placeholder="221 555 1234"
          />
          <Field
            label="Email"
            type="email"
            value={data.email}
            onChange={set('email')}
            disabled={soloLectura}
            placeholder="juan@mail.com"
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-dark">Obra social</span>
            <select
              className={inputClass}
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
              className={inputClass}
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
