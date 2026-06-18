import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <div className="p-7 flex items-center justify-center min-h-[60vh]">
//       <div className="text-center">
//         <div className="text-4xl mb-3">🚧</div>
//         <h2 className="text-xl font-semibold text-ink">{title}</h2>
//         <p className="text-muted text-sm mt-1">Coming soon — navigate to Dashboard to see the main flow.</p>
//       </div>
//     </div>
//   )
// }

export default function App() {
  return (
    <AppShell>
      <Routes>
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/signup"  element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />

        <Route path="/" element={<DashboardPage />} />
        <Route path="/optimizer" element={<Placeholder title="Optimizer" />} />
        <Route path="/cards" element={<Placeholder title="Cards" />} />
        <Route path="/upload" element={<Placeholder title="PDF Upload" />} />
        <Route path="/chatbot" element={<Placeholder title="Chatbot" />} />
        <Route path="/profile" element={<Placeholder title="My Profile" />} />
      </Routes>
    </AppShell>
  )
}
