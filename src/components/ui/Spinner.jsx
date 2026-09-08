// Estado de carga estándar de la app.
export default function Spinner({ label, className = 'py-12' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      {label && <p className="text-sm text-dark/50">{label}</p>}
    </div>
  )
}
