export default function KPICard({ label, value, icon: Icon, accent = 'teal' }) {
  const accents = {
    teal: 'bg-teal-light text-teal-dark',
    pending: 'bg-pending/10 text-pending',
    cancel: 'bg-cancel/10 text-cancel',
    sand: 'bg-sand/20 text-dark',
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-dark/60">{label}</p>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accents[accent]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-dark">{value}</p>
    </div>
  )
}
