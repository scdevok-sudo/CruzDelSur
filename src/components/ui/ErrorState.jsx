import { AlertCircle, RotateCw } from 'lucide-react'

const MENSAJE_GENERICO =
  'Hubo un problema cargando los datos. Intentá de nuevo o escribinos al consultorio.'

// Error visible para el paciente/usuario: nunca mostramos el detalle crudo de Supabase.
export default function ErrorState({ mensaje = MENSAJE_GENERICO, onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-cancel/30 bg-cancel/10 p-4 text-sm text-cancel ${className}`}
    >
      <AlertCircle size={18} className="shrink-0" />
      <span className="flex-1 min-w-40">{mensaje}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-cancel/40 px-3 text-sm font-semibold transition-colors hover:bg-cancel/10"
        >
          <RotateCw size={14} />
          Reintentar
        </button>
      )}
    </div>
  )
}
