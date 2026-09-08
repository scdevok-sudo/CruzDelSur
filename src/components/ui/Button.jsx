const variants = {
  primary:
    'bg-teal text-cream hover:bg-teal-dark disabled:bg-teal/40 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-teal border border-teal/40 hover:bg-teal-light disabled:opacity-40 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-dark hover:bg-black/5 disabled:opacity-40',
  danger: 'bg-cancel text-cream hover:opacity-90 disabled:opacity-40',
}

const sizes = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
