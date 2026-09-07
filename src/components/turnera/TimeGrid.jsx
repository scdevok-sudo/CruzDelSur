const MANANA_LIMITE = '12:00'

export default function TimeGrid({ slots, selected, onSelect, loading }) {
  if (loading) {
    return <p className="py-8 text-center text-sm text-dark/50">Buscando horarios disponibles...</p>
  }

  if (!slots.length) {
    return (
      <p className="py-8 text-center text-sm text-dark/50">
        No hay horarios disponibles para esta fecha. Probá con otro día.
      </p>
    )
  }

  const manana = slots.filter((s) => s < MANANA_LIMITE)
  const tarde = slots.filter((s) => s >= MANANA_LIMITE)

  const Grupo = ({ titulo, items }) =>
    items.length ? (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/50">{titulo}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((slot) => (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                selected === slot
                  ? 'border-teal bg-teal text-cream'
                  : 'border-border bg-white text-dark hover:border-teal/50 hover:bg-teal-light'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    ) : null

  return (
    <div className="space-y-5">
      <Grupo titulo="Mañana" items={manana} />
      <Grupo titulo="Tarde" items={tarde} />
    </div>
  )
}
