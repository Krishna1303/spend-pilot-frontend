import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogOut } from 'lucide-react';
import { profileApi, authApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import SkeletonBlock from '../components/ui/SkeletonBlock';

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-surface rounded-2xl border border-line shadow-sm p-6">
        <SkeletonBlock className="w-16 h-16 rounded-2xl mb-6" />
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-11" />
          <SkeletonBlock className="h-11" />
          <SkeletonBlock className="h-10 w-36" />
        </div>
      </div>
      <div className="bg-surface rounded-2xl border border-line shadow-sm p-6">
        <SkeletonBlock className="h-5 w-40 mb-5" />
        <SkeletonBlock className="h-16" />
      </div>
    </div>
  );
}

function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let active = true;
    profileApi
      .get()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setForm({ name: data.name || '', email: data.email || '' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setSaveSuccess(false);
    setSaveError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const updated = await profileApi.update(form);
      setProfile((p) => ({ ...p, ...updated }));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 lg:p-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">My profile</h1>
          <p className="text-sm text-muted mt-1.5">
            Manage your account details and connected bank accounts.
          </p>
        </div>
        <Link
          to="/login"
          onClick={() => authApi.logout()}
          className="flex items-center gap-1.5 text-sm font-semibold text-danger border border-danger/30 bg-danger/5 hover:bg-danger/10 px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Link>
      </div>

      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Profile info card */}
          <div className="bg-surface rounded-2xl border border-line shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 text-white flex items-center justify-center text-xl font-bold shadow-[0_6px_20px_rgba(37,99,235,0.32)] shrink-0"
                aria-label={`Avatar for ${form.name}`}
              >
                {getInitials(form.name) || '?'}
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold text-ink truncate">
                  {form.name || 'Your name'}
                </div>
                <div className="text-sm text-muted truncate">{form.email}</div>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSave} noValidate>
              {saveSuccess && (
                <Alert variant="success" message="Profile updated successfully." />
              )}
              {saveError && <Alert variant="error" message={saveError} />}

              <Input
                id="name"
                name="name"
                type="text"
                label="Full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                {saveSuccess && !saving && (
                  <span className="text-sm font-medium text-success">✓ Saved</span>
                )}
              </div>
            </form>
          </div>

          {/* Connected accounts card */}
          <div className="bg-surface rounded-2xl border border-line shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-ink">Connected accounts</h2>
              <p className="text-sm text-muted mt-0.5">
                Link your bank accounts to import transactions automatically.
              </p>
            </div>

            {profile?.connectedAccounts?.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {profile.connectedAccounts.map((acc) => (
                  <li
                    key={acc.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-page border border-line rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-ink truncate">{acc.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Connected
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center text-center py-8 px-4 border border-dashed border-line rounded-xl bg-page/50">
                <div className="text-3xl mb-3">🏦</div>
                <div className="text-sm font-semibold text-ink mb-1">
                  No accounts connected yet
                </div>
                <p className="text-sm text-muted max-w-sm mb-5">
                  Connect your bank to automatically import transactions and get smarter payment
                  recommendations.
                </p>
                <Button variant="primary">Connect bank</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
