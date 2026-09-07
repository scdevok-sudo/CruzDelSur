const ESTADOS = {
  pendiente: { label: 'Pendiente', bg: '#f0a50022', fg: '#b57a00', dot: '#f0a500' },
  confirmado: { label: 'Confirmado', bg: '#2e9e6b22', fg: '#1f7a52', dot: '#2e9e6b' },
  cancelado: { label: 'Cancelado', bg: '#d94f4f22', fg: '#b23a3a', dot: '#d94f4f' },
  reprogramado: { label: 'Reprogramado', bg: '#35382f1a', fg: '#5c6055', dot: '#8a8d82' },
}

export default function Badge({ estado, children, className = '' }) {
  if (estado && ESTADOS[estado]) {
    const s = ESTADOS[estado]
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
        style={{ backgroundColor: s.bg, color: s.fg }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
        {s.label}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full bg-teal-light px-2.5 py-1 text-xs font-medium text-teal-dark ${className}`}
    >
      {children}
    </span>
  )
}
