import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Shield, Upload, Brain, CreditCard, Check, LineChart } from 'lucide-react'
import { runAvalancheOptimizer } from '../lib/optimizerLogic'

/* ── app palette (matches Login/Signup/Dashboard) ── */
const T      = '#2563EB'   // primary blue
const TD     = '#1E40AF'   // dark blue
const BG     = '#F8FAFC'
const CARD   = '#FFFFFF'
const BORDER = '#E2E8F0'
const TEXT   = '#0F172A'
const BODY   = '#475569'
const MUTED  = '#94A3B8'

const TICKER = ['Sapphire', 'Quicksilver', 'Freedom', 'Platinum', 'Apex', 'Aurora', 'Venture', 'Meridian']

const CARD_CLR = { 1:'#2563EB', 2:'#A78BFA', 3:'#22C55E', 4:'#FCD34D' }
const fmt = (v) => '$' + Math.round(v).toLocaleString('en-US')

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

/* blue gradient text */
function G({ children, style = {} }) {
  return (
    <span style={{
      background: `linear-gradient(135deg, ${TD} 0%, #3B82F6 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      paddingRight: '0.08em',
      ...style,
    }}>
      {children}
    </span>
  )
}

export default function LandingPage() {
  const [budget, setBudget] = useState(900)
  const result = useMemo(() => runAvalancheOptimizer(budget), [budget])
  const pct = Math.min((budget / 5000) * 100, 100)
  const sixMoSavings = result.monthlySavings * 6

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('sp-on')
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('[data-a]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* ── default: spring up ── */
        [data-a] {
          opacity: 0;
          transform: translateY(36px) scale(0.98);
          transition: opacity 0.75s cubic-bezier(.16,1,.3,1),
                      transform 0.75s cubic-bezier(.16,1,.3,1);
        }
        [data-a].sp-on { opacity:1; transform:translateY(0) scale(1); }

        /* ── anime clip reveal (headings) ── */
        [data-a="txt"] {
          opacity: 0;
          clip-path: inset(0 0 100% 0);
          transform: translateY(10px);
          transition: opacity 0.5s ease,
                      clip-path 0.75s cubic-bezier(.16,1,.3,1),
                      transform 0.55s ease;
        }
        [data-a="txt"].sp-on { opacity:1; clip-path:inset(0 0 -5% 0); transform:translateY(0); }

        /* ── slide from left ── */
        [data-a="L"] {
          opacity: 0;
          transform: translateX(-32px);
          transition: opacity 0.7s cubic-bezier(.16,1,.3,1),
                      transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        [data-a="L"].sp-on { opacity:1; transform:translateX(0); }

        /* ── slide from right ── */
        [data-a="R"] {
          opacity: 0;
          transform: translateX(32px);
          transition: opacity 0.7s cubic-bezier(.16,1,.3,1),
                      transform 0.7s cubic-bezier(.16,1,.3,1);
        }
        [data-a="R"].sp-on { opacity:1; transform:translateX(0); }

        /* stagger delays */
        [data-d="1"] { transition-delay: 0.08s; }
        [data-d="2"] { transition-delay: 0.16s; }
        [data-d="3"] { transition-delay: 0.24s; }
        [data-d="4"] { transition-delay: 0.32s; }

        /* ── ticker ── */
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .t-track { display:flex; width:max-content; animation:ticker 30s linear infinite; }

        /* ── nav link ── */
        a.sp-nav { color:${BODY}; font-size:14px; font-weight:500; text-decoration:none; transition:color .15s; }
        a.sp-nav:hover { color:${TEXT}; }

        /* ── card hover: lift + blue glow ── */
        .sp-card {
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .sp-card:hover {
          transform: translateY(-4px);
          border-color: rgba(37,99,235,0.5) !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1), 0 12px 32px rgba(37,99,235,0.09);
        }
        .sp-plan {
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        .sp-plan:hover {
          transform: translateY(-4px);
          border-color: ${T} !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12), 0 14px 36px rgba(37,99,235,0.1);
        }

        /* ── button ── */
        .sp-btn { transition: opacity .2s, transform .2s, box-shadow .2s; }
        .sp-btn:hover { opacity:.88; transform:translateY(-1px); box-shadow:0 6px 18px rgba(37,99,235,0.35); }

        /* ── optimizer pulse ── */
        @keyframes pulse {
          0%,100%{box-shadow:0 4px 24px rgba(37,99,235,0.09);}
          50%    {box-shadow:0 4px 36px rgba(37,99,235,0.2);}
        }
        .sp-opt { animation:pulse 4s ease-in-out infinite; }
      `}</style>

      <div style={{ background: BG, color: TEXT, fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>

        {/* ━━ NAVBAR ━━ */}
        <nav style={{ borderBottom:`1px solid ${BORDER}`, background:'rgba(248,250,252,0.92)', backdropFilter:'blur(14px)', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg,${T},${TD})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 8px rgba(37,99,235,0.35)` }}>
                <Zap size={15} color="#fff" />
              </div>
              <span style={{ fontWeight:800, fontSize:16, letterSpacing:'-0.3px', color:TEXT }}><span style={{color:T}}>Spend</span>Pilot</span>
            </div>
            <div style={{ display:'flex', gap:28 }}>
              <a href="#how-it-works" className="sp-nav">How it works</a>
              <a href="#features"     className="sp-nav">Features</a>
              <a href="#story"        className="sp-nav">Story</a>
              <a href="#pricing"      className="sp-nav">Pricing</a>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <Link to="/login" style={{ color:BODY, fontSize:13, fontWeight:500, textDecoration:'none' }}>Sign in</Link>
              <Link to="/signup">
                <button className="sp-btn" style={{ background:`linear-gradient(135deg,${T},${TD})`, color:'#fff', border:'none', borderRadius:999, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  Get started <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ━━ HERO ━━ */}
        <section style={{ maxWidth:1180, margin:'0 auto', padding:'64px 24px 56px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'center' }}>

          <div data-a="L">
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, border:`1px solid ${BORDER}`, borderRadius:999, padding:'5px 13px', fontSize:11, color:BODY, marginBottom:22, background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:T, display:'inline-block' }} />
              New · AI payment copilot for cardholders
            </div>
            <h1 style={{ fontSize:'clamp(1.9rem,4vw,3rem)', fontWeight:900, lineHeight:1.12, margin:'0 0 14px', letterSpacing:'-0.03em', color:TEXT }}>
              Pay the <G><em>right card</em></G><br />first — every cycle.
            </h1>
            <p style={{ fontSize:14, lineHeight:1.8, color:BODY, margin:'0 0 26px', maxWidth:390 }}>
              SpendPilot reads your statements, watches your APRs and due dates, and tells you exactly where each dollar goes — so you spend <em style={{ color:TEXT }}>less on interest</em> and more on living.
            </p>
            <div style={{ display:'flex', gap:10, marginBottom:32, flexWrap:'wrap' }}>
              <Link to="/signup">
                <button className="sp-btn" style={{ background:`linear-gradient(135deg,${T},${TD})`, color:'#fff', border:'none', borderRadius:999, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:7 }}>
                  Try the demo <ArrowRight size={13} />
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="sp-btn" style={{ background:'#fff', color:TEXT, border:`1px solid ${BORDER}`, borderRadius:999, padding:'10px 20px', fontWeight:600, fontSize:13, cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                  Skip to dashboard
                </button>
              </Link>
            </div>
            <div style={{ display:'flex', gap:32, paddingTop:20, borderTop:`1px solid ${BORDER}` }}>
              {[['$2.4M','interest avoided'],['38k','statements parsed'],['4.9 ★','user rating']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontSize:17, fontWeight:800, color:TEXT, letterSpacing:'-0.5px' }}>{v}</div>
                  <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Optimizer — interactive */}
          <div data-a="R" className="sp-opt" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:20, padding:22, boxShadow:'0 4px 24px rgba(37,99,235,0.09)' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:'uppercase', color:MUTED }}>
                <Zap size={12} color={T} /> Live Optimizer
              </div>
              <span style={{ fontSize:10, fontWeight:700, background:'rgba(37,99,235,0.08)', color:T, borderRadius:999, padding:'3px 9px', letterSpacing:1 }}>INTERACTIVE</span>
            </div>

            {/* Budget slider */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:11, color:BODY }}>I can pay this cycle</span>
                <span style={{ fontSize:18, fontWeight:800, color:TEXT, letterSpacing:'-0.5px', transition:'all 0.2s' }}>{fmt(budget)}</span>
              </div>
              <input
                type="range"
                min={200}
                max={5000}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="sp-slider"
                style={{ width:'100%', cursor:'pointer', '--pct':`${pct}%` }}
              />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:MUTED, marginTop:5 }}>
                <span>$200</span>
                {!result.canCoverMinimums && (
                  <span style={{ color:'#EF4444', fontWeight:600 }}>⚠ Below minimums ({fmt(result.totalMinimums)})</span>
                )}
                <span>$5,000</span>
              </div>
            </div>

            {/* Card plan — top 3 */}
            {result.plan.slice(0, 3).map((card, i) => {
              const isFirst = i === 0
              return (
                <div key={card.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:11, marginBottom:7, background:isFirst?'rgba(37,99,235,0.05)':'#F8FAFC', border:`1px solid ${isFirst?'rgba(37,99,235,0.2)':BORDER}`, transition:'all 0.25s ease' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:28, height:18, borderRadius:5, background:CARD_CLR[card.id] ?? '#94A3B8', flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{card.bankName}</div>
                      <div style={{ fontSize:10, color:MUTED, marginTop:1 }}>{card.apr.toFixed(2)}% APR · {fmt(card.balance)} bal</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:TEXT, transition:'all 0.2s' }}>{fmt(card.payNow)}</div>
                    {isFirst
                      ? <div style={{ fontSize:9, fontWeight:700, color:T, marginTop:1, letterSpacing:0.8 }}>PAY FIRST</div>
                      : card.extra > 0
                        ? <div style={{ fontSize:9, color:'#22C55E', marginTop:1 }}>+{fmt(card.extra)} extra</div>
                        : <div style={{ fontSize:9, color:MUTED, marginTop:1 }}>minimum</div>
                    }
                  </div>
                </div>
              )
            })}

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, marginTop:2, borderTop:`1px solid ${BORDER}` }}>
              <span style={{ fontSize:11, color:BODY, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:T, display:'inline-block' }} />
                Est. 6-mo interest avoided
              </span>
              <span style={{ fontSize:12, fontWeight:700, color:T, transition:'all 0.2s' }}>
                {sixMoSavings > 0 ? fmt(sixMoSavings) : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* ━━ TICKER ━━ */}
        <div data-a style={{ overflow:'hidden', borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:'11px 0', background:'#fff' }}>
          <div className="t-track">
            {[...TICKER,...TICKER,...TICKER,...TICKER].map((name,i) => (
              <span key={i} style={{ fontSize:12, fontWeight:500, color:'#94A3B8', padding:'0 20px', display:'inline-flex', alignItems:'center', gap:20 }}>
                {name} <span style={{ color:T, fontSize:7 }}>●</span>
              </span>
            ))}
          </div>
        </div>

        {/* ━━ HOW IT WORKS ━━ */}
        <section id="how-it-works" style={{ maxWidth:1180, margin:'0 auto', padding:'64px 24px' }}>
          <p data-a="txt" style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:T, marginBottom:10 }}>HOW IT WORKS</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:36, gap:16, flexWrap:'wrap' }}>
            <h2 data-a="txt" style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, lineHeight:1.25, margin:0, letterSpacing:'-0.02em', color:TEXT }}>
              From a stack of statements to<br /><G><em>one clear next step.</em></G>
            </h2>
            <Link to="/signup" style={{ fontSize:12, fontWeight:600, color:MUTED, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              See it live <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { n:'01', I:Upload, title:'Drop a PDF',           desc:'Upload any card statement. We parse balance, APR, minimum, and due date in seconds.' },
              { n:'02', I:Brain,  title:'Let the engine think',  desc:'Our avalanche engine ranks every card by true cost — not by balance size.' },
              { n:'03', I:Zap,    title:'Make one payment',      desc:'See exactly which card to pay, how much, and how much interest you just avoided.' },
            ].map(({ n, I, title, desc }, idx) => (
              <div key={n} data-a data-d={String(idx+1)} className="sp-card" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(37,99,235,0.09)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <I size={16} color={T} />
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:1 }}>{n}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:7, letterSpacing:'-0.2px', color:TEXT }}>{title}</div>
                <div style={{ fontSize:12, lineHeight:1.7, color:BODY }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━ FEATURES ━━ */}
        <section id="features" style={{ maxWidth:1180, margin:'0 auto', padding:'0 24px 64px' }}>
          <p data-a="txt" style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:T, marginBottom:10 }}>FEATURES</p>
          <h2 data-a="txt" style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, lineHeight:1.25, marginBottom:32, letterSpacing:'-0.02em', color:TEXT }}>
            A copilot, <em style={{ fontStyle:'italic', color:MUTED, fontWeight:400 }}>not</em> another budgeting app.
          </h2>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
            <div data-a="L" className="sp-card" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:T, marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
                <Zap size={11} /> OPTIMIZER
              </p>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:5, letterSpacing:'-0.3px', color:TEXT }}>Avalanche math, <em>plain-English</em> reasoning.</div>
              <div style={{ fontSize:12, color:BODY, marginBottom:16, lineHeight:1.65 }}>Every recommendation shows why this card, this amount, this month.</div>
              {[
                { name:'Sapphire',    apr:'24.99%', clr:'#22C55E', first:true  },
                { name:'Quicksilver', apr:'19.49%', clr:'#A78BFA', first:false },
                { name:'Freedom',     apr:'16.24%', clr:'#FCD34D', first:false },
              ].map((c) => (
                <div key={c.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:10, marginBottom:7, background:'#F8FAFC', border:`1px solid ${BORDER}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:26, height:17, borderRadius:4, background:c.clr }} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:TEXT }}>{c.name}</div>
                      <div style={{ fontSize:10, color:MUTED }}>{c.apr} APR</div>
                    </div>
                  </div>
                  {c.first && <span style={{ fontSize:10, fontWeight:700, padding:'2px 9px', borderRadius:999, background:'rgba(37,99,235,0.09)', color:T }}>Pay first</span>}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {FEATURES.slice(0,2).map(({ I, title, desc }, idx) => (
                <div key={title} data-a="R" data-d={String(idx+1)} className="sp-card" style={{ flex:1, background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                  <I size={20} color={T} />
                  <div style={{ fontSize:13, fontWeight:700, margin:'10px 0 6px', letterSpacing:'-0.2px', color:TEXT }}>{title}</div>
                  <div style={{ fontSize:12, color:BODY, lineHeight:1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
            {FEATURES.slice(2).map(({ I, title, desc }, idx) => (
              <div key={title} data-a data-d={String(idx+1)} className="sp-card" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                <I size={20} color={T} />
                <div style={{ fontSize:13, fontWeight:700, margin:'10px 0 6px', letterSpacing:'-0.2px', color:TEXT }}>{title}</div>
                <div style={{ fontSize:12, color:BODY, lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ━━ TESTIMONIAL ━━ */}
        <section id="story" style={{ borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, padding:'64px 24px', background:'rgba(37,99,235,0.03)' }}>
          <div data-a style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <div style={{ fontSize:40, fontWeight:900, color:T, lineHeight:1, marginBottom:14 }}>"</div>
            <blockquote data-a="txt" style={{ fontSize:'clamp(1rem,2.2vw,1.3rem)', fontWeight:600, lineHeight:1.65, margin:'0 0 22px', fontStyle:'italic', color:TEXT }}>
              "I had four cards, $900, and zero clue. SpendPilot told me to crush the Sapphire first — I saved{' '}
              <G style={{ fontStyle:'italic' }}>$312 in interest</G> over six months."
            </blockquote>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${T},${TD})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#fff' }}>M</div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:13, fontWeight:700, color:TEXT }}>Maya R.</div>
                <div style={{ fontSize:11, color:MUTED }}>Designer · Brooklyn</div>
              </div>
              <div style={{ color:T, fontSize:12, marginLeft:8, letterSpacing:1 }}>★★★★★</div>
            </div>
          </div>
        </section>

        {/* ━━ PRICING ━━ */}
        <section id="pricing" style={{ padding:'64px 24px' }}>
          <div style={{ maxWidth:1180, margin:'0 auto' }}>
            <p data-a="txt" style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:T, marginBottom:8, textAlign:'center' }}>PRICING</p>
            <h2 data-a="txt" style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 40px', textAlign:'center', color:TEXT }}>
              Simple, honest, <G><em>no nonsense.</em></G>
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {PLANS.map((plan, idx) => (
                <div key={plan.name} data-a data-d={String(idx+1)} className="sp-plan" style={{ position:'relative', background:plan.highlight?'rgba(37,99,235,0.04)':CARD, border:`1px solid ${plan.highlight?'rgba(37,99,235,0.3)':BORDER}`, borderRadius:16, padding:'22px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                  {plan.badge && (
                    <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)' }}>
                      <span style={{ background:`linear-gradient(135deg,${T},${TD})`, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:999 }}>{plan.badge}</span>
                    </div>
                  )}
                  <div style={{ fontSize:12, fontWeight:600, color:MUTED, marginBottom:6 }}>{plan.name}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:3, marginBottom:4 }}>
                    <span style={{ fontSize:'1.9rem', fontWeight:900, letterSpacing:'-1px', color:TEXT }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize:13, color:MUTED }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize:12, color:BODY, marginBottom:16, lineHeight:1.55 }}>{plan.desc}</p>
                  <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px', display:'flex', flexDirection:'column', gap:9 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:BODY }}>
                        <Check size={13} color={T} style={{ flexShrink:0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" style={{ display:'block', textDecoration:'none' }}>
                    <button className="sp-btn" style={{ width:'100%', padding:'10px 0', borderRadius:999, fontSize:13, fontWeight:700, cursor:'pointer', border:plan.highlight?'none':`1px solid ${BORDER}`, background:plan.highlight?`linear-gradient(135deg,${T},${TD})`:'#F8FAFC', color:plan.highlight?'#fff':TEXT }}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ FOOTER CTA ━━ */}
        <section data-a style={{ background:'#0F172A', padding:'64px 24px', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(1.3rem,2.5vw,1.8rem)', fontWeight:900, margin:'0 0 12px', letterSpacing:'-0.02em', color:'#fff' }}>
            Start paying <G><em>smarter</em></G> today.
          </h2>
          <p style={{ fontSize:14, color:'#64748B', margin:'0 0 28px' }}>
            Join SpendPilot and take control of your credit card debt — for free.
          </p>
          <Link to="/signup">
            <button className="sp-btn" style={{ background:`linear-gradient(135deg,${T},${TD})`, color:'#fff', border:'none', borderRadius:999, padding:'12px 28px', fontWeight:700, fontSize:14, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
              Get started — it's free <ArrowRight size={15} />
            </button>
          </Link>
          <p style={{ marginTop:18, fontSize:11, color:'#1E293B' }}>No real banking credentials required · Demo data available</p>
        </section>

      </div>
    </>
  )
}
