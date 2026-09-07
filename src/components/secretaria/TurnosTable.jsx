import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function TurnosTable({ turnos, loading, onAsignar }) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-dark/50">Cargando turnos...</p>
  }

  if (!turnos.length) {
    return <p className="py-10 text-center text-sm text-dark/50">No hay turnos para este filtro.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-dark/50">
            <th className="py-2.5 pr-3 font-medium">Hora</th>
            <th className="py-2.5 pr-3 font-medium">Paciente</th>
            <th className="py-2.5 pr-3 font-medium">Profesional</th>
            <th className="py-2.5 pr-3 font-medium">Obra social</th>
            <th className="py-2.5 pr-3 font-medium">Estado</th>
            <th className="py-2.5 pr-3 font-medium text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {turnos.map((t) => (
            <tr key={t.id} className="hover:bg-bg/60">
              <td className="py-3 pr-3 font-medium text-dark">{t.hora?.slice(0, 5)}</td>
              <td className="py-3 pr-3">
                <p className="font-medium text-dark">
                  {t.paciente?.nombre} {t.paciente?.apellido}
                </p>
                <p className="text-xs text-dark/50">{t.paciente?.telefono}</p>
              </td>
              <td className="py-3 pr-3 text-dark/80">
                {t.profesional ? `${t.profesional.nombre} ${t.profesional.apellido}` : '—'}
              </td>
              <td className="py-3 pr-3 text-dark/80">{t.paciente?.obra_social || '—'}</td>
              <td className="py-3 pr-3">
                <Badge estado={t.estado} />
              </td>
              <td className="py-3 pr-3 text-right">
                {t.estado === 'pendiente' ? (
                  <Button size="sm" onClick={() => onAsignar(t)}>
                    Asignar
                  </Button>
                ) : (
                  <span className="text-dark/30">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
