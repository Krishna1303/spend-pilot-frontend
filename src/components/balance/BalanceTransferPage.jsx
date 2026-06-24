import { useState } from 'react'
import { ArrowRightLeft, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchBalanceTransfer } from '../../api/optimizer'
import { formatCurrency } from '../../lib/formatters'

const num = (v) => (v == null ? 0 : Number(v))

// Humanize a camelCase key → "Total interest".
const humanize = (k) =>
  k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()
const isMoneyKey = (k) => /interest|cost|fee|balance|saving|amount|payment|principal/i.test(k)

function ValuePanel({ title, data, accent }) {
  const entries = Object.entries(data || {}).filter(([, v]) => typeof v === 'number')
  return (
    <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
      <div className={`text-sm font-semibold mb-3 ${accent || 'text-ink'}`}>{title}</div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No details returned.</p>
      ) : (
        <dl className="flex flex-col gap-2.5">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-muted">{humanize(k)}</dt>
              <dd className="font-semibold text-ink tabular-nums">
                {isMoneyKey(k) ? formatCurrency(v) : /apr|pct|percent|rate/i.test(k) ? `${v}%` : v}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
      {label}{hint && <span className="font-normal normal-case text-muted/70"> {hint}</span>}
    </label>
    {children}
  </div>
)

function Num({ value, onChange, placeholder, prefix, suffix }) {
  return (
    <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
      {prefix && <span className="text-muted mr-1 text-sm">{prefix}</span>}
      <input type="number" min="0" step="0.01" placeholder={placeholder} value={value} onChange={onChange}
        className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
      {suffix && <span className="text-muted ml-1 text-sm">{suffix}</span>}
    </div>
  )
}

export default function BalanceTransferPage() {
  const [form, setForm] = useState({
    amount: '', sourceApr: '', monthlyPayment: '',
    promoApr: '', promoMonths: '', transferFeePct: '', postPromoApr: '',
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
    if (form.amount === '' || isNaN(Number(form.amount))) e.amount = true
    if (form.monthlyPayment === '' || isNaN(Number(form.monthlyPayment))) e.monthlyPayment = true
    if (form.promoApr === '' || isNaN(Number(form.promoApr))) e.promoApr = true
    if (form.promoMonths === '' || isNaN(Number(form.promoMonths))) e.promoMonths = true
    if (form.transferFeePct === '' || isNaN(Number(form.transferFeePct))) e.transferFeePct = true
    return e
  }

  async function handleRun() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      setError('Fill in the balance, monthly payment, and the offer’s promo APR, months, and fee.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        amount: Number(form.amount),
        monthlyPayment: Number(form.monthlyPayment),
        offer: {
          promoApr: Number(form.promoApr),
          promoMonths: Number(form.promoMonths),
          transferFeePct: Number(form.transferFeePct),
        },
      }
      if (form.sourceApr !== '') body.sourceApr = Number(form.sourceApr)
      if (form.postPromoApr !== '') body.offer.postPromoApr = Number(form.postPromoApr)
      const res = await fetchBalanceTransfer(body)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Could not evaluate this transfer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const recommendTransfer = result?.recommendation === 'transfer'

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Balance-transfer evaluator</h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          See whether moving a balance to a promo-APR offer beats staying put. Evaluated by the backend.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-line shadow-sm p-5 mb-5">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Your balance</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <Field label="Balance to transfer">
            <div className={`flex items-center border ${fieldErrors.amount ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`}>
              <span className="text-muted mr-1 text-sm">$</span>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={set('amount')}
                className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
            </div>
          </Field>
          <Field label="Current APR" hint="(optional)"><Num value={form.sourceApr} onChange={set('sourceApr')} placeholder="0.00" suffix="%" /></Field>
          <Field label="Monthly payment">
            <div className={`flex items-center border ${fieldErrors.monthlyPayment ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`}>
              <span className="text-muted mr-1 text-sm">$</span>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.monthlyPayment} onChange={set('monthlyPayment')}
                className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
            </div>
          </Field>
        </div>

        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-3">The offer</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Field label="Promo APR">
            <div className={`flex items-center border ${fieldErrors.promoApr ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`}>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.promoApr} onChange={set('promoApr')}
                className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
              <span className="text-muted ml-1 text-sm">%</span>
            </div>
          </Field>
          <Field label="Promo months">
            <input type="number" min="0" step="1" placeholder="0" value={form.promoMonths} onChange={set('promoMonths')}
              className={`w-full border ${fieldErrors.promoMonths ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page tabular-nums placeholder:text-muted/50`} />
          </Field>
          <Field label="Transfer fee">
            <div className={`flex items-center border ${fieldErrors.transferFeePct ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`}>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.transferFeePct} onChange={set('transferFeePct')}
                className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
              <span className="text-muted ml-1 text-sm">%</span>
            </div>
          </Field>
          <Field label="Post-promo APR" hint="(optional)"><Num value={form.postPromoApr} onChange={set('postPromoApr')} placeholder="0.00" suffix="%" /></Field>
        </div>

        <div className="flex justify-end mt-5">
          <button onClick={handleRun} disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Evaluating…</>) : (<><Zap className="w-4 h-4" /> Evaluate</>)}
          </button>
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
            <ArrowRightLeft className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">Stay or transfer?</h3>
          <p className="text-sm text-muted max-w-md mx-auto">Enter your balance and the offer terms, then press Evaluate.</p>
        </div>
      )}

      {loading && !result && <SkeletonBlock className="h-64" />}

      {result && (
        <>
          {/* Recommendation */}
          <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 mb-5 ${recommendTransfer ? 'border-success/30 bg-success/5' : 'border-line bg-page'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${recommendTransfer ? 'bg-success/15' : 'bg-primary/10'}`}>
              {recommendTransfer ? <CheckCircle2 className="w-5 h-5 text-success" /> : <ArrowRightLeft className="w-5 h-5 text-primary" />}
            </div>
            <div>
              <div className="text-sm font-bold text-ink">
                Recommendation: {result.recommendation === 'transfer' ? 'Transfer the balance' : result.recommendation === 'stay' ? 'Stay put' : '—'}
              </div>
              <div className="text-sm text-muted mt-0.5">
                {result.savings != null && <>Estimated savings {formatCurrency(num(result.savings))}. </>}
                {result.breakEvenMonths != null && <>Break-even in {result.breakEvenMonths} months.</>}
              </div>
            </div>
          </div>

          {Array.isArray(result.warnings) && result.warnings.length > 0 && (
            <div className="flex flex-col gap-2 mb-5">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{typeof w === 'string' ? w : w.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stay vs transfer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ValuePanel title="Stay on current card" data={result.stay} />
            <ValuePanel title="Transfer to offer" data={result.transfer} accent="text-primary" />
          </div>

          {/* Transfer mechanics */}
          {(result.transferFee != null || result.transferredBalance != null) && (
            <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {result.transferFee != null && (
                <div><span className="text-muted">Transfer fee: </span><span className="font-semibold text-ink tabular-nums">{formatCurrency(num(result.transferFee))}</span></div>
              )}
              {result.transferredBalance != null && (
                <div><span className="text-muted">Transferred balance: </span><span className="font-semibold text-ink tabular-nums">{formatCurrency(num(result.transferredBalance))}</span></div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
