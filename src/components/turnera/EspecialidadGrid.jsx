import { CheckCircle2, Stethoscope } from 'lucide-react'

export default function EspecialidadGrid({ especialidades, selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {especialidades.map((esp) => {
        const isSelected = selected?.id === esp.id
        return (
          <button
            key={esp.id}
            onClick={() => onSelect(esp)}
            className={`relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
              isSelected ? 'shadow-sm' : 'border-border bg-white hover:bg-bg'
            }`}
            style={
              isSelected
                ? { borderColor: esp.color, backgroundColor: `${esp.color}14` }
                : undefined
            }
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-cream"
              style={{ backgroundColor: esp.color }}
            >
              <Stethoscope size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-dark">{esp.nombre}</p>
              <p className="mt-0.5 text-xs text-dark/50">Turnos de {esp.duracion_turno} min</p>
            </div>
            {isSelected && (
              <CheckCircle2 className="shrink-0" size={22} style={{ color: esp.color }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
