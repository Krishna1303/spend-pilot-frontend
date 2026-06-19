import { Link2, FileText, Pencil } from 'lucide-react'

const config = {
  plaid:  { label: 'Plaid',  Icon: Link2,    classes: 'bg-success/10 text-success' },
  pdf:    { label: 'PDF',    Icon: FileText,  classes: 'bg-purple/10 text-purple' },
  manual: { label: 'Manual', Icon: Pencil,    classes: 'bg-muted/10 text-muted' },
}

export default function SourceBadge({ source = 'manual', className = '' }) {
  const { label, Icon, classes } = config[source] ?? config.manual
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${classes} ${className}`}>
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </span>
  )
}
