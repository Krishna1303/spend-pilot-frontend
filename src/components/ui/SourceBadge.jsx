const config = {
  plaid:  { label: 'Plaid',   classes: 'bg-primary/10 text-primary' },
  pdf:    { label: 'PDF',     classes: 'bg-purple/10 text-purple' },
  manual: { label: 'Manual',  classes: 'bg-muted/10 text-muted' },
}

export default function SourceBadge({ source = 'manual', className = '' }) {
  const { label, classes } = config[source] ?? config.manual
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes} ${className}`}>
      {label}
    </span>
  )
}
