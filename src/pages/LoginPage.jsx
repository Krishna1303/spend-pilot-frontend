import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters',     test: (p) => p.length >= 8 },
  { key: 'upper',  label: 'One capital letter (A–Z)',   test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number (0–9)',           test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol (e.g. @, #, !)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordChecklist({ password }) {
  if (!password) return null;
  return (
    <ul className="pw-checklist">
      {PASSWORD_RULES.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li key={key} className={`pw-rule ${met ? 'pw-rule--met' : 'pw-rule--unmet'}`}>
            <span className="pw-rule__icon">{met ? '✓' : '○'}</span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}

function validate({ email, password }) {
  const errs = {};
  if (!email.trim()) {
    errs.email = 'Email is required.';
  } else if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) {
    errs.email = 'Enter a valid email address (must contain @ and end with .com).';
  }
  if (!password) {
    errs.password = 'Password is required.';
  } else if (password.length < 8) {
    errs.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Z]/.test(password)) {
    errs.password = 'Password must contain at least one capital letter.';
  } else if (!/[0-9]/.test(password)) {
    errs.password = 'Password must contain at least one number.';
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errs.password = 'Password must contain at least one symbol (e.g. @, #, !).';
  }
  return errs;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((fe) => ({ ...fe, [name]: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await authApi.login(form);
      navigate('/profile');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-logo__title">SpendPilot</div>
          <div className="auth-logo__sub">Know which credit card to pay first.</div>
        </div>

        <Card>
          <h1 className="auth-heading">Sign in to your account</h1>

          {apiError && (
            <div className="auth-alert-wrap">
              <Alert variant="error" message={apiError} />
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            <div className="auth-submit">
              <Button type="submit" fullWidth loading={loading}>
                Sign In
              </Button>
            </div>
          </form>
        </Card>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
