export default function Avatar({
  nombre,
  apellido,
  fotoUrl,
  size = 32,
  fontSize,
  className = '',
}) {
  const iniciales = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  return (
    <span
      className={`relative inline-flex shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {fotoUrl && (
        <img
          src={fotoUrl}
          alt={`${nombre} ${apellido}`}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
      )}
      <span
        className="items-center justify-center rounded-full"
        style={{
          display: fotoUrl ? 'none' : 'flex',
          width: size,
          height: size,
          backgroundColor: 'var(--teal)',
          color: '#fff',
          fontWeight: 700,
          fontSize: fontSize ?? Math.max(10, Math.round(size * 0.4)),
        }}
      >
        {iniciales}
      </span>
    </span>
  )
}
