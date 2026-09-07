import { CheckCircle2 } from 'lucide-react'
import Avatar from '../ui/Avatar'

const DIAS_ABREV = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function resumenHorario(disponibilidad = []) {
  if (!disponibilidad.length) return null
  const dias = [...new Set(disponibilidad.map((d) => d.dia_semana))].sort()
  const diasTexto = dias.map((d) => DIAS_ABREV[d === 7 ? 0 : d]).join(', ')
  const { hora_inicio, hora_fin } = disponibilidad[0]
  return `${diasTexto} · ${hora_inicio.slice(0, 5)} a ${hora_fin.slice(0, 5)}`
}

export default function ProfCard({ profesional, turnosHoy = 0, selected, onSelect }) {
  const horario = resumenHorario(profesional.disponibilidad)

  return (
    <button
      onClick={() => onSelect(profesional)}
      className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
        selected
          ? 'border-teal bg-teal-light shadow-sm'
          : 'border-border bg-white hover:border-teal/50 hover:bg-teal-light/40'
      }`}
    >
      <Avatar
        nombre={profesional.nombre}
        apellido={profesional.apellido}
        fotoUrl={profesional.foto_url}
        size={56}
        fontSize={18}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-dark">
          {profesional.nombre} {profesional.apellido}
        </p>
        <p className="text-sm text-dark/60">{profesional.especialidad?.nombre ?? 'Odontología'}</p>
        {horario && <p className="mt-0.5 text-xs text-dark/50">{horario}</p>}
        {profesional.precio_consulta && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-dark">
              Consulta: ${profesional.precio_consulta.toLocaleString('es-AR')}
            </span>
            {!profesional.atiende_obra_social && (
              <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200
                               rounded-full px-2 py-0.5 font-semibold">
                Particular
              </span>
            )}
            {profesional.atiende_obra_social && (
              <span className="text-[10px] bg-teal-light text-teal
                               border border-teal-mid rounded-full px-2 py-0.5 font-semibold">
                Obra social
              </span>
            )}
          </div>
        )}
        <p className="mt-0.5 text-xs text-dark/50">{turnosHoy} turno{turnosHoy === 1 ? '' : 's'} hoy</p>
      </div>
      {selected && <CheckCircle2 className="shrink-0 text-teal" size={22} />}
    </button>
  )
}
