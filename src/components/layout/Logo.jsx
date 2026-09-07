export default function Logo({ size = 36, showText = true }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
        <circle cx="20" cy="20" r="18" fill="#4D8EA2" />
        <g stroke="#FFFCF5" strokeWidth="2.5" strokeLinecap="round">
          <line x1="20" y1="8" x2="20" y2="32" />
          <line x1="8" y1="20" x2="32" y2="20" />
          <line x1="12" y1="12" x2="28" y2="28" />
          <line x1="28" y1="12" x2="12" y2="28" />
        </g>
        <circle cx="20" cy="20" r="4.5" fill="#FFFCF5" />
      </svg>
      {showText && (
        <div className="leading-tight">
          <p className="font-bold text-dark text-base">Cruz del Sur</p>
          <p className="text-xs text-dark/60 -mt-0.5">Consultorios Médicos</p>
        </div>
      )}
    </div>
  )
}
