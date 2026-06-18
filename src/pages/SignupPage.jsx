import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import PasswordChecklist, { PASSWORD_RULES } from '../components/ui/PasswordChecklist';

function validate({ name, email, password, confirm }) {
  const errs = {};

  if (!name.trim()) {
    errs.name = 'Full name is required.';
  }

  if (!email.trim()) {
    errs.email = 'Email is required.';
  } else if (!email.includes('@') || !email.toLowerCase().endsWith('.com')) {
    errs.email = 'Enter a valid email address (must contain @ and end with .com).';
  }

  if (!password) {
    errs.password = 'Password is required.';
  } else {
    const failed = PASSWORD_RULES.find((r) => !r.test(password));
    if (failed) errs.password = failed.label + ' is required.';
  }

  if (!confirm) {
    errs.confirm = 'Please confirm your password.';
  } else if (confirm !== password) {
    errs.confirm = 'Passwords do not match.';
  }

  return errs;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((fe) => ({ ...fe, [name]: '' }));
    }
    if (name === 'password' && fieldErrors.confirm) {
      setFieldErrors((fe) => ({ ...fe, confirm: '' }));
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
      await authApi.signup(form);
      navigate('/profile');
    } catch (err) {
      setApiError(err.message || 'Signup failed. Please try again.');
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
          <h1 className="auth-heading">Create your account</h1>

          {apiError && (
            <div className="auth-alert-wrap">
              <Alert variant="error" message={apiError} />
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            <div className="auth-submit">
              <Button type="submit" fullWidth loading={loading}>
                Create Account
              </Button>
            </div>
          </form>
        </Card>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
