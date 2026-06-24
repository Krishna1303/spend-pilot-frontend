import { useState } from 'react'
import {
  CalendarClock, Zap, AlertTriangle, Info, CheckCircle2,
  CalendarDays, TrendingDown, ShieldCheck, Sparkles,
} from 'lucide-react'
import MetricCard from '../ui/MetricCard'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchRescuePlan } from '../../api/optimizer'
import { formatCurrency, formatDate } from '../../lib/formatters'

const num = (v) => (v == null ? 0 : Number(v))

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
    {children}
    {required && <span className="text-danger"> *</span>}
  </label>
)

function MoneyInput({ value, onChange, placeholder, invalid }) {
  return (
    <div
      className={`flex items-center border ${invalid ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`}
    >
      <span className="text-muted mr-1 text-sm">$</span>
      <input
        type="number" step="0.01" min="0" placeholder={placeholder}
        value={value} onChange={onChange}
        className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
      />
    </div>
  )
}

// Groups dated actions into "today" vs "on payday".
function ActionRow({ action }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border border-line rounded-xl bg-page">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink truncate">{action.cardName || 'Card'}</div>
        <div className="text-xs text-muted mt-0.5">
          {action.type ? `${action.type} · ` : ''}
          {action.date ? formatDate(String(action.date).slice(0, 10)) : ''}
        </div>
        {action.reason && <div className="text-xs text-muted mt-1 leading-relaxed">{action.reason}</div>}
      </div>
      <div className="text-sm font-bold text-primary tabular-nums shrink-0">
        {formatCurrency(num(action.amount))}
      </div>
    </div>
  )
}

export default function RescuePage() {
  const [form, setForm] = useState({
    paycheckDate: '', paycheckAmount: '', currentCash: '', cashBuffer: '', lateFeePerCard: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setFieldErrors((fe) => (fe[key] ? { ...fe, [key]: false } : fe))
    setError('')
  }

  function validate() {
    const e = {}
    if (!form.paycheckDate) e.paycheckDate = true
    if (form.paycheckAmount === '' || isNaN(Number(form.paycheckAmount))) e.paycheckAmount = true
    return e
  }

  async function handleRun() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      setError('Enter your paycheck date and amount to build a plan.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        paycheckDate: form.paycheckDate,
        paycheckAmount: Number(form.paycheckAmount),
      }
      if (form.currentCash !== '') body.currentCash = Number(form.currentCash)
      if (form.cashBuffer !== '') body.cashBuffer = Number(form.cashBuffer)
      if (form.lateFeePerCard !== '') body.lateFeePerCard = Number(form.lateFeePerCard)
      const res = await fetchRescuePlan(body)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Could not build a rescue plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const actions = result?.actions ?? []
  const today = actions.filter((a) => a.when === 'today')
  const payday = actions.filter((a) => a.when !== 'today')
  const summary = result?.summary ?? {}

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Payday rescue planner</h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          Tell us about your next paycheck and we’ll build a dated plan that avoids late fees and
          pays down debt fastest. Calculated by the backend.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-line shadow-sm p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <FieldLabel required>Paycheck date</FieldLabel>
            <input
              type="date" value={form.paycheckDate} onChange={set('paycheckDate')}
              className={`w-full border ${fieldErrors.paycheckDate ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page`}
            />
          </div>
          <div>
            <FieldLabel required>Paycheck amount</FieldLabel>
            <MoneyInput value={form.paycheckAmount} onChange={set('paycheckAmount')} placeholder="0.00" invalid={fieldErrors.paycheckAmount} />
          </div>
          <div>
            <FieldLabel>Current cash</FieldLabel>
            <MoneyInput value={form.currentCash} onChange={set('currentCash')} placeholder="optional" />
          </div>
          <div>
            <FieldLabel>Cash buffer to keep</FieldLabel>
            <MoneyInput value={form.cashBuffer} onChange={set('cashBuffer')} placeholder="optional" />
          </div>
          <div>
            <FieldLabel>Late fee per card</FieldLabel>
            <MoneyInput value={form.lateFeePerCard} onChange={set('lateFeePerCard')} placeholder="optional" />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Building…</>
              ) : (
                <><Zap className="w-4 h-4" /> Build plan</>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-5 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="bg-surface border border-dashed border-line rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">Plan around your paycheck</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Enter your paycheck details above and press <span className="font-semibold text-ink">Build plan</span>.
          </p>
        </div>
      )}

      {loading && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}
          </div>
          <SkeletonBlock className="h-64" />
        </div>
      )}

      {result && (
        <>
          {Array.isArray(result.warnings) && result.warnings.length > 0 && (
            <div className="flex flex-col gap-2 mb-5">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{typeof w === 'string' ? w : w.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            <MetricCard
              label="Debt-free date"
              value={summary.debtFreeDate ? formatDate(String(summary.debtFreeDate).slice(0, 10)) : '—'}
              subtitle={summary.monthsToDebtFree != null ? `${summary.monthsToDebtFree} months` : undefined}
              icon={CalendarDays} iconColor="#2563EB"
            />
            <MetricCard
              label="Late fees avoided"
              value={summary.lateFeeAmountAvoided != null ? formatCurrency(num(summary.lateFeeAmountAvoided)) : String(summary.lateFeesAvoided ?? '—')}
              icon={ShieldCheck} iconColor="#10B981"
            />
            <MetricCard
              label="Interest saved"
              value={summary.interestSavedVsMinimums != null ? formatCurrency(num(summary.interestSavedVsMinimums)) : '—'}
              subtitle="vs minimums"
              icon={TrendingDown} iconColor="#F59E0B"
            />
            <MetricCard
              label="Months saved"
              value={summary.monthsSavedVsMinimums != null ? String(summary.monthsSavedVsMinimums) : '—'}
              subtitle="vs minimums"
              icon={CheckCircle2} iconColor="#7C3AED"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Actions */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {today.length > 0 && (
                <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-danger">Do today</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {today.map((a, i) => <ActionRow key={i} action={a} />)}
                  </div>
                </div>
              )}
              <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">On payday</span>
                </div>
                {payday.length === 0 ? (
                  <p className="text-sm text-muted">No payday actions in this plan.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {payday.map((a, i) => <ActionRow key={i} action={a} />)}
                  </div>
                )}
              </div>
            </div>

            {/* AI explanation */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-purple/20 bg-purple/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">AI explanation</div>
                    <div className="text-xs text-muted">
                      Plain-English summary{result.explanationSource ? ` · ${result.explanationSource}` : ''}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-ink leading-relaxed mb-4">
                  {result.explanation || 'No explanation was returned for this plan.'}
                </p>
                <p className="text-xs text-muted italic border-t border-purple/10 pt-3 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
                  Generated by the backend. This is not financial advice.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
