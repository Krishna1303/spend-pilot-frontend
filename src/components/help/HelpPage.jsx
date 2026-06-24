import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, LifeBuoy, FileText, Shield, ChevronDown, ChevronUp,
  Plus, Send, ArrowLeft, AlertTriangle, MessageSquare,
} from 'lucide-react'
import SkeletonBlock from '../ui/SkeletonBlock'
import { fetchHelp, fetchTerms, fetchPrivacy } from '../../api/help'
import {
  listSupportTickets, getSupportTicket, postTicketMessage, createSupportTicket,
} from '../../api/chatbot'
import { formatDate } from '../../lib/formatters'

const TABS = [
  { id: 'articles', label: 'Help articles', Icon: BookOpen },
  { id: 'support', label: 'Support tickets', Icon: LifeBuoy },
  { id: 'terms', label: 'Terms', Icon: FileText },
  { id: 'privacy', label: 'Privacy', Icon: Shield },
]

// ─── Help articles ────────────────────────────────────────────────────────────
function ArticlesTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    let active = true
    fetchHelp()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message || 'Could not load help.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  if (loading) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-14" />)}</div>
  if (error) return <ErrorBox text={error} />

  const articles = data?.articles ?? []
  return (
    <div className="flex flex-col gap-2.5">
      {articles.length === 0 && <p className="text-sm text-muted">No articles available.</p>}
      {articles.map((a) => {
        const open = openId === a.id
        return (
          <div key={a.id} className="border border-line rounded-xl overflow-hidden bg-surface">
            <button
              onClick={() => setOpenId(open ? null : a.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-page transition-colors cursor-pointer"
            >
              <span className="text-sm font-semibold text-ink">{a.title}</span>
              {open ? <ChevronUp className="w-4 h-4 text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted shrink-0" />}
            </button>
            {open && (
              <p className="px-4 pb-4 text-sm text-muted leading-relaxed whitespace-pre-wrap border-t border-line pt-3">{a.body}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Terms / Privacy ──────────────────────────────────────────────────────────
function LegalTab({ load }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    load()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message || 'Could not load this document.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [load])

  if (loading) return <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-20" />)}</div>
  if (error) return <ErrorBox text={error} />

  return (
    <div className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-ink">{data?.title}</h2>
      {(data?.version || data?.effectiveDate) && (
        <p className="text-xs text-muted mt-1">
          {data.version && <>Version {data.version}</>}
          {data.effectiveDate && <> · Effective {formatDate(String(data.effectiveDate).slice(0, 10))}</>}
        </p>
      )}
      <div className="flex flex-col gap-5 mt-5">
        {(data?.sections ?? []).map((s, i) => (
          <div key={i}>
            <h3 className="text-sm font-semibold text-ink mb-1.5">{s.heading}</h3>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Support inbox ────────────────────────────────────────────────────────────
const SENDER_STYLE = {
  user: 'bg-primary text-white ml-auto rounded-tr-sm',
  bot: 'bg-page border border-line text-ink rounded-tl-sm',
  admin: 'bg-purple/10 border border-purple/20 text-ink rounded-tl-sm',
}

function SupportTab() {
  const [tickets, setTickets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null) // ticket detail
  const [composing, setComposing] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '' })
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  const loadList = useCallback(() => {
    setLoading(true)
    listSupportTickets()
      .then(setTickets)
      .catch((e) => setError(e.message || 'Could not load tickets.'))
      .finally(() => setLoading(false))
  }, [])

  // Initial load — fetch inline (state is set asynchronously in the promise).
  useEffect(() => {
    let active = true
    listSupportTickets()
      .then((t) => active && setTickets(t))
      .catch((e) => active && setError(e.message || 'Could not load tickets.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  async function openTicket(id) {
    setBusy(true)
    try {
      setSelected(await getSupportTicket(id))
    } catch (e) {
      setError(e.message || 'Could not open ticket.')
    } finally {
      setBusy(false)
    }
  }

  async function submitNew(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setBusy(true)
    try {
      await createSupportTicket(form)
      setForm({ subject: '', message: '' })
      setComposing(false)
      loadList()
    } catch (err) {
      setError(err.message || 'Could not create ticket.')
    } finally {
      setBusy(false)
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setBusy(true)
    try {
      const updated = await postTicketMessage(selected.id || selected._id, reply)
      setSelected(updated)
      setReply('')
    } catch (err) {
      setError(err.message || 'Could not send your reply.')
    } finally {
      setBusy(false)
    }
  }

  // Detail view
  if (selected) {
    const messages = selected.messages ?? []
    return (
      <div className="bg-surface border border-line rounded-2xl shadow-sm flex flex-col h-[600px]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line shrink-0">
          <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-page transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{selected.subject}</div>
            {selected.status && <div className="text-xs text-muted capitalize">{selected.status}</div>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${SENDER_STYLE[m.sender] || SENDER_STYLE.bot}`}>
              {m.body}
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-line shrink-0">
          <div className="flex items-center gap-3 bg-page border border-line rounded-2xl px-4 py-2.5 focus-within:border-primary transition-colors">
            <input
              value={reply} onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
              placeholder="Write a reply…" disabled={busy}
              className="flex-1 text-sm text-ink outline-none bg-transparent placeholder:text-muted/60 disabled:opacity-50"
            />
            <button onClick={sendReply} disabled={busy || !reply.trim()}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-dark flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // New ticket form
  if (composing) {
    return (
      <form onSubmit={submitNew} className="bg-surface border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-4 max-w-xl">
        <h2 className="text-base font-semibold text-ink">New support ticket</h2>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Subject</label>
          <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page" placeholder="Brief description…" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Message</label>
          <textarea required rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page resize-none" placeholder="More detail…" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => setComposing(false)} className="text-sm font-semibold border border-line text-muted px-5 py-2.5 rounded-xl hover:bg-page transition-colors cursor-pointer">Cancel</button>
          <button type="submit" disabled={busy} className="flex items-center gap-2 text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-60">
            {busy ? 'Submitting…' : 'Submit ticket'}
          </button>
        </div>
      </form>
    )
  }

  // List view
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setComposing(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
          <Plus className="w-4 h-4" /> New ticket
        </button>
      </div>
      {error && <div className="mb-4"><ErrorBox text={error} /></div>}
      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-16" />)}</div>
      ) : (tickets?.length ?? 0) === 0 ? (
        <div className="bg-surface border border-line rounded-2xl py-16 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">No tickets yet</h3>
          <p className="text-sm text-muted">Open a ticket and our team will follow up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tickets.map((t) => (
            <button key={t.id || t._id} onClick={() => openTicket(t.id || t._id)} disabled={busy}
              className="flex items-center justify-between gap-3 text-left px-5 py-4 border border-line rounded-2xl bg-surface hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer disabled:opacity-60">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink truncate">{t.subject}</div>
                {t.createdAt && <div className="text-xs text-muted mt-0.5">Opened {formatDate(String(t.createdAt).slice(0, 10))}</div>}
              </div>
              {t.status && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  t.status === 'resolved' ? 'bg-success/10 text-success' : t.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                }`}>{t.status}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ErrorBox({ text }) {
  return (
    <div className="flex items-start gap-3 bg-danger/5 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{text}</span>
    </div>
  )
}

export default function HelpPage() {
  const [tab, setTab] = useState('articles')

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Help &amp; support</h1>
        <p className="text-sm text-muted mt-1.5">Browse articles, review our policies, or contact our team.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              tab === id ? 'bg-ink text-white' : 'border border-line text-muted hover:text-ink hover:bg-page'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'articles' && <ArticlesTab />}
      {tab === 'support' && <SupportTab />}
      {tab === 'terms' && <LegalTab load={fetchTerms} />}
      {tab === 'privacy' && <LegalTab load={fetchPrivacy} />}
    </div>
  )
}
