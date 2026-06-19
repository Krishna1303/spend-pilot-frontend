const config = {
  high:   { label: 'High risk', classes: 'bg-danger/10 text-danger',   dot: '#EF4444' },
  medium: { label: 'Medium',    classes: 'bg-warning/10 text-warning',  dot: '#F59E0B' },
  low:    { label: 'Low',       classes: 'bg-success/10 text-success',  dot: '#10B981' },
}

export default function RiskBadge({ level = 'medium', className = '' }) {
  const { label, classes, dot } = config[level] ?? config.medium
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      {label}
    </span>
  )
}
