import { useState, useMemo } from 'react'
import {
  TrendingUp, CalendarClock, Zap, CheckCircle2, ShieldAlert,
  DollarSign, Sparkles, ArrowRight, Info,
} from 'lucide-react'
import MetricCard from '../ui/MetricCard'
import RiskBadge from '../ui/RiskBadge'
import { runAvalancheOptimizer } from '../../lib/optimizerLogic'
import { formatCurrency, daysUntil } from '../../lib/formatters'

const MAX_BUDGET = 5000

// ─── Budget Input + Slider ────────────────────────────────────────────────────
function BudgetInput({ budget, setBudget, onRun, totalMinimums }) {
  const pct = Math.min((budget / MAX_BUDGET) * 100, 100)
  const minPct = Math.min((totalMinimums / MAX_BUDGET) * 100, 100)

  return (
    <div className="bg-surface rounded-2xl border border-line shadow-sm p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        {/* Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-muted mb-2.5">
            I can pay up to this cycle
          </label>
          <div className="flex items-center gap-2 border border-line rounded-xl px-4 py-3 focus-within:border-primary transition-colors bg-page">
            <DollarSign className="w-5 h-5 text-muted shrink-0" />
            <input
              type="number"
              value={budget}
              min={0}
              max={MAX_BUDGET}
              step={10}
              onChange={(e) =>
                setBudget(Math.max(0, Math.min(MAX_BUDGET, Number(e.target.value))))
              }
              className="flex-1 text-xl font-bold text-ink outline-none bg-transparent tabular-nums min-w-0"
            />
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={onRun}
          className="flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors cursor-pointer shrink-0 sm:mb-0"
        >
          <Zap className="w-4 h-4" />
          Run optimizer
        </button>
      </div>

      {/* Slider */}
      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={MAX_BUDGET}
          step={10}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="sp-slider w-full cursor-pointer"
          style={{
            '--pct': `${pct}%`,
          }}
        />
        {/* Labels */}
        <div className="relative flex justify-between mt-2 text-xs text-muted select-none">
          <span>$0</span>
          <span
            className="absolute font-medium text-ink"
            style={{
              left: `${minPct}%`,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            Total minimums: {formatCurrency(totalMinimums)}
          </span>
          <span>{formatCurrency(MAX_BUDGET)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Metric Cards ─────────────────────────────────────────────────────
function SummaryMetrics({ result }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      <MetricCard
        label="Budget"
        value={formatCurrency(result.budget)}
        icon={DollarSign}
        iconColor="#2563EB"
      />
      <MetricCard
        label="Minimums covered"
        value={result.canCoverMinimums ? 'Yes' : 'No'}
        icon={result.canCoverMinimums ? CheckCircle2 : ShieldAlert}
        iconColor={result.canCoverMinimums ? '#10B981' : '#EF4444'}
      />
      <MetricCard
        label="Extra to highest APR"
        value={formatCurrency(result.extraToHighestApr)}
        subtitle={
          result.monthlySavings > 0
            ? `≈ ${formatCurrency(result.monthlySavings)}/mo interest saved`
            : undefined
        }
        icon={TrendingUp}
        iconColor="#F59E0B"
      />
      <MetricCard
        label="Remaining"
        value={formatCurrency(result.remaining)}
        subtitle="Unallocated buffer"
        icon={Info}
        iconColor="#64748B"
      />
    </div>
  )
}

// ─── Payment Plan Card ────────────────────────────────────────────────────────
function PaymentPlanCard({ item, rank }) {
  const days = daysUntil(item.dueDate)
  const risk = item.apr >= 25 ? 'high' : item.apr >= 15 ? 'medium' : 'low'
  const dueLabel = new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Rank */}
          <div className="w-7 h-7 rounded-full bg-page border border-line flex items-center justify-center text-xs font-bold text-muted shrink-0 mt-0.5">
            {rank}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">
              {item.bankName} · {item.cardName}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {item.apr.toFixed(2)}% APR
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                {dueLabel} · {days}d
              </span>
              <span>Balance {formatCurrency(item.balance)}</span>
            </div>
          </div>
        </div>
        <RiskBadge level={risk} className="shrink-0 mt-0.5" />
      </div>

      {/* Reason */}
      <p className="text-sm text-muted ml-10 mb-4 leading-relaxed">{item.reason}</p>

      {/* Payment breakdown */}
      <div className="ml-10 grid grid-cols-3 gap-4 pt-4 border-t border-line">
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Minimum
          </div>
          <div className="text-sm font-bold text-ink tabular-nums">
            {formatCurrency(item.minimum)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Extra
          </div>
          <div
            className={`text-sm font-bold tabular-nums ${
              item.extra > 0 ? 'text-success' : 'text-muted'
            }`}
          >
            {item.extra > 0 ? '+' : ''}{formatCurrency(item.extra)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Pay now
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-primary tabular-nums">
            {formatCurrency(item.payNow)}
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Explanation Panel ─────────────────────────────────────────────────────
function AiExplanationPanel({ result }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Explanation card */}
      <div className="rounded-2xl border border-purple/20 bg-purple/5 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">AI explanation</div>
            <div className="text-xs text-muted">Plain-English summary of your payment plan</div>
          </div>
        </div>

        <p className="text-sm text-ink leading-relaxed mb-4">{result.aiExplanation}</p>

        <p className="text-xs text-muted italic border-t border-purple/10 pt-3">
          AI explains the backend-generated plan. It does not change payment amounts and this
          is not financial advice.
        </p>
      </div>

      {/* Strategy card */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <div className="text-sm font-semibold text-ink mb-2">Strategy</div>
        <p className="text-sm text-muted mb-3 leading-relaxed">
          Avalanche method: cover every minimum first, then apply remaining dollars to the
          highest-APR balance.
        </p>
        <ul className="flex flex-col gap-2">
          {[
            'Minimums are paid first to protect credit.',
            'Remaining dollars target the highest APR (avalanche).',
            '0% promo balances are deprioritized while still active.',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2 text-xs text-muted">
              <span className="text-success font-bold shrink-0 mt-0.5">·</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Optimizer Page ───────────────────────────────────────────────────────────
export default function OptimizerPage() {
  const [budget, setBudget] = useState(900)
  const [hasRun, setHasRun] = useState(true)

  // Recalculates live as slider/input changes — deterministic, no API call needed
  const result = useMemo(() => runAvalancheOptimizer(budget), [budget])

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
          Payment optimizer
        </h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          Enter the maximum amount you can pay this cycle. We cover minimums first, then
          prioritize high-interest cards.
        </p>
      </div>

      {/* Budget Input */}
      <BudgetInput
        budget={budget}
        setBudget={setBudget}
        onRun={() => setHasRun(true)}
        totalMinimums={result.totalMinimums}
      />

      {/* Summary metrics */}
      {hasRun && <SummaryMetrics result={result} />}

      {/* Payment plan + AI panel */}
      {hasRun && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Payment plan */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Plan header */}
            <div>
              <span className="text-[11px] font-bold tracking-widest text-muted uppercase">
                Recommended payment plan
              </span>
              <p className="text-xs text-muted mt-1">
                Avalanche method: cover every minimum first, then apply remaining dollars to
                the highest-APR balance.
              </p>
            </div>
            {result.plan.map((item, i) => (
              <PaymentPlanCard key={item.id} item={item} rank={i + 1} />
            ))}
          </div>

          {/* Right: AI panel — sticky on desktop */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <AiExplanationPanel result={result} />
          </div>
        </div>
      )}
    </div>
  )
}
