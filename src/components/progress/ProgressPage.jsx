import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  TrendingDown, CreditCard, Percent, Trophy, CircleCheck, Circle, AlertTriangle,
} from 'lucide-react'
import MetricCard from '../ui/MetricCard'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchProgress } from '../../api/insights'
import { formatCurrency } from '../../lib/formatters'

const num = (v) => (v == null ? 0 : Number(v))

export default function ProgressPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchProgress()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message || 'Could not load progress.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const history = (data?.history ?? []).map((h) => ({
    date: h.date ? String(h.date).slice(5, 10) : '',
    balance: num(h.totalBalance),
    utilization: num(h.utilization),
  }))
  const milestones = data?.milestones ?? []
  const debtChange = data?.debtChange
  const interestSaved = data?.interestSaved

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Progress</h1>
        <p className="text-sm text-muted mt-1.5">Track your debt coming down over time.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-28" />)}</div>
          <SkeletonBlock className="h-72" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <MetricCard
              label="Current debt"
              value={formatCurrency(num(data.currentDebt))}
              subtitle={debtChange != null ? `${num(debtChange) <= 0 ? '▼' : '▲'} ${formatCurrency(Math.abs(num(debtChange)))} change` : undefined}
              icon={CreditCard} iconColor="#2563EB"
            />
            <MetricCard
              label="Overall utilization"
              value={data.overallUtilization != null ? `${Math.round(num(data.overallUtilization))}%` : '—'}
              subtitle={data.totalCreditLimit != null ? `of ${formatCurrency(num(data.totalCreditLimit))} limit` : undefined}
              icon={Percent} iconColor="#F59E0B"
            />
            <MetricCard
              label="Interest saved"
              value={interestSaved?.projectedVsMinimums != null ? formatCurrency(num(interestSaved.projectedVsMinimums)) : '—'}
              subtitle="projected vs minimums"
              icon={TrendingDown} iconColor="#10B981"
            />
          </div>

          {/* Debt-down chart */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line mb-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-ink">Total balance over time</h3>
              <p className="text-xs text-muted">Snapshot recorded each time you visit</p>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted py-12 text-center">Not enough history yet — check back over time.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={history} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => [formatCurrency(v), 'Balance']} />
                  <Area type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={2} fill="url(#balGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Milestones */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold text-ink">Milestones</h3>
            </div>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted">No milestones yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {milestones.map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {m.achieved ? (
                      <CircleCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-line shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={`text-sm font-medium ${m.achieved ? 'text-ink' : 'text-muted'}`}>{m.title}</div>
                      {m.detail && <div className="text-xs text-muted mt-0.5">{m.detail}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
