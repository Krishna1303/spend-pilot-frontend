import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  CreditCard, Wallet, CalendarClock, ShieldAlert,
  AlertTriangle, ArrowUpRight, Building2, Upload, Zap,
  ExternalLink,
} from 'lucide-react'

import MetricCard from '../ui/MetricCard'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchDashboardData } from '../../api/dashboard'
import { formatCurrency, formatDate, daysUntil } from '../../lib/formatters'

// ─── High APR Alert ───────────────────────────────────────────────────────────
function HighAprAlert({ card }) {
  const navigate = useNavigate()
  if (!card) return null
  const days = daysUntil(card.dueDate)
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-danger/20 bg-danger/5 px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 rounded-lg bg-warning/10 shrink-0">
          <AlertTriangle className="w-4 h-4 text-warning" />
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-ink text-sm">High APR alert</span>
          <span className="text-muted text-sm ml-2">
            {card.bankName} is due in {days} days at {card.apr}% APR.
          </span>
        </div>
      </div>
      <button
        onClick={() => navigate('/optimizer')}
        className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shrink-0 cursor-pointer"
      >
        Run optimizer
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Spending vs Earning Chart ────────────────────────────────────────────────
function SpendingVsEarningChart({ data, loading }) {
  if (loading) return <SkeletonBlock className="h-64" />
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-ink">Spending vs earning</h3>
        <p className="text-xs text-muted">Last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="earningGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
            formatter={(value, name) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <Area type="monotone" dataKey="earning" stroke="#10B981" strokeWidth={2} fill="url(#earningGrad)" dot={false} />
          <Area type="monotone" dataKey="spending" stroke="#2563EB" strokeWidth={2} fill="url(#spendingGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Spending by Category Chart ───────────────────────────────────────────────
const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.07) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function SpendingByCategoryChart({ data, loading }) {
  if (loading) return <SkeletonBlock className="h-64" />
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-ink">Spending by category</h3>
        <p className="text-xs text-muted">This month</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={<CustomLabel />}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
            formatter={(value) => [formatCurrency(value)]}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-[10px] text-muted truncate">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Upcoming Due Dates ───────────────────────────────────────────────────────
function UpcomingDueDates({ dueDates = [], loading }) {
  if (loading) return <SkeletonBlock className="h-64" />
  const sorted = [...dueDates].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Upcoming due dates</h3>
        <button className="text-xs text-primary font-medium hover:underline cursor-pointer">View all</button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">No upcoming due dates.</p>
      ) : (
      <div className="flex flex-col gap-3">
        {sorted.map((card) => {
          const days = daysUntil(card.dueDate)
          const urgent = days <= 7
          return (
            <div key={card.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">{card.bankName}</div>
                <div className="text-xs text-muted">{card.cardName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-ink tabular-nums">
                  {formatDate(card.dueDate).replace(', 2026', '')}
                </div>
                <div className={`text-xs font-medium ${urgent ? 'text-danger' : 'text-muted'}`}>
                  in {days}d
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}

// ─── Recent Transactions ──────────────────────────────────────────────────────
function RecentTransactions({ transactions, loading }) {
  if (loading) return <SkeletonBlock className="h-64" />
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line">
      <h3 className="text-sm font-semibold text-ink mb-4">Recent transactions</h3>
      <div className="flex flex-col gap-3">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0
          return (
            <div key={tx.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">{tx.merchant}</div>
                <div className="text-xs text-muted">{tx.category} · {formatDate(tx.date).replace(', 2026', '')}</div>
              </div>
              <span className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? 'text-success' : 'text-ink'}`}>
                {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Connected Accounts ───────────────────────────────────────────────────────
function ConnectedAccounts({ accounts, loading }) {
  const navigate = useNavigate()
  if (loading) return <SkeletonBlock className="h-64" />
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-line flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink">Connected accounts</h3>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <ExternalLink className="w-2.5 h-2.5" /> Plaid
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {accounts.map((acc) => (
          <div key={acc.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-page flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-muted" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {acc.bankName} {acc.accountName}
                </div>
                <div className="text-xs text-muted capitalize">
                  {acc.type} —{acc.accountNumber}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-sm font-bold text-ink tabular-nums">{formatCurrency(acc.balance)}</div>
              <div className="text-[10px] text-primary font-medium uppercase tracking-wider">Plaid</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-line">
        <button
          onClick={() => navigate('/upload')}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink border border-line rounded-xl py-2.5 hover:bg-page transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" /> Upload statement
        </button>
        <button
          onClick={() => navigate('/optimizer')}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-primary rounded-xl py-2.5 hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" /> Optimize
        </button>
      </div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [spendingData, setSpendingData] = useState([])
  const [categories, setCategories] = useState([])
  const [dueDates, setDueDates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchDashboardData()
      .then((d) => {
        if (!active) return
        setMetrics(d.metrics)
        setTransactions(d.transactions)
        setAccounts(d.accounts)
        setSpendingData(d.spendingData)
        setCategories(d.categories)
        setDueDates(d.upcomingDueDates)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const metricCards = metrics
    ? [
        {
          label: 'Total credit balance',
          value: formatCurrency(metrics.totalCreditBalance),
          subtitle: 'Across 4 cards',
          icon: CreditCard,
          iconColor: '#2563EB',
        },
        {
          label: 'Available to pay',
          value: formatCurrency(metrics.availableToPay),
          subtitle: 'Checking + savings',
          icon: Wallet,
          iconColor: '#2563EB',
        },
        {
          label: 'Cards due soon',
          value: String(metrics.cardsDueSoon),
          subtitle: 'Within the next 7 days',
          icon: CalendarClock,
          iconColor: '#F59E0B',
        },
        {
          label: 'Interest risk score',
          value: `${metrics.interestRiskScore}/100`,
          subtitle: 'Weighted by APR × balance',
          icon: ShieldAlert,
          iconColor: '#EF4444',
        },
      ]
    : []

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
          Know which credit card to pay first.
        </h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          SpendPilot combines statements, bank data, APR, and due dates to recommend your next best payment action.
        </p>
      </div>

      {/* High APR Alert */}
      {!loading && metrics?.highAprAlert && (
        <div className="mb-5">
          <HighAprAlert card={metrics.highAprAlert} />
        </div>
      )}
      {loading && <SkeletonBlock className="h-14 mb-5" />}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-32" />)
          : metricCards.map((card) => <MetricCard key={card.label} {...card} />)
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <SpendingVsEarningChart data={spendingData} loading={loading} />
        </div>
        <SpendingByCategoryChart data={categories} loading={loading} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UpcomingDueDates dueDates={dueDates} loading={loading} />
        <RecentTransactions transactions={transactions} loading={loading} />
        <ConnectedAccounts accounts={accounts} loading={loading} />
      </div>
    </div>
  )
}
