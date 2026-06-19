import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Zap,
  CreditCard,
  FileText,
  MessageCircle,
  User,
  CircleDot,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/optimizer', label: 'Optimizer', icon: Zap },
  { to: '/cards',     label: 'Cards',     icon: CreditCard },
  { to: '/upload',    label: 'PDF Upload', icon: FileText },
  { to: '/chatbot',   label: 'Chatbot',   icon: MessageCircle },
  { to: '/profile',   label: 'My Profile', icon: User },
]

function NavItem({ to, label, icon: Icon, mobile = false }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        mobile
          ? `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-[52px]${isActive ? ' text-success' : ' text-muted'}`
          : `sp-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all${isActive ? ' sp-nav-active bg-success' : ''}`
      }
      style={({ isActive }) =>
        mobile
          ? undefined
          : { color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)' }
      }
    >
      <Icon className={mobile ? 'w-5 h-5' : 'w-4 h-4 shrink-0'} />
      <span className={mobile ? 'text-[10px]' : ''}>{label}</span>
    </NavLink>
  )
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-44 bg-nav z-40">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">SpendPilot</div>
            <div className="text-white/40 text-[9px] font-medium tracking-widest uppercase">Debt Copilot</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Demo mode notice */}
      <div className="px-3 pb-4">
        <div className="rounded-xl bg-nav-hover p-3">
          <div className="flex items-center gap-2 mb-1">
            <CircleDot className="w-3 h-3 text-success shrink-0" />
            <span className="text-white text-xs font-medium">Demo mode active</span>
          </div>
          <p className="text-white/40 text-[10px] leading-relaxed">
            All data is mocked so you can explore the full SpendPilot story.
          </p>
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function BottomNav() {
  const mobileItems = NAV_ITEMS.slice(0, 5)
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-line z-40 flex items-center justify-around px-2 py-2 safe-area-pb">
      {mobileItems.map((item) => (
        <NavItem key={item.to} {...item} mobile />
      ))}
    </nav>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function AppShell({ children }) {
  return (
    <div className="min-h-dvh bg-page">
      <Sidebar />
      <BottomNav />
      <main className="lg:pl-44 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
