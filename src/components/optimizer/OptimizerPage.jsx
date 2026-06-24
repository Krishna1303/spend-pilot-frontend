import { useState } from 'react'
import {
  TrendingUp, CalendarClock, Zap, DollarSign, Sparkles,
  ArrowRight, Info, ListChecks, Wallet, AlertTriangle,
} from 'lucide-react'
import MetricCard from '../ui/MetricCard'
import RiskBadge from '../ui/RiskBadge'
import SkeletonBlock from '../ui/SkeletonBlock'
import { formatCurrency, daysUntil } from '../../lib/formatters'
import { fetchOptimizerPlan } from '../../api/optimizer'

const MAX_BUDGET = 5000
const num = (v) => (v == null ? 0 : Number(v))

// ─── Budget Input + Slider ────────────────────────────────────────────────────
// Only sets the budget — it never computes a plan. The plan is produced solely
// by the backend when "Run optimizer" is pressed.
function BudgetInput({ budget, setBudget, onRun, totalMinimums, loading }) {
  const pct = Math.min((budget / MAX_BUDGET) * 100, 100)
  const minPct =
    totalMinimums != null ? Math.min((totalMinimums / MAX_BUDGET) * 100, 100) : null

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
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3.5 rounded-xl transition-colors cursor-pointer shrink-0 sm:mb-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Run optimizer
            </>
          )}
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
          style={{ '--pct': `${pct}%` }}
        />
        {/* Labels */}
        <div className="relative flex justify-between mt-2 text-xs text-muted select-none">
          <span>$0</span>
          {minPct != null && (
            <span
              className="absolute font-medium text-ink"
              style={{ left: `${minPct}%`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
            >
              Total minimums: {formatCurrency(totalMinimums)}
            </span>
          )}
          <span>{formatCurrency(MAX_BUDGET)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Summary Metric Cards (all values from the backend response) ───────────────
function SummaryMetrics({ result, ranBudget }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
      <MetricCard label="Budget" value={formatCurrency(ranBudget)} icon={DollarSign} iconColor="#2563EB" />
      <MetricCard
        label="Total minimums"
        value={formatCurrency(num(result.totalMinimum))}
        icon={ListChecks}
        iconColor="#F59E0B"
      />
      <MetricCard
        label="Remaining"
        value={formatCurrency(num(result.remaining))}
        subtitle="Unallocated buffer"
        icon={Wallet}
        iconColor="#64748B"
      />
      <MetricCard
        label="Strategy"
        value={result.strategy ? String(result.strategy) : '—'}
        icon={TrendingUp}
        iconColor="#10B981"
      />
    </div>
  )
}

// ─── Payment Plan Card (renders backend fields verbatim) ──────────────────────
function PaymentPlanCard({ item, rank }) {
  const apr = item.apr != null ? Number(item.apr) : null
  const risk = apr == null ? null : apr >= 25 ? 'high' : apr >= 15 ? 'medium' : 'low'
  const hasDue = !!item.dueDate
  const days = hasDue ? daysUntil(item.dueDate) : null
  const dueLabel = hasDue
    ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  const recommended = num(item.recommendedPayment ?? item.payNow ?? item.amount)
  const minimum = item.minimumPayment != null ? num(item.minimumPayment) : null
  // Prefer a backend-provided extra; otherwise it's the recommended above minimum.
  const extra =
    item.extra != null
      ? num(item.extra)
      : item.extraPayment != null
        ? num(item.extraPayment)
        : minimum != null
          ? Math.max(0, recommended - minimum)
          : null

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-page border border-line flex items-center justify-center text-xs font-bold text-muted shrink-0 mt-0.5">
            {rank}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink">
              {[item.bankName, item.cardName].filter(Boolean).join(' · ') || 'Card'}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-muted">
              {apr != null && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {apr.toFixed(2)}% APR
                </span>
              )}
              {hasDue && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {dueLabel} · {days}d
                </span>
              )}
              {item.balance != null && <span>Balance {formatCurrency(num(item.balance))}</span>}
            </div>
          </div>
        </div>
        {risk && <RiskBadge level={risk} className="shrink-0 mt-0.5" />}
      </div>

      {/* Reason */}
      {item.reason && (
        <p className="text-sm text-muted ml-10 mb-4 leading-relaxed">{item.reason}</p>
      )}

      {/* Payment breakdown — minimum + extra = recommended payment */}
      <div className="ml-10 grid grid-cols-3 gap-4 pt-4 border-t border-line">
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Minimum
          </div>
          <div className="text-sm font-bold text-ink tabular-nums">
            {minimum != null ? formatCurrency(minimum) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Extra
          </div>
          <div
            className={`text-sm font-bold tabular-nums ${
              extra > 0 ? 'text-success' : 'text-muted'
            }`}
          >
            {extra != null ? `${extra > 0 ? '+' : ''}${formatCurrency(extra)}` : '—'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-1">
            Recommended payment
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-primary tabular-nums">
            {formatCurrency(recommended)}
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Explanation Panel ─────────────────────────────────────────────────────
function AiExplanationPanel({ explanation, source, strategy }) {
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
            <div className="text-xs text-muted">
              Plain-English summary{source ? ` · ${source}` : ''}
            </div>
          </div>
        </div>

        <p className="text-sm text-ink leading-relaxed mb-4">
          {explanation || 'No explanation was returned for this plan.'}
        </p>

        <p className="text-xs text-muted italic border-t border-purple/10 pt-3">
          The plan and explanation are generated by the backend. This is not financial advice.
        </p>
      </div>

      {/* Strategy card */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <div className="text-sm font-semibold text-ink mb-2">Strategy</div>
        <p className="text-sm text-muted leading-relaxed">
          {strategy
            ? `The backend allocated your payment using the "${strategy}" strategy: minimums are protected first, then the remaining budget targets the costliest balances.`
            : 'The backend allocates your payment to minimize interest while protecting minimums.'}
        </p>
      </div>
    </div>
  )
}

// ─── Optimizer Page ───────────────────────────────────────────────────────────
export default function OptimizerPage() {
  const [budget, setBudget] = useState(900)
  const [result, setResult] = useState(null)   // raw /optimizer/recommend response
  const [ranBudget, setRanBudget] = useState(null) // budget the result corresponds to
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // The result is "stale" if the budget changed since the last run.
  const stale = result != null && budget !== ranBudget

  async function handleRun() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchOptimizerPlan({ maxPayment: budget, explain: true })
      setResult(res)
      setRanBudget(budget)
    } catch (err) {
      setError(err.message || 'Could not run the optimizer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const plan = result?.plan ?? []

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
          Payment optimizer
        </h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          Enter the maximum amount you can pay this cycle, then run the optimizer. The plan is
          calculated by the SpendPilot backend on your stored cards.
        </p>
      </div>

      {/* Budget Input */}
      <BudgetInput
        budget={budget}
        setBudget={setBudget}
        onRun={handleRun}
        totalMinimums={result ? num(result.totalMinimum) : null}
        loading={loading}
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-5 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state — nothing runs until the user clicks Run optimizer */}
      {!result && !loading && !error && (
        <div className="bg-surface border border-dashed border-line rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">Ready when you are</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Set your budget above and press <span className="font-semibold text-ink">Run optimizer</span> to
            get a recommended payment plan.
          </p>
        </div>
      )}

      {/* Loading skeleton for first run */}
      {loading && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-40" />)}
          </div>
          <SkeletonBlock className="h-64" />
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Stale notice when the budget was changed after a run */}
          {stale && (
            <div className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-5 text-sm text-warning">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Budget changed to {formatCurrency(budget)} — run the optimizer again to update the plan.
              </span>
            </div>
          )}

          {/* Backend warning, if any */}
          {result.warning && (
            <div className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-5 text-sm text-warning">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{result.warning}</span>
            </div>
          )}

          <SummaryMetrics result={result} ranBudget={ranBudget} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Payment plan */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-muted uppercase">
                  Recommended payment plan
                </span>
                <p className="text-xs text-muted mt-1">
                  Calculated by the backend for a budget of {formatCurrency(ranBudget)}.
                </p>
              </div>
              {plan.length === 0 ? (
                <div className="bg-surface border border-line rounded-2xl p-8 text-center text-sm text-muted">
                  The backend returned no payment plan for this budget.
                </div>
              ) : (
                plan.map((item, i) => (
                  <PaymentPlanCard key={item.cardId ?? item.id ?? i} item={item} rank={i + 1} />
                ))
              )}
            </div>

            {/* Right: AI panel — sticky on desktop */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <AiExplanationPanel
                explanation={result.explanation}
                source={result.explanationSource}
                strategy={result.strategy}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
