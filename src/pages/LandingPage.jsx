import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Shield, Upload, Brain, CreditCard, Check, LineChart } from 'lucide-react'

const T      = '#10B981'
const BG     = '#F8FAFC'
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F0'
const TEXT   = '#0F172A'
const BODY   = '#475569'
const MUTED  = '#94A3B8'

const TICKER = ['Sapphire', 'Quicksilver', 'Freedom', 'Platinum', 'Apex', 'Aurora', 'Venture', 'Meridian']

const PLANS = [
  {
    name: 'Pilot',    price: 'Free', period: '',    highlight: false,
    desc: 'Up to 2 cards, manual entry.',
    features: ['Optimizer engine', 'PDF upload', 'Plain-English explanations'],
    cta: 'Start free',
  },
  {
    name: 'Copilot',  price: '$8',   period: '/mo', highlight: true, badge: 'Most loved',
    desc: 'Unlimited cards, bank sync, alerts.',
    features: ['Everything in Pilot', 'Plaid connections', 'Due-date alerts', 'AI chat support'],
    cta: 'Get Copilot',
  },
  {
    name: 'Squadron', price: '$20',  period: '/mo', highlight: false,
    desc: 'Up to 5 household members.',
    features: ['Everything in Copilot', 'Shared optimizer', 'Joint planning', 'Priority support'],
    cta: 'Get Squadron',
  },
]

const FEATURES = [
  { I: Shield,     title: 'Bank-grade encryption',   desc: 'Statements stay encrypted at rest. We never sell your data.' },
  { I: LineChart,  title: 'Cycle forecasts',          desc: 'See payoff dates shift in real time as you change your budget.' },
  { I: CreditCard, title: 'All your cards, one feed', desc: 'Connect via Plaid or enter manually — balances, APRs, due dates in one place.' },
  { I: Brain,      title: 'AI explanations',          desc: 'Ask "why this card?" and get a plain-English answer — never a guess.' },
]

