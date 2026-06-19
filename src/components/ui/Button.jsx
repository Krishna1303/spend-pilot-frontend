const VARIANTS = {
  primary:   'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)]',
  secondary: 'bg-surface text-primary border border-line hover:border-primary hover:bg-blue-50',
  danger:    'bg-danger text-white hover:bg-red-600',
  ghost:     'bg-transparent text-primary hover:bg-blue-50',
}

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  sm: 'px-3.5 py-1.5 text-xs',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const spinnerCls =
    variant === 'primary' || variant === 'danger'
      ? 'w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0'
      : 'w-4 h-4 rounded-full border-2 border-primary/25 border-t-primary animate-spin shrink-0'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 select-none',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <span className={spinnerCls} aria-hidden="true" />}
      {loading ? 'Loading…' : children}
    </button>
  )
}
