import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Lock } from 'lucide-react'
import { authApi } from '../api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import PasswordChecklist, { PASSWORD_RULES } from '../components/ui/PasswordChecklist'

function validate({ name, email, password, confirm }) {
  const errs = {}
  if (!name.trim()) {
    errs.name = 'Full name is required.'
  }
  if (!email.trim()) {
    errs.email = 'Email is required.'
  } else if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) {
    errs.email = 'Enter a valid email address (must contain @ and end with .com).'
  }
  if (!password) {
    errs.password = 'Password is required.'
  } else {
    const failed = PASSWORD_RULES.find((r) => !r.test(password))
    if (failed) errs.password = failed.label + ' is required.'
  }
  if (!confirm) {
    errs.confirm = 'Please confirm your password.'
  } else if (confirm !== password) {
    errs.confirm = 'Passwords do not match.'
  }
  return errs
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }))
    if (name === 'password' && fieldErrors.confirm) setFieldErrors((fe) => ({ ...fe, confirm: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true)
    setApiError('')
    try {
      await authApi.signup(form)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">

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
          <h2 className="text-xl font-bold text-ink mb-1">Create your account</h2>
          <p className="text-muted text-sm mb-5">Start managing your cards smarter today.</p>

          {apiError && (
            <div className="mb-4">
              <Alert variant="error" message={apiError} />
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="name"
              name="name"
              type="text"
              label="Full name"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
              autoComplete="name"
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="alex@gmail.com"
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
                autoComplete="new-password"
              />
              <PasswordChecklist password={form.password} />
            </div>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              label="Confirm password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              error={fieldErrors.confirm}
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading} className="mt-1">
              Create Account
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
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
