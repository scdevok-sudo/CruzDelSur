import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '../ui/Button'
import ExcepcionModal from './ExcepcionModal'
import { eliminarExcepcion } from '../../hooks/useExcepciones'

const TIPOS = {
  feriado: { label: '🔴 Feriado', className: 'bg-cancel/10 text-cancel' },
  cerrado: { label: '⚫ Cerrado', className: 'bg-dark/10 text-dark' },
  horario_reducido: { label: '🟡 Horario reducido', className: 'bg-pending/10 text-pending' },
}

const formatFecha = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return `${dias[fecha.getDay()]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

function EliminarButton({ onConfirm }) {
  const [confirmando, setConfirmando] = useState(false)

  const handleClick = () => {
    if (!confirmando) {
      setConfirmando(true)
      setTimeout(() => setConfirmando(false), 3000)
      return
    }
    setConfirmando(false)
    onConfirm()
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
        confirmando ? 'bg-cancel text-cream' : 'text-cancel hover:bg-cancel/10'
      }`}
    >
      {confirmando ? '¿Confirmar?' : 'Eliminar'}
    </button>
  )
}

export default function ExcepcionesTable({ excepciones, loading, profesionales, refetch }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleEliminar = async (id) => {
    await eliminarExcepcion(id)
    await refetch()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-dark">Días especiales y excepciones</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Agregar excepción
        </Button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-dark/50">Cargando excepciones...</p>
      ) : !excepciones.length ? (
        <p className="py-10 text-center text-sm text-dark/50">No hay excepciones cargadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-dark/50">
                <th className="py-2.5 pr-3 font-medium">Fecha</th>
                <th className="py-2.5 pr-3 font-medium">Tipo</th>
                <th className="py-2.5 pr-3 font-medium">Profesional</th>
                <th className="py-2.5 pr-3 font-medium">Horario</th>
                <th className="py-2.5 pr-3 font-medium">Motivo</th>
                <th className="py-2.5 pr-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {excepciones.map((e) => {
                const tipo = TIPOS[e.tipo] ?? { label: e.tipo, className: 'bg-bg text-dark' }
                return (
                  <tr key={e.id} className="hover:bg-bg/60">
                    <td className="py-3 pr-3 font-medium text-dark">{formatFecha(e.fecha)}</td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tipo.className}`}>
                        {tipo.label}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-dark/80">
                      {e.profesional ? `${e.profesional.nombre} ${e.profesional.apellido}` : 'Todo el consultorio'}
                    </td>
                    <td className="py-3 pr-3 text-dark/80">
                      {e.tipo === 'horario_reducido' && e.hora_inicio && e.hora_fin
                        ? `${e.hora_inicio.slice(0, 5)} – ${e.hora_fin.slice(0, 5)}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-3 text-dark/80">{e.motivo || '—'}</td>
                    <td className="py-3 pr-3 text-right">
                      <EliminarButton onConfirm={() => handleEliminar(e.id)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ExcepcionModal
        open={modalOpen}
        profesionales={profesionales}
        onCreated={refetch}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
