export default function Button({
  children,
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'sp-btn',
    `sp-btn--${variant}`,
    size ? `sp-btn--${size}` : '',
    fullWidth ? 'sp-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="sp-spinner" aria-hidden="true" />}
      {loading ? 'Loading…' : children}
    </button>
  );
}
