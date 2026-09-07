const PASOS = ['Especialidad', 'Profesional', 'Fecha', 'Horario', 'Datos', 'Confirmación']

export default function StepWizard({ step }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {PASOS.map((label, i) => {
        const n = i + 1
        const active = n === step
        const done = n < step
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  done
                    ? 'bg-teal text-cream'
                    : active
                      ? 'bg-teal text-cream ring-4 ring-teal-light'
                      : 'bg-white text-dark/40 border border-border'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  active ? 'text-teal-dark' : done ? 'text-dark/70' : 'text-dark/40'
                }`}
              >
                {label}
              </span>
            </div>
            {n < PASOS.length && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded transition-colors ${
                  done ? 'bg-teal' : 'bg-border'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
