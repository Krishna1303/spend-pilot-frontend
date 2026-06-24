import { useState, useEffect } from 'react'
import {
  CreditCard, Landmark, Plus, Pencil, Trash2,
  X, DollarSign, CalendarDays, Percent, Save,
  RefreshCw, Building2,
} from 'lucide-react'
import SourceBadge from '../ui/SourceBadge'
import RiskBadge from '../ui/RiskBadge'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchCards, fetchAccounts, addCard, updateCard, deleteCard } from '../../api/cards'
import { formatCurrency, formatDate, daysUntil } from '../../lib/formatters'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRisk(apr) {
  if (apr >= 25) return 'high'
  if (apr >= 15) return 'medium'
  return 'low'
}

function getUtil(balance, creditLimit) {
  if (!creditLimit) return 0
  return Math.min(Math.round((balance / creditLimit) * 100), 100)
}

// ─── Utilization bar ──────────────────────────────────────────────────────────
function UtilBar({ balance, creditLimit }) {
  const pct = getUtil(balance, creditLimit)
  const isHigh = pct > 30
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-[52px] h-1.5 bg-line rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: isHigh ? '#F59E0B' : '#10B981',
          }}
        />
      </div>
      <span className="text-xs font-semibold text-ink tabular-nums w-8 text-right shrink-0">
        {pct}%
      </span>
    </div>
  )
}

// ─── Desktop credit card table ─────────────────────────────────────────────────
const COL = 'grid-cols-[2.4fr_1.1fr_0.9fr_1fr_1.5fr_1.4fr_80px]'

