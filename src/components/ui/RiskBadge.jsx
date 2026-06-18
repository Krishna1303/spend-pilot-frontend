const config = {
  high:   { label: 'High Risk',   classes: 'bg-danger/10 text-danger' },
  medium: { label: 'Medium Risk', classes: 'bg-warning/10 text-warning' },
  low:    { label: 'Low Risk',    classes: 'bg-success/10 text-success' },
}

export default function RiskBadge({ level = 'medium', className = '' }) {
  const { label, classes } = config[level] ?? config.medium
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes} ${className}`}>
      {label}
    </span>
  )
}
