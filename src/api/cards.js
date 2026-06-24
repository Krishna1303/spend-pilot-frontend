/**
 * Cards & accounts API service.
 *   GET    /api/cards?type=credit
 *   POST   /api/cards
 *   PATCH  /api/cards/:id
 *   DELETE /api/cards/:id
 *   GET    /api/plaid/accounts   (debit / bank tab)
 *
 * Responses are mapped into the shapes the Cards screen already renders.
 */
import { api, toDateStr } from './client';

const num = (v) => (v == null ? 0 : Number(v));

// API card → UI card shape used by CardsPage / DashboardPage.
export function mapCard(c) {
  return {
    id: c.id,
    cardType: c.cardType || 'credit',
    bankName: c.bankName || '',
    cardName: c.cardName || '',
    last4: c.last4 || '',
    balance: num(c.balance),
    statementBalance: num(c.statementBalance),
    minimumPayment: num(c.minimumPayment),
    dueDate: toDateStr(c.dueDate),
    apr: num(c.apr),
    creditLimit: num(c.creditLimit),
    source: c.source || 'manual',
  };
}

// Plaid account → UI account shape used by CardsPage / DashboardPage.
function mapAccount(a, i) {
  const balances = a.balances || {};
  return {
    id: a.id ?? a.account_id ?? i,
    bankName: a.institutionName || a.bankName || a.name || 'Bank',
    accountName: a.officialName || a.official_name || a.name || 'Account',
    accountNumber: a.mask || a.last4 || '',
    balance: num(a.balance ?? balances.current ?? balances.available),
    type: a.subtype || a.type || 'checking',
    lastSynced: toDateStr(a.lastSynced || a.updatedAt) || toDateStr(new Date()),
    source: 'plaid',
  };
}

export async function fetchCards(type = 'credit') {
  const { cards } = await api(`/cards?type=${type}`);
  return (cards || []).map(mapCard);
}

export async function fetchAccounts() {
  try {
    const { accounts } = await api('/plaid/accounts');
    return (accounts || []).map(mapAccount);
  } catch {
    return [];
  }
}

export async function addCard(data) {
  const { card } = await api('/cards', {
    method: 'POST',
    body: { cardType: 'credit', ...data },
  });
  return mapCard(card);
}

export async function updateCard(id, data) {
  const { card } = await api(`/cards/${id}`, { method: 'PATCH', body: data });
  return mapCard(card);
}

export async function deleteCard(id) {
  await api(`/cards/${id}`, { method: 'DELETE' });
  return { success: true, id };
}

// Pull fresh balances from a connected Plaid account.
export async function syncCards({ force = false } = {}) {
  return api(`/cards/sync${force ? '?force=true' : ''}`, { method: 'POST' });
}
