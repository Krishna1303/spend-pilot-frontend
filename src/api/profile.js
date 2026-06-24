import { api, setUser } from './client';

/**
 * Profile API — `/profile` (GET/PATCH/DELETE).
 * `get()` also pulls connected bank accounts from Plaid so the profile screen
 * can render them; failures there are non-fatal (we just show none).
 */
export const profileApi = {
  async get() {
    const { user } = await api('/profile');
    setUser(user);

    let connectedAccounts = [];
    try {
      const { accounts } = await api('/plaid/accounts');
      connectedAccounts = (accounts || []).map((a, i) => ({
        id: a.id ?? a.account_id ?? i,
        name: [a.name, a.officialName].filter(Boolean).join(' ') || a.name || 'Account',
      }));
    } catch {
      /* no Plaid connection / demo — leave empty */
    }

    return { ...user, connectedAccounts };
  },

  async update(data) {
    const { user } = await api('/profile', { method: 'PATCH', body: data });
    setUser(user);
    return user;
  },

  async remove(password) {
    return api('/profile', { method: 'DELETE', body: { password } });
  },
};
