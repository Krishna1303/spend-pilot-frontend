import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './components/dashboard/DashboardPage'
import OptimizerPage from './components/optimizer/OptimizerPage'
import UploadPage from './components/upload/UploadPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

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
    <AppShell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/" element={<DashboardPage />} />
        <Route path="/optimizer" element={<OptimizerPage />} />
        <Route path="/cards" element={<Placeholder title="Cards" />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/chatbot" element={<Placeholder title="Chatbot" />} />
      </Routes>
    </AppShell>
  )
}