function CardTableRow({ card, onEdit, onDelete, isDeleting, onDeleteStart, onDeleteCancel }) {
  const risk = getRisk(card.apr)
  const isHighApr = card.apr >= 25
  const dueLabel = formatDate(card.dueDate)
  const days = daysUntil(card.dueDate)

  return (
    <div className={`grid ${COL} gap-4 items-center px-6 py-4 border-b border-line last:border-0 hover:bg-page/60 transition-colors`}>
      {/* Card */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-ink">{card.bankName}</span>
          <SourceBadge source={card.source} />
        </div>
        <div className="text-xs text-muted mt-0.5">{card.cardName}</div>
      </div>

      {/* Balance */}
      <div className="text-sm font-semibold text-ink tabular-nums">
        {formatCurrency(card.balance)}
      </div>

      {/* APR */}
      <div
        className="text-sm font-semibold tabular-nums"
        style={{ color: isHighApr ? '#EF4444' : '#0F172A' }}
      >
        {card.apr.toFixed(2)}%
      </div>

      {/* Minimum */}
      <div className="text-sm font-medium text-ink tabular-nums">
        {formatCurrency(card.minimumPayment)}
      </div>

      {/* Due date + risk badge */}
      <div>
        <div className="text-sm font-medium text-ink">{dueLabel}</div>
        <div className="mt-1">
          <RiskBadge level={risk} />
        </div>
      </div>

      {/* Utilization */}
      <UtilBar balance={card.balance} creditLimit={card.creditLimit} />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isDeleting ? (
          <div className="flex items-center gap-1">
            <button
              onClick={onDelete}
              className="text-xs font-semibold text-danger border border-danger/30 bg-danger/5 px-2 py-1 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={onDeleteCancel}
              className="text-xs font-semibold text-muted border border-line px-2 py-1 rounded-lg hover:bg-page transition-colors cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(card)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-page transition-colors cursor-pointer"
              title="Edit card"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDeleteStart}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
              title="Delete card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function CreditCardTable({ cards, onEdit, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className={`grid ${COL} gap-4 px-6 py-3 bg-page border-b border-line`}>
        {['Card', 'Balance', 'APR', 'Minimum', 'Due Date', 'Util.', 'Actions'].map((h) => (
          <span key={h} className="text-xs font-semibold text-muted uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <CreditCard className="w-8 h-8 text-line mx-auto mb-3" />
          <p className="text-sm text-muted">No credit cards yet. Add one above.</p>
        </div>
      ) : (
        cards.map((card) => (
          <CardTableRow
            key={card.id}
            card={card}
            onEdit={onEdit}
            onDelete={() => { onDelete(card.id); setDeletingId(null) }}
            isDeleting={deletingId === card.id}
            onDeleteStart={() => setDeletingId(card.id)}
            onDeleteCancel={() => setDeletingId(null)}
          />
        ))
      )}
    </div>
  )
}

// ─── Mobile credit card item ──────────────────────────────────────────────────
function CardMobileItem({ card, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const risk = getRisk(card.apr)
  const isHighApr = card.apr >= 25

  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ink">{card.bankName}</span>
            <SourceBadge source={card.source} />
          </div>
          <div className="text-xs text-muted mt-0.5">{card.cardName}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(card)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-page transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-2xl font-bold text-ink tabular-nums mb-3">
        {formatCurrency(card.balance)}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        <div>
          <div className="text-muted mb-0.5 uppercase tracking-wider font-semibold">APR</div>
          <div className="font-semibold" style={{ color: isHighApr ? '#EF4444' : '#0F172A' }}>
            {card.apr.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-muted mb-0.5 uppercase tracking-wider font-semibold">Minimum</div>
          <div className="font-semibold text-ink tabular-nums">{formatCurrency(card.minimumPayment)}</div>
        </div>
        <div>
          <div className="text-muted mb-0.5 uppercase tracking-wider font-semibold">Due</div>
          <div className="font-semibold text-ink">{formatDate(card.dueDate)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
        <div className="flex-1">
          <div className="text-xs text-muted mb-1 font-semibold uppercase tracking-wider">
            Utilization
          </div>
          <UtilBar balance={card.balance} creditLimit={card.creditLimit} />
        </div>
        <RiskBadge level={risk} />
      </div>

      {confirming && (
        <div className="mt-3 pt-3 border-t border-danger/20 flex items-center justify-between gap-3">
          <span className="text-xs text-danger font-medium">Delete this card?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-semibold border border-line text-muted px-3 py-1.5 rounded-lg hover:bg-page transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="text-xs font-semibold bg-danger text-white px-3 py-1.5 rounded-lg hover:bg-danger/90 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Bank accounts table (desktop) ────────────────────────────────────────────
const ACCT_COL = 'grid-cols-[2fr_1.2fr_0.8fr_1.2fr_0.8fr]'

function AccountTable({ accounts }) {
  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      <div className={`grid ${ACCT_COL} gap-4 px-6 py-3 bg-page border-b border-line`}>
        {['Account', 'Balance', 'Type', 'Last Synced', 'Source'].map((h) => (
          <span key={h} className="text-xs font-semibold text-muted uppercase tracking-wider">{h}</span>
        ))}
      </div>

      {accounts.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Landmark className="w-8 h-8 text-line mx-auto mb-3" />
          <p className="text-sm text-muted">No bank accounts connected yet.</p>
        </div>
      ) : (
        accounts.map((acct) => (
          <div key={acct.id} className={`grid ${ACCT_COL} gap-4 items-center px-6 py-4 border-b border-line last:border-0 hover:bg-page/60 transition-colors`}>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{acct.bankName}</div>
                  <div className="text-xs text-muted">{acct.accountName} ···{acct.accountNumber}</div>
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-ink tabular-nums">{formatCurrency(acct.balance)}</div>
            <div className="capitalize">
              <span className="text-xs font-medium bg-page border border-line text-muted px-2.5 py-1 rounded-full">
                {acct.type}
              </span>
            </div>
            <div className="text-sm text-muted">{formatDate(acct.lastSynced)}</div>
            <SourceBadge source={acct.source} />
          </div>
        ))
      )}
    </div>
  )
}

// Mobile bank account item
function AccountMobileItem({ acct }) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">{acct.bankName}</div>
            <div className="text-xs text-muted">{acct.accountName} ···{acct.accountNumber}</div>
          </div>
        </div>
        <SourceBadge source={acct.source} />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-line">
        <div className="text-xl font-bold text-ink tabular-nums">{formatCurrency(acct.balance)}</div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <RefreshCw className="w-3 h-3" />
          {formatDate(acct.lastSynced)}
        </div>
      </div>
    </div>
  )
}

// ─── Add / Edit card modal ────────────────────────────────────────────────────
const EMPTY_FORM = {
  bankName: '', cardName: '', balance: '', minimumPayment: '',
  dueDate: '', apr: '', creditLimit: '', source: 'manual',
}

function CardModal({ card, onSave, onClose }) {
  const isEditing = !!card
  const [form, setForm] = useState(
    isEditing
      ? { ...card, balance: card.balance, minimumPayment: card.minimumPayment,
          apr: card.apr, creditLimit: card.creditLimit }
      : EMPTY_FORM,
  )
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const [saveError, setSaveError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const payload = {
      ...form,
      balance: parseFloat(form.balance) || 0,
      minimumPayment: parseFloat(form.minimumPayment) || 0,
      apr: parseFloat(form.apr) || 0,
      creditLimit: parseFloat(form.creditLimit) || 0,
    }
    try {
      const saved = isEditing
        ? await updateCard(card.id, payload)
        : await addCard(payload)
      onSave(saved)
    } catch (err) {
      setSaveError(err.message || 'Could not save the card. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
    >
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h2 className="text-base font-semibold text-ink">
            {isEditing ? 'Edit card' : 'Add card manually'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-page transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank name */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Bank
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Chase"
                value={form.bankName}
                onChange={set('bankName')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page placeholder:text-muted/50"
              />
            </div>

            {/* Card name */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Card name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Freedom Unlimited"
                value={form.cardName}
                onChange={set('cardName')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page placeholder:text-muted/50"
              />
            </div>

            {/* Balance */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Balance
              </label>
              <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                <span className="text-muted mr-1 text-sm">$</span>
                <input
                  required type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.balance} onChange={set('balance')}
                  className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* Credit limit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Credit limit
              </label>
              <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                <span className="text-muted mr-1 text-sm">$</span>
                <input
                  required type="number" step="1" min="0" placeholder="0"
                  value={form.creditLimit} onChange={set('creditLimit')}
                  className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* APR */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                APR
              </label>
              <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                <input
                  required type="number" step="0.01" min="0" max="100" placeholder="0.00"
                  value={form.apr} onChange={set('apr')}
                  className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
                />
                <span className="text-muted ml-1 text-sm">%</span>
              </div>
            </div>

            {/* Minimum payment */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Minimum payment
              </label>
              <div className="flex items-center border border-line rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors bg-page">
                <span className="text-muted mr-1 text-sm">$</span>
                <input
                  required type="number" step="0.01" min="0" placeholder="0.00"
                  value={form.minimumPayment} onChange={set('minimumPayment')}
                  className="flex-1 text-sm text-ink outline-none bg-transparent tabular-nums placeholder:text-muted/50"
                />
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Due date
              </label>
              <input
                required type="date"
                value={form.dueDate} onChange={set('dueDate')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Source
              </label>
              <select
                value={form.source} onChange={set('source')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page cursor-pointer"
              >
                <option value="manual">Manual</option>
                <option value="pdf">PDF Upload</option>
                <option value="plaid">Plaid</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        {saveError && (
          <div className="px-6 -mt-2 pb-1 text-sm text-danger">{saveError}</div>
        )}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold border border-line text-muted px-5 py-2.5 rounded-xl hover:bg-page transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Save changes' : 'Add card'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-3 bg-page border-b border-line h-10" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-6 py-4 border-b border-line last:border-0 flex gap-6">
          <SkeletonBlock className="h-10 flex-[2.4]" />
          <SkeletonBlock className="h-10 flex-[1.1]" />
          <SkeletonBlock className="h-10 flex-[0.9]" />
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-[1.5]" />
          <SkeletonBlock className="h-10 flex-[1.4]" />
          <SkeletonBlock className="h-10 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ─── Cards Page ───────────────────────────────────────────────────────────────
export default function CardsPage() {
  const [cards, setCards] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('credit') // 'credit' | 'bank'
  const [modalCard, setModalCard] = useState(null)     // null=closed, 'new'=add, obj=edit

  useEffect(() => {
    Promise.all([fetchCards(), fetchAccounts()]).then(([c, a]) => {
      setCards(c)
      setAccounts(a)
      setLoading(false)
    })
  }, [])

  function handleSave(payload) {
    setCards((prev) => {
      const exists = prev.find((c) => c.id === payload.id)
      if (exists) return prev.map((c) => (c.id === payload.id ? payload : c))
      return [...prev, { ...payload, id: payload.id ?? Date.now() }]
    })
    setModalCard(null)
  }

  function handleDelete(id) {
    const prev = cards
    setCards((cs) => cs.filter((c) => c.id !== id))
    deleteCard(id).catch(() => setCards(prev)) // restore on failure
  }

  const tabs = [
    { id: 'credit', label: 'Credit cards', Icon: CreditCard },
    { id: 'bank',   label: 'Debit / bank', Icon: Landmark },
  ]

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
            Cards &amp; accounts
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Manage your credit cards and connected bank accounts.
          </p>
        </div>
        {activeTab === 'credit' && (
          <button
            onClick={() => setModalCard('new')}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add card
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === id
                ? 'bg-ink text-white'
                : 'border border-line text-muted hover:text-ink hover:bg-page'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton />
      ) : activeTab === 'credit' ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <CreditCardTable
              cards={cards}
              onEdit={(card) => setModalCard(card)}
              onDelete={handleDelete}
            />
          </div>

          {/* Mobile card list */}
          <div className="md:hidden flex flex-col gap-4">
            {cards.length === 0 ? (
              <div className="bg-surface border border-line rounded-2xl p-8 text-center">
                <CreditCard className="w-8 h-8 text-line mx-auto mb-3" />
                <p className="text-sm text-muted">No credit cards yet. Tap "Add card" above.</p>
              </div>
            ) : (
              cards.map((card) => (
                <CardMobileItem
                  key={card.id}
                  card={card}
                  onEdit={() => setModalCard(card)}
                  onDelete={() => handleDelete(card.id)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop account table */}
          <div className="hidden md:block">
            <AccountTable accounts={accounts} />
          </div>

          {/* Mobile account list */}
          <div className="md:hidden flex flex-col gap-4">
            {accounts.map((acct) => (
              <AccountMobileItem key={acct.id} acct={acct} />
            ))}
          </div>
        </>
      )}

      {/* Add / Edit modal */}
      {modalCard !== null && (
        <CardModal
          card={modalCard === 'new' ? null : modalCard}
          onSave={handleSave}
          onClose={() => setModalCard(null)}
        />
      )}
    </div>
  )
}
