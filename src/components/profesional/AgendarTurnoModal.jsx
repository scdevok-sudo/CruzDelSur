import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { buscarPacientePorDni } from '../../lib/pacientes'
import { useSlotsDisponibles } from '../../hooks/useDisponibilidad'
import { supabase } from '../../lib/supabase'

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-dark/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20'

const fechaToStr = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

function proximosDias(cantidad = 14) {
  const dias = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  for (let i = 0; i <= cantidad; i++) {
    const d = new Date(hoy)
    d.setDate(d.getDate() + i)
    dias.push(d)
  }
  return dias
}

const emptyForm = { nombre: '', apellido: '', telefono: '', motivo: '' }

export default function AgendarTurnoModal({ open, onClose, profesional, onCreado }) {
  const [dni, setDni] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null)
  const [buscadoUnaVez, setBuscadoUnaVez] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const { slots, loading: loadingSlots } = useSlotsDisponibles(profesional?.id, fecha)

  useEffect(() => {
    if (!open) {
      setDni('')
      setBuscando(false)
      setPacienteEncontrado(null)
      setBuscadoUnaVez(false)
      setForm(emptyForm)
      setFecha(null)
      setHora(null)
      setError(null)
    }
  }, [open])

  const buscar = async () => {
    if (!dni.trim() || buscando) return
    setBuscando(true)
    setError(null)
    try {
      const p = await buscarPacientePorDni(dni)
      setBuscadoUnaVez(true)
      setPacienteEncontrado(p)
      if (p) {
        setForm({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono ?? '', motivo: '' })
      }
    } catch (err) {
      setError(err.message ?? 'No se pudo buscar el paciente.')
    } finally {
      setBuscando(false)
    }
  }

  const puedeConfirmar =
    profesional && dni.trim() && form.nombre.trim() && form.apellido.trim() && fecha && hora

  const confirmar = async () => {
    setGuardando(true)
    setError(null)
    try {
      let pacienteId = pacienteEncontrado?.id ?? null
      if (!pacienteId) {
        const { data: nuevo, error: errPac } = await supabase
          .from('pacientes')
          .insert({
            nombre: form.nombre,
            apellido: form.apellido,
            dni: dni.trim(),
            telefono: form.telefono,
          })
          .select()
          .single()
        if (errPac) throw errPac
        pacienteId = nuevo.id
      }

      const { data: turno, error: errTurno } = await supabase
        .from('turnos')
        .insert({
          paciente_id: pacienteId,
          profesional_id: profesional.id,
          especialidad_id: profesional.especialidad_id,
          fecha: fechaToStr(fecha),
          hora: `${hora}:00`,
          motivo: form.motivo,
          estado: 'confirmado',
        })
        .select('*, paciente:pacientes(*), profesional:profesionales(*), especialidad:especialidades(*)')
        .single()
      if (errTurno) throw errTurno

      onCreado?.(turno)
      onClose()
    } catch (err) {
      setError(err.message ?? 'No se pudo agendar el turno.')
    } finally {
      setGuardando(false)
    }
  }

  const diasHabilitados = profesional
    ? new Set((profesional.disponibilidad ?? []).map((d) => d.dia_semana))
    : new Set()

  return (
    <Modal open={open} onClose={onClose} title="Agendar turno">
      <div className="space-y-5">
        <div className="flex items-end gap-2">
          <label className="block flex-1">
            <span className="mb-1.5 block text-sm font-medium text-dark">DNI del paciente</span>
            <input
              className={inputClass}
              value={dni}
              onChange={(e) => {
                setDni(e.target.value)
                setBuscadoUnaVez(false)
                setPacienteEncontrado(null)
              }}
              placeholder="38500001"
            />
          </label>
          <button
            type="button"
            onClick={buscar}
            disabled={!dni.trim() || buscando}
            className="flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-cream hover:bg-teal-dark disabled:cursor-not-allowed disabled:bg-teal/40"
          >
            <Search size={16} />
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {buscadoUnaVez && pacienteEncontrado && (
          <p className="text-sm text-confirm">
            Paciente encontrado: {pacienteEncontrado.nombre} {pacienteEncontrado.apellido}
            {pacienteEncontrado.obra_social ? ` · ${pacienteEncontrado.obra_social}` : ''}
          </p>
        )}
        {buscadoUnaVez && !pacienteEncontrado && (
          <p className="text-sm text-dark/50">No se encontró el DNI, completá los datos.</p>
        )}

        {buscadoUnaVez && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-dark">Nombre</span>
              <input
                className={inputClass}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                disabled={!!pacienteEncontrado}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-dark">Apellido</span>
              <input
                className={inputClass}
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                disabled={!!pacienteEncontrado}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-dark">WhatsApp</span>
              <input
                className={inputClass}
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                disabled={!!pacienteEncontrado}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-dark">Motivo (opcional)</span>
              <textarea
                className={inputClass}
                rows={2}
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              />
            </label>
          </div>
        )}

        {buscadoUnaVez && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-dark">Fecha</p>
            <div className="flex flex-wrap gap-2">
              {proximosDias().map((d) => {
                const dow = d.getDay() === 0 ? 7 : d.getDay()
                const habilitado = diasHabilitados.has(dow)
                const seleccionado = fecha && fechaToStr(fecha) === fechaToStr(d)
                return (
                  <button
                    key={fechaToStr(d)}
                    type="button"
                    disabled={!habilitado}
                    onClick={() => {
                      setFecha(d)
                      setHora(null)
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      !habilitado
                        ? 'cursor-not-allowed border-border text-dark/25'
                        : seleccionado
                          ? 'cursor-pointer border-teal bg-teal text-cream'
                          : 'cursor-pointer border-border text-dark hover:border-teal/50 hover:bg-teal-light'
                    }`}
                  >
                    {d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {buscadoUnaVez && fecha && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-dark">Horario</p>
            {loadingSlots ? (
              <p className="text-sm text-dark/50">Buscando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-dark/50">No hay horarios libres ese día.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHora(s)}
                    className={`cursor-pointer rounded-lg border px-2 py-1.5 text-sm font-medium transition-colors ${
                      hora === s
                        ? 'border-teal bg-teal text-cream'
                        : 'border-border text-dark hover:border-teal/50 hover:bg-teal-light'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-cancel">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!puedeConfirmar || guardando}>
            {guardando ? 'Guardando...' : 'Confirmar turno'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
