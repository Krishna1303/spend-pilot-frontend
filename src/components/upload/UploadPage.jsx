import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudUpload, CheckCircle2, AlertTriangle, FileText,
  ChevronDown, ChevronUp, RotateCcw, Save, Zap, FileCheck,
} from 'lucide-react'
import SkeletonBlock from '../ui/SkeletonBlock'
import { uploadStatement, loadDemoStatement } from '../../api/statements'
import { addCard } from '../../api/cards'

// ─── Confidence badge ─────────────────────────────────────────────────────────
function ConfidenceBadge({ label, type }) {
  if (type === 'found') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-success/10 text-success px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-warning/10 text-warning px-2.5 py-1 rounded-full">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {label}
    </span>
  )
}

// ─── Parsing skeleton ─────────────────────────────────────────────────────────
function ParseSkeleton({ fileName }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold text-ink">{fileName}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted">Extracting statement fields…</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
      <SkeletonBlock className="h-10 mt-4" />
    </div>
  )
}

// ─── Review form ──────────────────────────────────────────────────────────────
function ReviewForm({ parsed, onSave, onReset }) {
  const navigate = useNavigate()
  const [fields, setFields] = useState({
    bankName: parsed.bankName,
    cardName: parsed.cardName,
    balance: parsed.balance,
    minimumPayment: parsed.minimumPayment,
    dueDate: parsed.dueDate,
    apr: parsed.apr,
  })
  const [rawOpen, setRawOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
    setFieldErrors((fe) => (fe[key] ? { ...fe, [key]: false } : fe))
    setSaveError('')
  }

  // Error-aware borders.
  const fieldCls = (key) =>
    `w-full border ${fieldErrors[key] ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-primary transition-colors bg-page`
  const boxCls = (key) =>
    `flex items-center border ${fieldErrors[key] ? 'border-danger' : 'border-line'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page`
  const aprBoxCls = `flex items-center border ${fieldErrors.apr ? 'border-danger' : 'border-warning/40'} rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors ${fieldErrors.apr ? 'bg-page' : 'bg-warning/5'}`

  function validate() {
    const blank = (v) => v === '' || v == null
    const notNumber = (v) => blank(v) || isNaN(Number(v))
    const e = {}
    if (!String(fields.bankName).trim()) e.bankName = true
    if (!String(fields.cardName).trim()) e.cardName = true
    if (notNumber(fields.balance)) e.balance = true
    if (notNumber(fields.minimumPayment)) e.minimumPayment = true
    if (notNumber(fields.apr)) e.apr = true
    if (!fields.dueDate) e.dueDate = true
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      setSaveError('Please fill in all fields before saving — bank and card name are required.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      await addCard({
        cardType: 'credit',
        bankName: fields.bankName,
        cardName: fields.cardName,
        balance: parseFloat(fields.balance) || 0,
        statementBalance: parseFloat(fields.balance) || 0,
        minimumPayment: parseFloat(fields.minimumPayment) || 0,
        dueDate: fields.dueDate,
        apr: parseFloat(fields.apr) || 0,
        source: 'pdf',
      })
      setSaved(true)
      onSave(fields)
    } catch (err) {
      setSaveError(err.message || 'Could not save this card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="bg-surface border border-success/30 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <FileCheck className="w-7 h-7 text-success" />
        </div>
        <h3 className="text-lg font-bold text-ink mb-1">Statement saved</h3>
        <p className="text-sm text-muted mb-6">
          {fields.bankName} {fields.cardName} has been added to your cards.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 text-sm font-semibold border border-line text-ink px-5 py-2.5 rounded-xl hover:bg-page transition-colors cursor-pointer"
          >
            <CloudUpload className="w-4 h-4" /> Upload another
          </button>
          <button
            onClick={() => navigate('/optimizer')}
            className="flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Run optimizer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-ink">Review extracted values</h2>
        <p className="text-sm text-muted mt-0.5">
          Review before saving. Statements vary by bank.
        </p>
      </div>

      {/* Confidence badges row */}
      <div className="flex flex-wrap gap-2 mb-6">
        <ConfidenceBadge label="Balance Found" type={parsed.confidence.balance} />
        <ConfidenceBadge label="Due Date Found" type={parsed.confidence.dueDate} />
        <ConfidenceBadge label="Minimum Found" type={parsed.confidence.minimumPayment} />
        <ConfidenceBadge label="APR Manual" type={parsed.confidence.apr} />
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Balance */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Balance
          </label>
          <div className={boxCls('balance')}>
            <span className="text-muted mr-1.5 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={fields.balance}
              onChange={set('balance')}
              className="flex-1 text-sm font-semibold text-ink outline-none bg-transparent tabular-nums"
            />
          </div>
        </div>

        {/* Minimum Payment */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Minimum Payment
          </label>
          <div className={boxCls('minimumPayment')}>
            <span className="text-muted mr-1.5 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={fields.minimumPayment}
              onChange={set('minimumPayment')}
              className="flex-1 text-sm font-semibold text-ink outline-none bg-transparent tabular-nums"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={fields.dueDate}
            onChange={set('dueDate')}
            className={fieldCls('dueDate')}
          />
        </div>

        {/* APR */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            APR <span className="text-warning font-normal normal-case">(verify manually)</span>
          </label>
          <div className={aprBoxCls}>
            <input
              type="number"
              step="0.01"
              value={fields.apr}
              onChange={set('apr')}
              className="flex-1 text-sm font-semibold text-ink outline-none bg-transparent tabular-nums"
            />
            <span className="text-muted ml-1.5 text-sm">%</span>
          </div>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Bank <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chase"
            value={fields.bankName}
            onChange={set('bankName')}
            className={fieldCls('bankName')}
          />
        </div>

        {/* Card Name */}
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
            Card Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Freedom Unlimited"
            value={fields.cardName}
            onChange={set('cardName')}
            className={fieldCls('cardName')}
          />
        </div>
      </div>

      {/* Raw text preview — collapsed by default */}
      <div className="border border-line rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setRawOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-muted hover:bg-page transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Raw text preview
          </span>
          {rawOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {rawOpen && (
          <pre className="px-4 pb-4 text-xs text-muted font-mono whitespace-pre-wrap leading-relaxed border-t border-line bg-page">
            {parsed.rawTextPreview}
          </pre>
        )}
      </div>

      {/* Save error */}
      {saveError && (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-4 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-sm font-semibold border border-line text-muted px-5 py-2.5 rounded-xl hover:bg-page hover:text-ink transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save as card
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Drop zone ────────────────────────────────────────────────────────────────
function DropZone({ onFile, onDemo }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) onFile(file)
    },
    [onFile],
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center min-h-64 rounded-2xl border-2 border-dashed transition-colors cursor-pointer select-none
        ${dragging
          ? 'border-primary bg-primary/5'
          : 'border-line bg-surface hover:border-primary/40 hover:bg-primary/5'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />

      {/* Icon */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
        ${dragging ? 'bg-primary/15' : 'bg-primary/10'}`}>
        <CloudUpload className={`w-7 h-7 transition-colors ${dragging ? 'text-primary' : 'text-primary/80'}`} />
      </div>

      <p className="text-base font-semibold text-ink mb-1">
        {dragging ? 'Drop your PDF here' : 'Drag & drop a PDF statement'}
      </p>
      <p className="text-sm text-muted mb-5">or click to browse</p>

      {/* Demo button — stop propagation so it doesn't also open file dialog */}
      <button
        onClick={(e) => { e.stopPropagation(); onDemo() }}
        className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
      >
        Use demo statement
      </button>
    </div>
  )
}

// ─── Upload Page ──────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [state, setState] = useState('idle')   // idle | parsing | review | error
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState(null)
  const [error, setError] = useState(null)

  async function handleFile(file) {
    setFileName(file.name)
    setState('parsing')
    setError(null)
    try {
      const result = await uploadStatement(file)
      setParsed(result)
      setState('review')
    } catch {
      setError('We could not parse this statement. Please check the file and try again.')
      setState('idle')
    }
  }

  async function handleDemo() {
    setFileName('Chase_Freedom_Unlimited_Statement.pdf')
    setState('parsing')
    setError(null)
    try {
      const result = await loadDemoStatement()
      setParsed(result)
      setState('review')
    } catch {
      setError('Could not load demo statement. Please try again.')
      setState('idle')
    }
  }

  function handleReset() {
    setState('idle')
    setParsed(null)
    setFileName('')
    setError(null)
  }

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
          Upload a statement
        </h1>
        <p className="text-sm text-muted mt-1.5">
          Upload a text-based credit card statement. You can review and edit extracted values
          before saving.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 mb-5 text-sm text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* States */}
      {state === 'idle' && (
        <DropZone onFile={handleFile} onDemo={handleDemo} />
      )}

      {state === 'parsing' && (
        <ParseSkeleton fileName={fileName} />
      )}

      {state === 'review' && parsed && (
        <ReviewForm
          parsed={parsed}
          onSave={(fields) => console.log('Saved card:', fields)}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
