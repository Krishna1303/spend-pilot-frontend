/**
 * Dashboard API service.
 * Returns mock data now; swap BASE_URL + fetch calls here when backend is ready.
 * All functions return a Promise so components never know the difference.
 */
import {
  MOCK_CARDS,
  MOCK_ACCOUNTS,
  MOCK_TRANSACTIONS,
  MOCK_SPENDING_DATA,
  MOCK_CATEGORIES,
  getDashboardMetrics,
} from '../lib/mockData'

const SIMULATED_DELAY_MS = 800

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchDashboardMetrics() {
  await delay(SIMULATED_DELAY_MS)
  return getDashboardMetrics()
}

export async function fetchCards() {
  await delay(SIMULATED_DELAY_MS)
  return MOCK_CARDS
}

export async function fetchAccounts() {
  await delay(SIMULATED_DELAY_MS)
  return MOCK_ACCOUNTS
}

export async function fetchTransactions() {
  await delay(SIMULATED_DELAY_MS)
  return MOCK_TRANSACTIONS
}

export async function fetchSpendingData() {
  await delay(SIMULATED_DELAY_MS)
  return MOCK_SPENDING_DATA
}

export async function fetchCategories() {
  await delay(SIMULATED_DELAY_MS)
  return MOCK_CATEGORIES
}
