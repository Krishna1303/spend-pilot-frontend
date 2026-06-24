/**
 * Help, Terms & Privacy (public — no auth).
 *   GET /api/help          → { title, articles: [{ id, title, body }] }
 *   GET /api/legal/terms   → { title, version, effectiveDate, sections: [...] }
 *   GET /api/legal/privacy → same shape as terms
 */
import { api } from './client';

export function fetchHelp() {
  return api('/help', { auth: false });
}

export function fetchTerms() {
  return api('/legal/terms', { auth: false });
}

export function fetchPrivacy() {
  return api('/legal/privacy', { auth: false });
}
