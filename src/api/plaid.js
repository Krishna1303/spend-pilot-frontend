/**
 * Plaid (Connect bank) API service.
 *   POST /api/plaid/create-link-token     → { link_token, demo? }
 *   POST /api/plaid/exchange-public-token  { public_token } → { connected: true }
 *   POST /api/plaid/sandbox/connect        → { connected: true, accounts }
 *   GET  /api/plaid/accounts               → { accounts, demo }
 *
 * `connectBank()` opens the real Plaid Link overlay when the backend returns a
 * usable link token; if Plaid keys aren't configured (demo mode) it falls back
 * to the one-call sandbox connect. Either way it imports accounts as cards.
 */
import { api } from './client';
import { syncCards } from './cards';

export function createLinkToken() {
  return api('/plaid/create-link-token', { method: 'POST' });
}

export function exchangePublicToken(public_token) {
  return api('/plaid/exchange-public-token', { method: 'POST', body: { public_token } });
}

export function sandboxConnect(institution_id) {
  return api('/plaid/sandbox/connect', {
    method: 'POST',
    body: institution_id ? { institution_id } : {},
  });
}

// Load Plaid's Link SDK from their CDN once, lazily.
function loadPlaidScript() {
  return new Promise((resolve, reject) => {
    if (window.Plaid) return resolve(window.Plaid);
    const existing = document.getElementById('plaid-link-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Plaid));
      existing.addEventListener('error', () => reject(new Error('Failed to load Plaid Link.')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'plaid-link-script';
    s.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    s.onload = () => resolve(window.Plaid);
    s.onerror = () => reject(new Error('Failed to load Plaid Link.'));
    document.head.appendChild(s);
  });
}

/**
 * Kicks off the bank-connection flow.
 * @param {object} cb
 * @param {() => void} [cb.onConnected]  Called after accounts are linked + synced.
 * @param {(err:Error) => void} [cb.onError]
 * @returns {Promise<{ opened: boolean, demo: boolean }>}
 *   `opened` = the Plaid overlay was shown (real flow); `demo` = sandbox path used.
 */
export async function connectBank({ onConnected, onError } = {}) {
  const { link_token, demo } = await createLinkToken();

  // Real Plaid Link when we have a usable token and aren't in demo mode.
  if (link_token && !demo) {
    const Plaid = await loadPlaidScript();
    const handler = Plaid.create({
      token: link_token,
      onSuccess: async (publicToken) => {
        try {
          await exchangePublicToken(publicToken);
          await syncCards().catch(() => {});
          onConnected?.();
        } catch (err) {
          onError?.(err);
        }
      },
      onExit: (err) => {
        if (err) onError?.(new Error(err.display_message || err.error_message || 'Plaid Link closed.'));
      },
    });
    handler.open();
    return { opened: true, demo: false };
  }

  // Demo / sandbox: connect a demo bank in one call (no Plaid UI), then import.
  await sandboxConnect();
  await syncCards().catch(() => {});
  onConnected?.();
  return { opened: false, demo: true };
}
