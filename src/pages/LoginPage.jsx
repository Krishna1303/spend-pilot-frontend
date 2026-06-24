import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Lock } from 'lucide-react'
import { authApi } from '../api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import PasswordChecklist, { PASSWORD_RULES } from '../components/ui/PasswordChecklist'

function validate({ email, password }) {
  const errs = {}
  if (!email.trim()) {
    errs.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = 'Enter a valid email address.'
  }
  if (!password) {
    errs.password = 'Password is required.'
  } else if (password.length < 8) {
    errs.password = 'Password must be at least 8 characters.'
  } else if (!/[A-Z]/.test(password)) {
    errs.password = 'Password must contain at least one capital letter.'
  } else if (!/[0-9]/.test(password)) {
    errs.password = 'Password must contain at least one number.'
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errs.password = 'Password must contain at least one symbol (e.g. @, #, !).'
  }
  return errs
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      await authApi.login(form)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">

        {/* Brand */}
        <div className="text-center mb-7">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center mx-auto mb-3.5 shadow-[0_6px_20px_rgba(37,99,235,0.32)]">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Spend</span><span className="text-ink">Pilot</span>
          </h1>
          <p className="text-muted text-sm mt-1">Know which credit card to pay first.</p>
        </div>

        {/* Card */}
        <div
          className="bg-surface rounded-2xl border border-line shadow-[0_4px_20px_rgba(0,0,0,0.07)] px-8 py-8"
          style={{ borderTop: '3px solid #2563EB' }}
        >
          <h2 className="text-xl font-bold text-ink mb-1">Sign in to your account</h2>
          <p className="text-muted text-sm mb-5">Welcome back — enter your details to continue.</p>

          {apiError && (
            <div className="mb-4">
              <Alert variant="error" message={apiError} />
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              autoComplete="email"
            />

            <div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
                autoComplete="current-password"
              />
              <PasswordChecklist password={form.password} />
            </div>

            <Button type="submit" fullWidth loading={loading} className="mt-1">
              Sign In
            </Button>
          </form>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-5 pt-4 border-t border-line">
            <Lock className="w-3 h-3" />
            Secured with 256-bit encryption
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-5 text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
