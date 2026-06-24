import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, SendHorizontal, Headphones,
  CheckCircle2, Send, User,
} from 'lucide-react'
import { createSupportTicket, sendChatMessage } from '../../api/chatbot'

// ─── FAQ matching ─────────────────────────────────────────────────────────────
const FAQ = [
  {
    pattern: /optimizer|avalanche|payment.?plan|how.+work/i,
    answer:
      'The optimizer uses the Avalanche method: it covers all minimum payments first, then applies your remaining budget to the card with the highest APR. This reduces the total interest you pay over time.',
  },
  {
    pattern: /financial.?advice|is.+advice|not.+advice/i,
    answer:
      'No. SpendPilot is a decision-support tool. The optimizer output is based on your card data and a mathematical algorithm — not personalized financial advice. Always consult a licensed financial advisor for your specific situation.',
  },
  {
    pattern: /upload|statement|pdf/i,
    answer:
      'Go to PDF Upload in the sidebar. Drag and drop a text-based credit card PDF. SpendPilot extracts your balance, minimum payment, due date, and APR. You can review and edit all values before saving.',
  },
  {
    pattern: /add.?card|manual.?entry|cards/i,
    answer:
      'Go to Cards in the sidebar and click "Add card manually". Enter your card name, bank, balance, APR, minimum payment, and due date. The optimizer will include it in the next run.',
  },
  {
    pattern: /risk.?score|risk.?level|score/i,
    answer:
      'The interest risk score (0–100) reflects how much high-APR debt you carry relative to your total balance. A score near 100 means most of your debt is at very high interest — prioritise paying down the top card first.',
  },
  {
    pattern: /plaid|connect.?bank|bank.?account/i,
    answer:
      'SpendPilot connects to your bank via Plaid Sandbox. In demo mode, sample accounts are already loaded. For production, click "Connect Bank" and follow the Plaid link flow.',
  },
]

function getBotResponse(input) {
  const match = FAQ.find((f) => f.pattern.test(input))
  if (match) return { answer: match.answer, showTicket: false }
  return {
    answer:
      "I'm not sure about that one. For anything outside my preset answers, our support team can help.",
    showTicket: true,
  }
}

const SUGGESTED_QUESTIONS = [
  'How does optimizer work?',
  'Is this financial advice?',
  'How do I upload a statement?',
]

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    role: 'bot',
    content:
      "Hi! I'm the SpendPilot help bot. Ask about the optimizer, statements, or your account.",
    showTicket: false,
  },
]

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2.5">
      <div className="w-7 h-7 rounded-full bg-purple/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-purple" />
      </div>
      <div className="bg-page border border-line rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-2 h-2 rounded-full bg-muted animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Chat message bubble ──────────────────────────────────────────────────────
function ChatMessage({ message, onCreateTicket }) {
  const isBot = message.role === 'bot'

  return (
    <div className={`flex items-end gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {/* Bot avatar */}
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-purple/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-purple" />
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isBot
              ? 'bg-page border border-line text-ink rounded-tl-sm'
              : 'bg-primary text-white rounded-tr-sm'
          }`}
        >
          {message.content}
        </div>

        {isBot && message.showTicket && (
          <button
            onClick={onCreateTicket}
            className="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Create support ticket
          </button>
        )}
      </div>

      {/* User avatar */}
      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
    </div>
  )
}

// ─── Support sidebar ──────────────────────────────────────────────────────────
function SupportPanel({ ticketState, setTicketState }) {
  const [form, setForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [ticketNum, setTicketNum] = useState('')

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { ticketId } = await createSupportTicket(form)
    setTicketNum(ticketId)
    setSubmitting(false)
    setTicketState('submitted')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Need a human? */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-ink">Need a human?</span>
        </div>

        {ticketState === 'idle' && (
          <>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              If the bot can't help, open a ticket and our team will follow up within 24 hours.
            </p>
            <button
              onClick={() => setTicketState('form')}
              className="w-full text-sm font-semibold border border-line text-ink px-4 py-2.5 rounded-xl hover:bg-page transition-colors cursor-pointer"
            >
              Create support ticket
            </button>
          </>
        )}

        {ticketState === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="Brief description…"
                value={form.subject}
                onChange={set('subject')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page placeholder:text-muted/60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={4}
                placeholder="More detail…"
                value={form.message}
                onChange={set('message')}
                className="w-full border border-line rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary transition-colors bg-page resize-none placeholder:text-muted/60"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTicketState('idle')}
                className="flex-1 text-sm font-semibold border border-line text-muted px-4 py-2 rounded-xl hover:bg-page transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {ticketState === 'submitted' && (
          <div className="text-center py-1">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm font-semibold text-ink mb-1">Ticket created</p>
            {ticketNum && (
              <p className="text-xs text-muted mb-2 tabular-nums">#{ticketNum}</p>
            )}
            <p className="text-xs text-muted">
              Our team will follow up within 24 hours.
            </p>
          </div>
        )}
      </div>

      {/* About this bot */}
      <div className="rounded-2xl border border-purple/20 bg-purple/5 p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-4 h-4 text-purple shrink-0" />
          <span className="text-sm font-semibold text-purple">About this bot</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          The help bot uses preset answers. It does not access your bank's policies,
          account history, or payment plan, and does not make changes to your account.
        </p>
      </div>
    </div>
  )
}

// ─── Chatbot Page ─────────────────────────────────────────────────────────────
export default function ChatbotPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [ticketState, setTicketState] = useState('idle') // idle | form | submitted
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: trimmed },
    ])
    setInput('')
    setIsTyping(true)

    let answer
    let showTicket
    try {
      const res = await sendChatMessage(trimmed)
      answer = res.answer
      showTicket = res.escalatable
    } catch {
      // Fall back to the built-in FAQ if the bot endpoint is unavailable.
      const fallback = getBotResponse(trimmed)
      answer = fallback.answer
      showTicket = fallback.showTicket
    }

    setMessages((prev) => [
      ...prev,
      { id: `bot-${Date.now()}`, role: 'bot', content: answer, showTicket },
    ])
    setIsTyping(false)
  }

  function handleSend() {
    sendMessage(input)
    inputRef.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleSuggestion(q) {
    sendMessage(q)
    inputRef.current?.focus()
  }

  function openTicket() {
    setTicketState('form')
    document
      .getElementById('sp-support-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="p-5 lg:p-7 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">Help &amp; Chat</h1>
        <p className="text-sm text-muted mt-1.5">
          Ask the help bot a question or create a support ticket for our team.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left: Chat window ── */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl shadow-sm flex flex-col h-[580px]">

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line shrink-0">
            <div className="w-9 h-9 rounded-xl bg-purple flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">Help bot</div>
              <div className="text-xs text-muted truncate">Preset answers · not bank policy</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted">Online</span>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onCreateTicket={openTicket}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions */}
          <div className="px-5 py-3 border-t border-line shrink-0">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  disabled={isTyping}
                  className="text-xs font-medium border border-line text-muted bg-page hover:border-primary/40 hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="px-5 pb-5 pt-3 shrink-0">
            <div className="flex items-center gap-3 bg-page border border-line rounded-2xl px-4 py-3 focus-within:border-primary transition-colors">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask the help bot…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={isTyping}
                className="flex-1 text-sm text-ink outline-none bg-transparent placeholder:text-muted/60 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-dark flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <SendHorizontal className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Support panel ── */}
        <div id="sp-support-panel" className="lg:sticky lg:top-6">
          <SupportPanel
            ticketState={ticketState}
            setTicketState={setTicketState}
          />
        </div>
      </div>
    </div>
  )
}