function G({ children, style = {} }) {
  return (
    <span style={{
      background: `linear-gradient(135deg, #059669 0%, ${T} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}>
      {children}
    </span>
  )
}

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('sp-visible') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* ── scroll reveal ── */
        [data-animate] {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        [data-animate].sp-visible { opacity: 1; transform: translateY(0); }
        [data-delay="1"] { transition-delay: 0.08s; }
        [data-delay="2"] { transition-delay: 0.16s; }
        [data-delay="3"] { transition-delay: 0.24s; }
        [data-delay="4"] { transition-delay: 0.32s; }

        /* ── ticker ── */
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ticker-track { display: flex; width: max-content; animation: ticker 30s linear infinite; }

        /* ── nav link ── */
        a.sp-nav { color: ${BODY}; font-size: 14px; font-weight: 500; text-decoration: none; transition: color .15s; }
        a.sp-nav:hover { color: ${TEXT}; }

        /* ── card hover: lift + teal glow ── */
        .sp-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          cursor: default;
        }
        .sp-card:hover {
          transform: translateY(-4px);
          border-color: rgba(16,185,129,0.55) !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1), 0 12px 32px rgba(16,185,129,0.08);
        }

        /* ── plan card hover ── */
        .sp-plan {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .sp-plan:hover {
          transform: translateY(-4px);
          border-color: ${T} !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12), 0 16px 36px rgba(16,185,129,0.1);
        }

        /* ── button ── */
        .sp-btn { transition: opacity .2s, transform .2s; }
        .sp-btn:hover { opacity: 0.87; transform: translateY(-1px); }

        /* ── optimizer pulse ── */
        @keyframes glow {
          0%,100% { box-shadow: 0 4px 24px rgba(16,185,129,0.08); }
          50%      { box-shadow: 0 4px 36px rgba(16,185,129,0.18); }
        }
        .sp-optimizer { animation: glow 4s ease-in-out infinite; }
      `}</style>

      <div style={{ background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

        {/* ━━ NAVBAR ━━ */}
        <nav style={{ borderBottom: `1px solid ${BORDER}`, background: 'rgba(248,250,252,0.92)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', color: TEXT }}>SpendPilot</span>
            </div>

            <div style={{ display: 'flex', gap: 28 }}>
              <a href="#how-it-works" className="sp-nav">How it works</a>
              <a href="#features"     className="sp-nav">Features</a>
              <a href="#story"        className="sp-nav">Story</a>
              <a href="#pricing"      className="sp-nav">Pricing</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Link to="/login"  style={{ color: BODY, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
              <Link to="/signup">
                <button className="sp-btn" style={{ background: T, color: '#fff', border: 'none', borderRadius: 999, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Get started <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ━━ HERO ━━ */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'center' }}>

          <div data-animate>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '5px 13px', fontSize: 11, color: BODY, marginBottom: 22, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T, display: 'inline-block' }} />
              New · AI payment copilot for cardholders
            </div>

            <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.12, margin: '0 0 14px', letterSpacing: '-0.03em', color: TEXT }}>
              Pay the <G><em>right card</em></G><br />first — every cycle.
            </h1>

            <p style={{ fontSize: 14, lineHeight: 1.8, color: BODY, margin: '0 0 26px', maxWidth: 390 }}>
              SpendPilot reads your statements, watches your APRs and due dates, and tells you exactly where each dollar goes — so you spend <em style={{ color: TEXT, fontStyle: 'italic' }}>less on interest</em> and more on living.
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
              <Link to="/signup">
                <button className="sp-btn" style={{ background: T, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                  Try the demo <ArrowRight size={13} />
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="sp-btn" style={{ background: '#fff', color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  Skip to dashboard
                </button>
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 32, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
              {[['$2.4M', 'interest avoided'], ['38k', 'statements parsed'], ['4.9 ★', 'user rating']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px' }}>{v}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Optimizer */}
          <div data-animate data-delay="2" className="sp-optimizer" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 22, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: MUTED }}>
                <Zap size={12} color={T} /> Live Optimizer
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '3px 9px', color: MUTED, letterSpacing: 1 }}>DEMO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: BODY }}>Available this cycle</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: TEXT, letterSpacing: '-0.5px' }}>$900</span>
            </div>
            <div style={{ height: 5, background: '#E2E8F0', borderRadius: 99, position: 'relative', marginBottom: 18 }}>
              <div style={{ width: '30%', height: '100%', background: T, borderRadius: 99 }} />
              <div style={{ position: 'absolute', top: '50%', left: 'calc(30% - 7px)', transform: 'translateY(-50%)', width: 14, height: 14, borderRadius: '50%', background: T, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(16,185,129,0.4)' }} />
            </div>
            {[
              { name: 'Sapphire',    apr: '24.99%', bal: '$4,200', amt: '$838', first: true,  clr: '#10B981' },
              { name: 'Quicksilver', apr: '19.49%', bal: '$1,850', amt: '$37',  first: false, clr: '#A78BFA' },
              { name: 'Freedom',     apr: '16.24%', bal: '$980',   amt: '$25',  first: false, clr: '#FCD34D' },
            ].map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 11, marginBottom: 7, background: c.first ? 'rgba(16,185,129,0.06)' : '#F8FAFC', border: `1px solid ${c.first ? 'rgba(16,185,129,0.22)' : BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 18, borderRadius: 5, background: c.clr, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{c.apr} APR · {c.bal} bal</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{c.amt}</div>
                  {c.first && <div style={{ fontSize: 9, fontWeight: 700, color: T, marginTop: 1, letterSpacing: 0.8 }}>PAY FIRST</div>}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 2, borderTop: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 11, color: BODY, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: T, display: 'inline-block' }} />
                Est. 6-mo interest avoided
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T }}>$94</span>
            </div>
          </div>
        </section>

        {/* ━━ TICKER ━━ */}
        <div data-animate style={{ overflow: 'hidden', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '12px 0', background: '#fff' }}>
          <div className="ticker-track">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((name, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: 20 }}>
                {name} <span style={{ color: T, fontSize: 7 }}>●</span>
              </span>
            ))}
          </div>
        </div>

        {/* ━━ HOW IT WORKS ━━ */}
        <section id="how-it-works" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px' }}>
          <div data-animate>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: T, marginBottom: 10 }}>HOW IT WORKS</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, lineHeight: 1.25, margin: 0, letterSpacing: '-0.02em', color: TEXT }}>
                From a stack of statements to<br /><G><em>one clear next step.</em></G>
              </h2>
              <Link to="/signup" style={{ fontSize: 12, fontWeight: 600, color: MUTED, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                See it live <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { n: '01', I: Upload, title: 'Drop a PDF',           desc: 'Upload any card statement. We parse balance, APR, minimum, and due date in seconds.' },
              { n: '02', I: Brain,  title: 'Let the engine think',  desc: 'Our avalanche engine ranks every card by true cost — not by balance size.' },
              { n: '03', I: Zap,    title: 'Make one payment',      desc: 'See exactly which card to pay, how much, and how much interest you just avoided.' },
            ].map(({ n, I, title, desc }, idx) => (
              <div key={n} data-animate data-delay={String(idx + 1)} className="sp-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <I size={16} color={T} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>{n}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 7, letterSpacing: '-0.2px', color: TEXT }}>{title}</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: BODY }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━ FEATURES ━━ */}
        <section id="features" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 64px' }}>
          <div data-animate>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: T, marginBottom: 10 }}>FEATURES</p>
            <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, lineHeight: 1.25, marginBottom: 32, letterSpacing: '-0.02em', color: TEXT }}>
              A copilot, <em style={{ fontStyle: 'italic', color: MUTED, fontWeight: 400 }}>not</em> another budgeting app.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
            <div data-animate className="sp-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: T, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={11} /> OPTIMIZER
              </p>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 5, letterSpacing: '-0.3px', color: TEXT }}>Avalanche math, <em>plain-English</em> reasoning.</div>
              <div style={{ fontSize: 12, color: BODY, marginBottom: 16, lineHeight: 1.65 }}>Every recommendation shows why this card, this amount, this month.</div>
              {[
                { name: 'Sapphire',    apr: '24.99%', clr: '#10B981', first: true  },
                { name: 'Quicksilver', apr: '19.49%', clr: '#A78BFA', first: false },
                { name: 'Freedom',     apr: '16.24%', clr: '#FCD34D', first: false },
              ].map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, marginBottom: 7, background: '#F8FAFC', border: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 26, height: 17, borderRadius: 4, background: c.clr }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: MUTED }}>{c.apr} APR</div>
                    </div>
                  </div>
                  {c.first && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: T }}>Pay first</span>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FEATURES.slice(0, 2).map(({ I, title, desc }, idx) => (
                <div key={title} data-animate data-delay={String(idx + 1)} className="sp-card" style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <I size={20} color={T} />
                  <div style={{ fontSize: 13, fontWeight: 700, margin: '10px 0 6px', letterSpacing: '-0.2px', color: TEXT }}>{title}</div>
                  <div style={{ fontSize: 12, color: BODY, lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {FEATURES.slice(2).map(({ I, title, desc }, idx) => (
              <div key={title} data-animate data-delay={String(idx + 1)} className="sp-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <I size={20} color={T} />
                <div style={{ fontSize: 13, fontWeight: 700, margin: '10px 0 6px', letterSpacing: '-0.2px', color: TEXT }}>{title}</div>
                <div style={{ fontSize: 12, color: BODY, lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━ TESTIMONIAL ━━ */}
        <section id="story" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: '64px 24px', background: 'rgba(16,185,129,0.03)' }}>
          <div data-animate style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: T, lineHeight: 1, marginBottom: 14 }}>"</div>
            <blockquote style={{ fontSize: 'clamp(1rem,2.2vw,1.3rem)', fontWeight: 600, lineHeight: 1.65, margin: '0 0 22px', fontStyle: 'italic', color: TEXT }}>
              "I had four cards, $900, and zero clue. SpendPilot told me to crush the Sapphire first — I saved{' '}
              <G style={{ fontStyle: 'italic' }}>$312 in interest</G> over six months."
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff' }}>M</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Maya R.</div>
                <div style={{ fontSize: 11, color: MUTED }}>Designer · Brooklyn</div>
              </div>
              <div style={{ color: T, fontSize: 12, marginLeft: 8, letterSpacing: 1 }}>★★★★★</div>
            </div>
          </div>
        </section>

        {/* ━━ PRICING ━━ */}
        <section id="pricing" style={{ padding: '64px 24px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div data-animate style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: T, marginBottom: 8 }}>PRICING</p>
              <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: TEXT }}>
                Simple, honest, <G><em>no nonsense.</em></G>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {PLANS.map((plan, idx) => (
                <div key={plan.name} data-animate data-delay={String(idx + 1)} className="sp-plan" style={{ position: 'relative', background: plan.highlight ? 'rgba(16,185,129,0.05)' : CARD, border: `1px solid ${plan.highlight ? 'rgba(16,185,129,0.3)' : BORDER}`, borderRadius: 16, padding: '22px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {plan.badge && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)' }}>
                      <span style={{ background: T, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 999 }}>{plan.badge}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-1px', color: TEXT }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 13, color: MUTED }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: BODY, marginBottom: 16, lineHeight: 1.55 }}>{plan.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: BODY }}>
                        <Check size={13} color={T} style={{ flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" style={{ display: 'block', textDecoration: 'none' }}>
                    <button className="sp-btn" style={{ width: '100%', padding: '10px 0', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: plan.highlight ? 'none' : `1px solid ${BORDER}`, background: plan.highlight ? T : '#F8FAFC', color: plan.highlight ? '#fff' : TEXT }}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ FOOTER CTA ━━ */}
        <section data-animate style={{ background: '#0F172A', padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: '#fff' }}>
            Start paying <G><em>smarter</em></G> today.
          </h2>
          <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 28px' }}>
            Join SpendPilot and take control of your credit card debt — for free.
          </p>
          <Link to="/signup">
            <button className="sp-btn" style={{ background: T, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get started — it's free <ArrowRight size={15} />
            </button>
          </Link>
          <p style={{ marginTop: 18, fontSize: 11, color: '#1E293B' }}>No real banking credentials required · Demo data available</p>
        </section>

      </div>
    </>
  )
}
