/**
 * Optimizer API service.
 *   POST /api/optimizer/recommend  — deterministic allocation plan
 *   POST /api/ai/explain           — plain-English narration of a result
 *
 * The Optimizer screen keeps a local avalanche engine for instant slider
 * feedback; these calls bring in the backend plan + AI explanation when the
 * user runs the optimizer.
 */
import { api } from './client';

export async function fetchOptimizerPlan({ maxPayment, cards } = {}) {
  return api('/optimizer/recommend', {
    method: 'POST',
    body: { maxPayment, ...(cards ? { cards } : {}) },
  });
}

export async function fetchAiExplanation({ kind = 'optimizer', result, cards } = {}) {
  const data = await api('/ai/explain', {
    method: 'POST',
    body: { kind, result, ...(cards ? { cards } : {}) },
  });
  return data; // { explanation, source, model? }
}
