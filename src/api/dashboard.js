/**
 * Dashboard API service.
 *   GET /api/dashboard            — summary, charts, upcoming due dates
 *   GET /api/plaid/transactions   — recent transactions
 *   GET /api/plaid/accounts       — connected accounts (via cards.js)
 *   GET /api/cards?type=credit    — for interest-risk metric (via cards.js)
 *
 * `fetchDashboardData()` fans out once and maps everything into the shapes the
 * Dashboard screen renders.
 */
import { api, toDateStr } from './client';
import { fetchCards, fetchAccounts } from './cards';

const num = (v) => (v == null ? 0 : Number(v));

// Palette reused for the "spending by category" donut.
const CATEGORY_COLORS = [
  '#2563EB', '#7C3AED', '#10B981', '#F59E0B',
  '#EF4444', '#64748B', '#0EA5E9', '#EC4899',
];

function mapTransaction(t, i) {
  // Plaid amounts are positive for outflows; the UI wants income positive.
  const raw = num(t.amount);
  const amount = t.amount != null ? -raw : 0;
  const category =
    (Array.isArray(t.category) ? t.category[0] : t.category) ||
    t.personal_finance_category?.primary ||
    'Uncategorized';
  return {
    id: t.transaction_id || t.id || i,
    merchant: t.merchant_name || t.name || 'Transaction',
    category,
    date: toDateStr(t.date),
    amount,
  };
}

function computeMetrics(dash, cards, accounts) {
  const totals = dash.totals || {};

  const totalCreditBalance =
    totals.creditCardDebt != null
      ? num(totals.creditCardDebt)
      : cards.reduce((s, c) => s + c.balance, 0);

  const availableToPay = accounts.reduce((s, a) => s + a.balance, 0);

  const cardsDueSoon =
    totals.cardsDueSoon != null
      ? num(totals.cardsDueSoon)
      : (dash.upcomingDueDates || []).filter((d) => num(d.daysUntil) <= 7).length;

  // Weighted interest risk 0–100: sum(balance·apr) / max possible.
  const weighted = cards.reduce((s, c) => s + c.balance * (c.apr / 100), 0);
  const maxApr = cards.length ? Math.max(...cards.map((c) => c.apr)) : 0;
  const maxPossible = totalCreditBalance * (maxApr / 100);
  const interestRiskScore = maxPossible > 0 ? Math.round((weighted / maxPossible) * 100) : 0;

  // Highest-APR card (>=20%) due soonest.
  const highAprAlert =
    [...cards]
      .filter((c) => c.apr >= 20)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null;

  return { totalCreditBalance, availableToPay, cardsDueSoon, interestRiskScore, highAprAlert };
}

export async function fetchDashboardData() {
  const [dash, cards, accounts, txResp] = await Promise.all([
    api('/dashboard').catch(() => ({})),
    fetchCards('credit').catch(() => []),
    fetchAccounts().catch(() => []),
    api('/plaid/transactions').catch(() => ({ transactions: [] })),
  ]);

  const spendingData = (dash.spendingVsEarning || []).map((m) => ({
    month: m.month,
    spending: num(m.spending),
    earning: num(m.income),
  }));

  const categories = (dash.categorizedSpending || []).map((c, i) => ({
    name: c.category,
    value: num(c.amount),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const transactions = (txResp.transactions || []).slice(0, 6).map(mapTransaction);

  const upcomingDueDates = (dash.upcomingDueDates || []).map((d, i) => ({
    id: d.cardId ?? i,
    bankName: d.cardName || '',
    cardName: d.cardName || '',
    dueDate: toDateStr(d.dueDate),
    minimumPayment: num(d.minimumPayment),
    balance: num(d.balance),
  }));

  return {
    metrics: computeMetrics(dash, cards, accounts),
    spendingData,
    categories,
    transactions,
    accounts,
    upcomingDueDates,
    payday: dash.payday || null,
  };
}

export { fetchAccounts };
