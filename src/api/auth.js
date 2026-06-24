import { api, setSession, clearSession } from './client';

/**
 * Auth API — `/auth/signup` and `/auth/login`.
 * Both return `{ token, user }`; we persist the session on success so every
 * subsequent request is authenticated.
 */
export const authApi = {
  async login({ email, password }) {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    if (!data?.token) throw new Error('Login failed — the server did not return a session token.');
    setSession({ token: data.token, user: data.user });
    return data;
  },

  async signup({ name, email, password }) {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
      auth: false,
    });
    if (!data?.token) throw new Error('Signup failed — the server did not return a session token.');
    setSession({ token: data.token, user: data.user });
    return data;
  },

  logout() {
    clearSession();
  },
};
