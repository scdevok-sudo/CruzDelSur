import Badge from '../ui/Badge'

export default function AgendaHoy({ turnos, loading }) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-dark/50">Cargando agenda...</p>
  }

  if (!turnos.length) {
    return <p className="py-10 text-center text-sm text-dark/50">No tenés turnos para hoy.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-dark/50">
            <th className="py-2.5 pr-3 font-medium">Hora</th>
            <th className="py-2.5 pr-3 font-medium">Paciente</th>
            <th className="py-2.5 pr-3 font-medium">Motivo</th>
            <th className="py-2.5 pr-3 font-medium">Obra social</th>
            <th className="py-2.5 pr-3 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {turnos.map((t) => (
            <tr key={t.id} className="hover:bg-bg/60">
              <td className="py-3 pr-3 font-medium text-dark">{t.hora?.slice(0, 5)}</td>
              <td className="py-3 pr-3 text-dark">
                {t.paciente?.nombre} {t.paciente?.apellido}
              </td>
              <td className="py-3 pr-3 text-dark/70">{t.motivo || '—'}</td>
              <td className="py-3 pr-3 text-dark/70">{t.paciente?.obra_social || '—'}</td>
              <td className="py-3 pr-3">
                <Badge estado={t.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
