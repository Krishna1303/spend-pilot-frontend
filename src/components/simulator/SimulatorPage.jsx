import { useState } from 'react'
import {
  FlaskConical, Plus, Trash2, Zap, AlertTriangle, Trophy,
} from 'lucide-react'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchSimulation } from '../../api/optimizer'
import { formatCurrency, formatDate } from '../../lib/formatters'

const num = (v) => (v == null ? 0 : Number(v))
const fmtDate = (d) => (d ? formatDate(String(d).slice(0, 10)) : '—')

let nextId = 1
const newScenario = (label) => ({ _id: nextId++, label, extraMonthly: '', lumpSum: '' })

export default function SimulatorPage() {
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [scenarios, setScenarios] = useState([
    newScenario('Extra $100/mo'),
    newScenario('$1,000 lump sum'),
  ])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setScenario = (id, key) => (e) =>
    setScenarios((s) => s.map((sc) => (sc._id === id ? { ...sc, [key]: e.target.value } : sc)))

  const addScenario = () => setScenarios((s) => [...s, newScenario(`Scenario ${s.length + 1}`)])
  const removeScenario = (id) => setScenarios((s) => s.filter((sc) => sc._id !== id))

  async function handleRun() {
    const payloadScenarios = scenarios
      .map((sc) => {
        const out = { label: sc.label || 'Scenario' }
        if (sc.extraMonthly !== '') out.extraMonthly = Number(sc.extraMonthly)
        if (sc.lumpSum !== '') out.lumpSum = Number(sc.lumpSum)
        return out
      })
      .filter((sc) => sc.extraMonthly != null || sc.lumpSum != null)

    if (payloadScenarios.length === 0) {
      setError('Add at least one scenario with an extra monthly amount or a lump sum.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = { scenarios: payloadScenarios }
      if (monthlyPayment !== '') body.monthlyPayment = Number(monthlyPayment)
      const res = await fetchSimulation(body)
      setResult(res)
    } catch (err) {
      setError(err.message || 'Could not run the simulation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const baseline = result?.baseline
  const rows = result?.scenarios ?? []
  const best = result?.bestScenario

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">What-if simulator</h1>
        <p className="text-sm text-muted mt-1.5 max-w-2xl">
          Compare payoff scenarios against your current trajectory. Each scenario is evaluated by
          the backend on your stored cards.
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-line shadow-sm p-5 mb-5">
        <div className="max-w-xs mb-5">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Base monthly payment <span className="font-normal normal-case text-muted/70">(optional)</span>
          </label>
          <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
            <span className="text-muted mr-1 text-sm">$</span>
            <input
              type="number" min="0" step="0.01" placeholder="auto"
              value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)}
              className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {scenarios.map((sc) => (
            <div key={sc._id} className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Label</label>
                <input
                  type="text" value={sc.label} onChange={setScenario(sc._id, 'label')}
                  className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Extra / mo</label>
                <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                  <span className="text-muted mr-1 text-sm">$</span>
                  <input type="number" min="0" step="0.01" placeholder="0" value={sc.extraMonthly} onChange={setScenario(sc._id, 'extraMonthly')}
                    className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Lump sum</label>
                <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                  <span className="text-muted mr-1 text-sm">$</span>
                  <input type="number" min="0" step="0.01" placeholder="0" value={sc.lumpSum} onChange={setScenario(sc._id, 'lumpSum')}
                    className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50" />
                </div>
              </div>
              <button
                onClick={() => removeScenario(sc._id)}
                disabled={scenarios.length <= 1}
                className="h-[42px] w-10 flex items-center justify-center rounded-xl text-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Remove scenario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <button
            onClick={addScenario}
            className="flex items-center gap-2 text-sm font-semibold text-primary border border-line rounded-xl px-4 py-2 hover:bg-page transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add scenario
          </button>
          <button
            onClick={handleRun}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Simulating…</>
            ) : (
              <><Zap className="w-4 h-4" /> Run simulation</>
            )}
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
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">Compare your options</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Define scenarios above and press <span className="font-semibold text-ink">Run simulation</span> to
            see how each affects your debt-free date and total interest.
          </p>
        </div>
      )}

      {loading && !result && <SkeletonBlock className="h-64" />}

      {result && (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-page border-b border-line text-left">
                  {['Scenario', 'Debt-free date', 'Months', 'Total interest', 'Months saved', 'Interest saved'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {baseline && (
                  <tr className="border-b border-line">
                    <td className="px-4 py-3 font-semibold text-ink">Baseline (current)</td>
                    <td className="px-4 py-3 tabular-nums">{fmtDate(baseline.debtFreeDate)}</td>
                    <td className="px-4 py-3 tabular-nums">{baseline.monthsToDebtFree ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(num(baseline.totalInterest))}</td>
                    <td className="px-4 py-3 text-muted">—</td>
                    <td className="px-4 py-3 text-muted">—</td>
                  </tr>
                )}
                {rows.map((s, i) => {
                  const isBest = best && (best.label ? best.label === s.label : best === s.label)
                  const vs = s.vsBaseline || {}
                  return (
                    <tr key={i} className={`border-b border-line last:border-0 ${isBest ? 'bg-success/5' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-ink">
                        <span className="flex items-center gap-2">
                          {s.label}
                          {isBest && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                              <Trophy className="w-3 h-3" /> Best
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{fmtDate(s.debtFreeDate)}</td>
                      <td className="px-4 py-3 tabular-nums">{s.monthsToDebtFree ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{formatCurrency(num(s.totalInterest))}</td>
                      <td className="px-4 py-3 tabular-nums text-success">{vs.monthsSaved != null ? vs.monthsSaved : '—'}</td>
                      <td className="px-4 py-3 tabular-nums text-success">{vs.interestSaved != null ? formatCurrency(num(vs.interestSaved)) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
