import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from './api/client'
import AppShell from './components/layout/AppShell'
import DashboardPage from './components/dashboard/DashboardPage'
import LandingPage from './pages/LandingPage'
import OptimizerPage from './components/optimizer/OptimizerPage'
import RescuePage from './components/rescue/RescuePage'
import SimulatorPage from './components/simulator/SimulatorPage'
import BalanceTransferPage from './components/balance/BalanceTransferPage'
import AlertsPage from './components/alerts/AlertsPage'
import ProgressPage from './components/progress/ProgressPage'
import UploadPage from './components/upload/UploadPage'
import ChatbotPage from './components/chatbot/ChatbotPage'
import HelpPage from './components/help/HelpPage'
import CardsPage from './components/cards/CardsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

// Re-evaluates the session on every navigation (via useLocation), so logging in
// and routing to /dashboard renders the app instead of a stale redirect.
function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function Placeholder({ title }) {
  return (
    <div className="p-7 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="text-muted text-sm mt-1">Coming soon — navigate to Dashboard to see the main flow.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public — no shell */}
      <Route path="/"       element={<LandingPage />} />
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* App — inside AppShell with sidebar (requires a session) */}
      <Route path="*" element={
        <RequireAuth>
          <AppShell>
            <Routes>
              <Route path="/dashboard"        element={<DashboardPage />} />
              <Route path="/profile"         element={<ProfilePage />} />
              <Route path="/optimizer"       element={<OptimizerPage />} />
              <Route path="/rescue"          element={<RescuePage />} />
              <Route path="/simulator"       element={<SimulatorPage />} />
              <Route path="/balance-transfer" element={<BalanceTransferPage />} />
              <Route path="/alerts"          element={<AlertsPage />} />
              <Route path="/progress"        element={<ProgressPage />} />
              <Route path="/cards"           element={<CardsPage />} />
              <Route path="/upload"          element={<UploadPage />} />
              <Route path="/chatbot"         element={<ChatbotPage />} />
              <Route path="/help"            element={<HelpPage />} />
              <Route path="*"                element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </RequireAuth>
      } />
    </Routes>
  )
}
