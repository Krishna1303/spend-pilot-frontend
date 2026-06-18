export const DEMO_MODE = true

// ─── Credit Cards ────────────────────────────────────────────────────────────
export const MOCK_CARDS = [
  {
    id: 1,
    bankName: 'Chase',
    cardName: 'Freedom Unlimited',
    balance: 2450.75,
    minimumPayment: 85.0,
    dueDate: '2026-07-05',
    apr: 28.99,
    creditLimit: 10000,
    source: 'plaid',
  },
  {
    id: 2,
    bankName: 'Capital One',
    cardName: 'Quicksilver',
    balance: 3100.2,
    minimumPayment: 110.0,
    dueDate: '2026-07-12',
    apr: 24.99,
    creditLimit: 12000,
    source: 'pdf',
  },
  {
    id: 3,
    bankName: 'American Express',
    cardName: 'Blue Cash',
    balance: 1200.0,
    minimumPayment: 40.0,
    dueDate: '2026-07-20',
    apr: 19.99,
    creditLimit: 8000,
    source: 'manual',
  },
  {
    id: 4,
    bankName: 'Discover',
    cardName: 'It Promo',
    balance: 900.0,
    minimumPayment: 35.0,
    dueDate: '2026-08-01',
    apr: 0.0,
    creditLimit: 5000,
    source: 'plaid',
  },
]

// ─── Bank Accounts ───────────────────────────────────────────────────────────
export const MOCK_ACCOUNTS = [
  {
    id: 1,
    bankName: 'Chase',
    accountName: 'Total Checking',
    accountNumber: '4421',
    balance: 4820.12,
    type: 'checking',
    lastSynced: '2026-06-18',
    source: 'plaid',
  },
  {
    id: 2,
    bankName: 'Ally',
    accountName: 'Online Savings',
    accountNumber: '9981',
    balance: 12450.0,
    type: 'savings',
    lastSynced: '2026-06-18',
    source: 'plaid',
  },
]

// ─── Recent Transactions ─────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  { id: 1, merchant: 'Whole Foods', category: 'Groceries', date: '2026-06-15', amount: -82.45 },
  { id: 2, merchant: 'Shell', category: 'Gas', date: '2026-06-14', amount: -54.1 },
  { id: 3, merchant: 'Payroll Deposit', category: 'Income', date: '2026-06-14', amount: 3200.0 },
  { id: 4, merchant: 'Netflix', category: 'Subscriptions', date: '2026-06-13', amount: -15.49 },
  { id: 5, merchant: 'Uber', category: 'Transport', date: '2026-06-12', amount: -22.8 },
]

// ─── Spending vs Earning (6 months) ──────────────────────────────────────────
export const MOCK_SPENDING_DATA = [
  { month: 'Jan', spending: 3200, earning: 4800 },
  { month: 'Feb', spending: 3450, earning: 4800 },
  { month: 'Mar', spending: 3100, earning: 5000 },
  { month: 'Apr', spending: 3600, earning: 4900 },
  { month: 'May', spending: 3300, earning: 5100 },
  { month: 'Jun', spending: 3800, earning: 5200 },
]

// ─── Spending by Category (donut) ────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  { name: 'Groceries', value: 580, color: '#2563EB' },
  { name: 'Dining', value: 320, color: '#7C3AED' },
  { name: 'Transport', value: 210, color: '#10B981' },
  { name: 'Shopping', value: 450, color: '#F59E0B' },
  { name: 'Subscriptions', value: 95, color: '#EF4444' },
  { name: 'Other', value: 145, color: '#64748B' },
]

// ─── Derived Dashboard Metrics ───────────────────────────────────────────────
export function getDashboardMetrics() {
  const totalCreditBalance = MOCK_CARDS.reduce((sum, c) => sum + c.balance, 0)
  const availableToPay = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0)

  const today = new Date('2026-06-18')
  const soonThreshold = 7
  const cardsDueSoon = MOCK_CARDS.filter((c) => {
    const due = new Date(c.dueDate)
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= soonThreshold
  }).length

  // Weighted interest risk: sum(balance * apr) / max possible → 0–100
  const weightedInterest = MOCK_CARDS.reduce((sum, c) => sum + c.balance * (c.apr / 100), 0)
  const maxPossible = totalCreditBalance * (Math.max(...MOCK_CARDS.map((c) => c.apr)) / 100)
  const interestRiskScore = maxPossible > 0 ? Math.round((weightedInterest / maxPossible) * 100) : 0

  // Highest APR card due soonest
  const highAprCards = MOCK_CARDS.filter((c) => c.apr >= 20).sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
  )

  return {
    totalCreditBalance,
    availableToPay,
    cardsDueSoon,
    interestRiskScore,
    highAprAlert: highAprCards[0] ?? null,
  }
}
