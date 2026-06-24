/**
 * Optimizer API service.
 *   POST /api/optimizer/recommend  — deterministic allocation plan
 *   POST /api/ai/explain           — standalone narration of any optimizer result
 *
 * Prefer `explain: true` on /recommend: it returns `explanation` +
 * `explanationSource` in the SAME response, guaranteed in sync with the plan
 * (no risk of the prose and the numbers drifting apart). The standalone
 * /ai/explain helper is kept for other result kinds (rescue, simulate, …).
 *
 * Note: each plan item's `recommendedPayment` is the amount to pay that card.
 */
import { api } from './client';

export async function fetchOptimizerPlan({ maxPayment, cards, explain = false } = {}) {
  return api('/optimizer/recommend', {
    method: 'POST',
    body: { maxPayment, explain, ...(cards ? { cards } : {}) },
  });
}

export async function fetchAiExplanation({ kind = 'optimizer', result, cards } = {}) {
  const data = await api('/ai/explain', {
    method: 'POST',
    body: { kind, result, ...(cards ? { cards } : {}) },
  });
  return data; // { explanation, source, model? }
}

// 6b. Payday Rescue Plan — a dated action plan around a paycheck.
export async function fetchRescuePlan(body = {}) {
  return api('/optimizer/rescue', { method: 'POST', body: { explain: true, ...body } });
}

// 6c. What-if simulator — compares scenarios against a baseline.
export async function fetchSimulation(body = {}) {
  return api('/optimizer/simulate', { method: 'POST', body });
}

// 6d. Balance-transfer evaluator — stay vs transfer.
export async function fetchBalanceTransfer(body = {}) {
  return api('/optimizer/balance-transfer', { method: 'POST', body });
}
