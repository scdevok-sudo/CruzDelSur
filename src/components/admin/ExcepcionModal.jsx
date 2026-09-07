import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { crearExcepcion } from '../../hooks/useExcepciones'

const TIPOS = [
  { value: 'feriado', label: 'Feriado' },
  { value: 'cerrado', label: 'Día cerrado' },
  { value: 'horario_reducido', label: 'Horario reducido' },
]

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-dark placeholder:text-dark/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20'

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const initialForm = {
  fecha: '',
  tipo: 'feriado',
  profesionalId: '',
  horaInicio: '',
  horaFin: '',
  motivo: '',
}

export default function ExcepcionModal({ open, profesionales, onCreated, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleClose = () => {
    setForm(initialForm)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.fecha || !form.tipo) {
      setError('Completá la fecha y el tipo.')
      return
    }
    if (form.tipo === 'horario_reducido') {
      if (!form.horaInicio || !form.horaFin) {
        setError('Indicá la hora de inicio y fin.')
        return
      }
      if (form.horaFin <= form.horaInicio) {
        setError('La hora de fin debe ser posterior a la de inicio.')
        return
      }
    }

    setGuardando(true)
    try {
      const excepcion = await crearExcepcion({
        fecha: form.fecha,
        tipo: form.tipo,
        profesionalId: form.profesionalId,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        motivo: form.motivo,
      })
      onCreated(excepcion)
      handleClose()
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar la excepción.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Agregar excepción">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dark">Fecha</span>
          <input
            type="date"
            className={inputClass}
            min={todayStr()}
            value={form.fecha}
            onChange={set('fecha')}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dark">Tipo</span>
          <select className={inputClass} value={form.tipo} onChange={set('tipo')}>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dark">Profesional</span>
          <select className={inputClass} value={form.profesionalId} onChange={set('profesionalId')}>
            <option value="">Todo el consultorio</option>
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>
        </label>

        {form.tipo === 'horario_reducido' && (
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-dark">Hora inicio</span>
              <input
                type="time"
                className={inputClass}
                value={form.horaInicio}
                onChange={set('horaInicio')}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-dark">Hora fin</span>
              <input
                type="time"
                className={inputClass}
                value={form.horaFin}
                onChange={set('horaFin')}
                required
              />
            </label>
          </div>
        )}

        {form.tipo === 'horario_reducido' && (
          <p className="-mt-2 text-xs text-dark/50">
            El sistema solo mostrará turnos dentro de este rango ese día.
          </p>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-dark">Motivo</span>
          <input
            className={inputClass}
            value={form.motivo}
            onChange={set('motivo')}
            placeholder="Opcional"
          />
        </label>

        {error && <p className="text-sm text-cancel">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
