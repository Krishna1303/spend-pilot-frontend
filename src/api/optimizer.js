/**
 * Optimizer API service.
 * Runs the avalanche algorithm locally now using mock data.
 * Swap for a real POST /api/optimizer/recommend when backend is ready.
 */
import { runAvalancheOptimizer } from '../lib/optimizerLogic'
import { MOCK_CARDS } from '../lib/mockData'

export async function fetchOptimizerPlan(budget, cardIds = null) {
  // When backend is ready, replace with:
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/optimizer/recommend`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` },
  //   body: JSON.stringify({ maxPayment: budget, cardIds }),
  // })
  // return res.json()

  const cards = cardIds
    ? MOCK_CARDS.filter((c) => cardIds.includes(c.id))
    : MOCK_CARDS

  return runAvalancheOptimizer(budget, cards)
}

export async function fetchAiExplanation(plan) {
  // When backend is ready, replace with:
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/explain`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` },
  //   body: JSON.stringify({ plan }),
  // })
  // return res.json()

  return { explanation: plan.aiExplanation }
}
