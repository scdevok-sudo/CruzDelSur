import { useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

const MAX_REFERENCIAL = 8

export default function AsignacionModal({ turno, profesionales, cargaPorProfesional, onAsignar, onClose }) {
  const [asignando, setAsignando] = useState(null)

  const recomendadaId = useMemo(() => {
    if (!profesionales.length) return null
    return [...profesionales].sort(
      (a, b) => (cargaPorProfesional[a.id] ?? 0) - (cargaPorProfesional[b.id] ?? 0),
    )[0].id
  }, [profesionales, cargaPorProfesional])

  const handleAsignar = async (profesional) => {
    setAsignando(profesional.id)
    try {
      await onAsignar(turno, profesional)
    } finally {
      setAsignando(null)
    }
  }

  return (
    <Modal open={!!turno} onClose={onClose} title="Asignar profesional">
      {turno && (
        <>
          <div className="mb-5 rounded-xl bg-bg p-3 text-sm">
            <p className="font-medium text-dark">
              {turno.paciente?.nombre} {turno.paciente?.apellido} · {turno.hora?.slice(0, 5)}hs
            </p>
            <p className="text-dark/60">{turno.motivo || 'Sin motivo especificado'}</p>
          </div>

          <div className="space-y-3">
            {profesionales.map((p) => {
              const carga = cargaPorProfesional[p.id] ?? 0
              const pct = Math.min(100, Math.round((carga / MAX_REFERENCIAL) * 100))
              const esRecomendada = p.id === recomendadaId

              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-3 ${esRecomendada ? 'border-teal bg-teal-light/50' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-dark">
                          {p.nombre} {p.apellido}
                        </p>
                        {esRecomendada && (
                          <span className="shrink-0 rounded-full bg-teal px-2 py-0.5 text-[11px] font-semibold text-cream">
                            Recomendada
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-teal transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-dark/50">{carga} turno{carga === 1 ? '' : 's'} hoy</p>
                    </div>
                    <Button
                      size="sm"
                      variant={esRecomendada ? 'primary' : 'secondary'}
                      onClick={() => handleAsignar(p)}
                      disabled={asignando === p.id}
                    >
                      {asignando === p.id ? 'Asignando...' : 'Asignar'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Modal>
  )
}
