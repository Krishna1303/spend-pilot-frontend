/**
 * Insights API service.
 *   GET /api/alerts    → { alerts: [...], counts: { critical, warning, info } }
 *   GET /api/progress  → { currentDebt, totalCreditLimit, overallUtilization,
 *                          history, debtChange, milestones, interestSaved }
 *
 * Calling /progress also records today's snapshot server-side.
 */
import { api } from './client';

export function fetchAlerts() {
  return api('/alerts');
}

export function fetchProgress() {
  return api('/progress');
}
