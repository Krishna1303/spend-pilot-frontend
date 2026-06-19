/**
 * Cards & accounts API service.
 * Returns mock data now; swap for real endpoints when backend is ready:
 *   GET    /api/cards
 *   POST   /api/cards
 *   PUT    /api/cards/:id
 *   DELETE /api/cards/:id
 *   GET    /api/accounts
 */
import { MOCK_CARDS, MOCK_ACCOUNTS } from '../lib/mockData'

export async function fetchCards() {
  // When backend is ready, replace with:
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cards`, {
  //   headers: { Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` },
  // })
  // return res.json()
  await new Promise((r) => setTimeout(r, 600))
  return [...MOCK_CARDS]
}

export async function fetchAccounts() {
  // GET /api/accounts
  await new Promise((r) => setTimeout(r, 600))
  return [...MOCK_ACCOUNTS]
}

export async function addCard(data) {
  // POST /api/cards  body: data
  await new Promise((r) => setTimeout(r, 700))
  return { ...data, id: Date.now() }
}

export async function updateCard(id, data) {
  // PUT /api/cards/:id  body: data
  await new Promise((r) => setTimeout(r, 700))
  return { ...data, id }
}

export async function deleteCard(id) {
  // DELETE /api/cards/:id
  await new Promise((r) => setTimeout(r, 500))
  return { success: true }
}
