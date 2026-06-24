/**
 * SpendPilot API client.
 *
 * Wraps `fetch` with the conventions from API_REFERENCE.md:
 *   - All endpoints live under `${VITE_API_URL}/api`.
 *   - Auth is a JWT bearer token sent on every protected request.
 *   - Errors come back as `{ error, details? }`; we surface `error` as the
 *     thrown message and attach `status` / `details` for callers that care.
 *   - A 401 on an authenticated request means the session expired → clear it
 *     and bounce to the login screen.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'sp_token';
const USER_KEY = 'sp_user';

// ─── Session storage helpers ──────────────────────────────────────────────────
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage failures (private mode, etc.) */
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function setSession({ token, user } = {}) {
  if (token !== undefined) setToken(token);
  if (user !== undefined) setUser(user);
}

export function clearSession() {
  setToken(null);
  setUser(null);
}

export function isAuthenticated() {
  return !!getToken();
}

/**
 * Normalize an API date (ISO datetime or date) to the `YYYY-MM-DD` string the
 * formatters in `lib/formatters` expect. Returns '' for nullish input.
 */
export function toDateStr(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

// ─── Core request helper ──────────────────────────────────────────────────────
/**
 * @param {string} path  Path under `/api`, e.g. `/auth/login` or `/cards`.
 * @param {object} opts
 * @param {string} [opts.method]
 * @param {object} [opts.body]      JSON body (omit for GET).
 * @param {FormData} [opts.formData] Multipart body (sets no Content-Type).
 * @param {boolean} [opts.auth=true] Attach the bearer token if available.
 */
export async function api(path, { method = 'GET', body, formData, auth = true } = {}) {
  const token = auth ? getToken() : null;

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData; // browser sets multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
  } catch {
    throw Object.assign(new Error('Network error — could not reach the server.'), {
      status: 0,
    });
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired/invalid session on an authenticated call → reset and re-login.
    if (res.status === 401 && token) {
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    throw Object.assign(new Error(data.error || res.statusText || 'Request failed'), {
      status: res.status,
      details: data.details,
    });
  }

  return data;
}
