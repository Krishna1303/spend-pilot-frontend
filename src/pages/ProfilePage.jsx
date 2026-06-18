import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileApi } from '../api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

function ProfileSkeleton() {
  return (
    <div className="profile-wrap">
      <div className="sp-card">
        <div className="skeleton skeleton-avatar" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="skeleton skeleton-label" style={{ marginBottom: 6 }} />
            <div className="skeleton skeleton-input" />
          </div>
          <div>
            <div className="skeleton skeleton-label" style={{ marginBottom: 6 }} />
            <div className="skeleton skeleton-input" />
          </div>
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
      <div className="sp-card">
        <div className="skeleton skeleton-label" style={{ width: 160, marginBottom: 20 }} />
        <div className="skeleton skeleton-input" />
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
    profileApi.get().then((data) => {
      setProfile(data);
      setForm({ name: data.name, email: data.email });
      setLoading(false);
    });
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
    <>
      <header className="app-header">
        <Link to="/login" className="app-header__logo">SpendPilot</Link>
        <div className="app-header__right">
          <span>{profile?.name || ''}</span>
          <Link to="/login" style={{ color: '#EF4444', fontWeight: 500 }}>Sign out</Link>
        </div>
      </header>

      <div className="profile-page">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="profile-wrap">
            {/* Profile info card */}
            <Card>
              <div
                className="profile-avatar"
                aria-label={`Avatar for ${form.name}`}
              >
                {getInitials(form.name) || '?'}
              </div>

              <form className="profile-form" onSubmit={handleSave} noValidate>
                {saveSuccess && (
                  <Alert variant="success" message="Profile updated successfully." />
                )}
                {saveError && (
                  <Alert variant="error" message={saveError} />
                )}

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

                <div className="profile-save-row">
                  <Button type="submit" loading={saving}>
                    Save changes
                  </Button>
                  {saveSuccess && !saving && (
                    <span style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>
                      ✓ Saved
                    </span>
                  )}
                </div>
              </form>
            </Card>

            {/* Connected accounts card */}
            <Card>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Connected accounts
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Link your bank accounts to import transactions automatically.
                </p>
              </div>

              {profile?.connectedAccounts?.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {profile.connectedAccounts.map((acc) => (
                    <li
                      key={acc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        fontSize: 14,
                      }}
                    >
                      <span style={{ fontWeight: 500, color: '#0F172A' }}>{acc.name}</span>
                      <span style={{ color: '#10B981', fontSize: 13 }}>Connected</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">🏦</div>
                  <div className="empty-state__title">No accounts connected yet</div>
                  <p className="empty-state__sub">
                    Connect your bank to automatically import transactions and get smarter payment recommendations.
                  </p>
                  <Button variant="primary">
                    Connect Bank
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
