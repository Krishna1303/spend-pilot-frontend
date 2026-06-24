import { useState, useEffect } from 'react'
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchAlerts } from '../../api/insights'
import { formatDate } from '../../lib/formatters'

const SEVERITY = {
  critical: { label: 'Critical', Icon: AlertOctagon, box: 'border-danger/25 bg-danger/5', icon: 'text-danger', chip: 'bg-danger/10 text-danger' },
  warning: { label: 'Warning', Icon: AlertTriangle, box: 'border-warning/25 bg-warning/5', icon: 'text-warning', chip: 'bg-warning/10 text-warning' },
  info: { label: 'Info', Icon: Info, box: 'border-primary/20 bg-primary/5', icon: 'text-primary', chip: 'bg-primary/10 text-primary' },
}

function CountCard({ kind, value }) {
  const s = SEVERITY[kind]
  return (
    <div className={`flex items-center gap-3 rounded-2xl border ${s.box} px-4 py-3`}>
      <s.Icon className={`w-5 h-5 shrink-0 ${s.icon}`} />
      <div>
        <div className="text-xl font-bold text-ink tabular-nums leading-none">{value ?? 0}</div>
        <div className="text-xs text-muted mt-1">{s.label}</div>
      </div>
    </div>
  )
}

export default function AlertsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAlerts()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message || 'Could not load alerts.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const alerts = data?.alerts ?? []
  const counts = data?.counts ?? {}

  return (
    <div className="p-5 lg:p-7 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Alerts</h1>
        <p className="text-sm text-muted mt-1.5">Things that need your attention, by severity.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-16" />)}</div>
          {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <CountCard kind="critical" value={counts.critical} />
            <CountCard kind="warning" value={counts.warning} />
            <CountCard kind="info" value={counts.info} />
          </div>

          {alerts.length === 0 ? (
            <div className="bg-surface border border-line rounded-2xl py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-base font-semibold text-ink mb-1">You’re all caught up</h3>
              <p className="text-sm text-muted">No alerts right now.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {alerts.map((a, i) => {
                const s = SEVERITY[a.severity] || SEVERITY.info
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-2xl border ${s.box} px-5 py-4`}>
                    <s.Icon className={`w-5 h-5 shrink-0 mt-0.5 ${s.icon}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink">{a.title || a.type}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.chip}`}>{s.label}</span>
                      </div>
                      {a.message && <p className="text-sm text-muted mt-1 leading-relaxed">{a.message}</p>}
                      {(a.dueDate || a.daysUntil != null) && (
                        <div className="text-xs text-muted mt-1.5">
                          {a.dueDate && <>Due {formatDate(String(a.dueDate).slice(0, 10))}</>}
                          {a.daysUntil != null && <> · in {a.daysUntil}d</>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
