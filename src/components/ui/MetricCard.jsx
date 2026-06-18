import SkeletonBlock from './SkeletonBlock'

export default function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#2563EB',
  loading = false,
}) {
  if (loading) return <SkeletonBlock className="h-32" />

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: iconColor + '1a' }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-ink tabular-nums leading-tight">{value}</div>
        {subtitle && (
          <div className="text-xs text-muted mt-0.5">{subtitle}</div>
        )}
      </div>
    </div>
  )
}
