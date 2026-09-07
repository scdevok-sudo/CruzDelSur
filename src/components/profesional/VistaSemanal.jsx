const ESTADO_COLOR = {
  pendiente: 'bg-pending/15 border-pending text-[#8a6200]',
  confirmado: 'bg-confirm/15 border-confirm text-[#1f7a52]',
  cancelado: 'bg-cancel/15 border-cancel text-[#b23a3a]',
  reprogramado: 'bg-dark/10 border-dark/30 text-dark/60',
}

function formatFecha(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function VistaSemanal({ turnos, weekStart }) {
  const dias = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const turnosPorDia = (dia) => {
    const fechaStr = formatFecha(dia)
    return turnos
      .filter((t) => t.fecha === fechaStr)
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      {dias.map((dia) => (
        <div key={dia.toISOString()} className="rounded-xl border border-border bg-bg/40 p-2">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-dark/60">
            {dia.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })}
          </p>
          <div className="space-y-1.5">
            {turnosPorDia(dia).length === 0 && (
              <p className="py-4 text-center text-xs text-dark/30">Sin turnos</p>
            )}
            {turnosPorDia(dia).map((t) => (
              <div
                key={t.id}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${ESTADO_COLOR[t.estado] ?? ESTADO_COLOR.pendiente}`}
              >
                <p className="font-semibold">{t.hora?.slice(0, 5)}</p>
                <p className="truncate">
                  {t.paciente?.nombre} {t.paciente?.apellido}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
