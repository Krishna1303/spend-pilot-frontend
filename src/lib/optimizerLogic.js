import { MOCK_CARDS } from './mockData'

// ─── Risk Level ───────────────────────────────────────────────────────────────
export function getRiskLevel(apr) {
  if (apr >= 25) return 'high'
  if (apr >= 15) return 'medium'
  return 'low'
}

// ─── Reason per card ──────────────────────────────────────────────────────────
function getReason(card, extraApplied) {
  if (card.apr === 0) {
    return 'Promo APR. Minimum covered; extra dollars work harder on higher-rate cards.'
  }
  if (extraApplied > 0) {
    return 'Large balance at a high APR — extra payment shrinks future interest fastest.'
  }
  if (card.apr >= 20) {
    return 'Large balance at a high APR — extra payment shrinks future interest fastest.'
  }
  return 'Lower APR. Minimum keeps it current.'
}

// ─── Currency helper (used inside this module only) ───────────────────────────
function fmt(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

// ─── AI Explanation Generator ─────────────────────────────────────────────────
function generateExplanation(budget, canCoverMinimums, plan, remaining) {
  if (!canCoverMinimums) {
    const totalMin = plan.reduce((s, c) => s + c.minimumPayment, 0)
    return `You have ${fmt(budget)} available, but the total minimum payments across all cards add up to ${fmt(totalMin)}. Consider increasing your budget to avoid any late fees or impact to your credit score.`
  }

  const topCard = plan[0]
  const extraLine =
    topCard?.extra > 0
      ? ` The largest extra payment goes to ${topCard.bankName} ${topCard.cardName} because it has the highest APR among balances that still need attention. Paying it down first saves the most interest.`
      : ' All minimums are covered, but no budget remains for extra payments this cycle.'

  const allocationLine =
    remaining === 0
      ? ' Every dollar is allocated.'
      : ` ${fmt(remaining)} remains unallocated as a buffer.`

  return `You have ${fmt(budget)} to put toward credit card debt this cycle. Good news — that fully covers every minimum payment, so no card will be reported late.${extraLine}${allocationLine}`
}

// ─── Avalanche Optimizer ──────────────────────────────────────────────────────
/**
 * Avalanche method: cover all minimums first, then apply the remaining
 * budget to the highest-APR card. Returns a deterministic plan; the AI
 * explanation describes it but never changes the amounts.
 */
export function runAvalancheOptimizer(budget, cards = MOCK_CARDS) {
  const totalMinimums = cards.reduce((sum, c) => sum + c.minimumPayment, 0)
  const canCoverMinimums = budget >= totalMinimums

  // Sort by APR descending — highest interest first
  const sorted = [...cards].sort((a, b) => b.apr - a.apr)

  let remaining = budget

  // Pass 1: cover minimums
  const plan = sorted.map((card) => {
    const minimum = Math.min(card.minimumPayment, remaining)
    remaining = Math.max(0, remaining - minimum)
    return { ...card, minimum, extra: 0, payNow: minimum, reason: '' }
  })

  // Pass 2: apply leftover to highest-APR cards in order
  for (const item of plan) {
    if (remaining <= 0) break
    const maxExtra = Math.max(0, item.balance - item.minimum)
    const extra = Math.min(remaining, maxExtra)
    item.extra = extra
    item.payNow = item.minimum + extra
    remaining -= extra
  }

  // Attach reasons
  plan.forEach((item) => {
    item.reason = getReason(item, item.extra)
  })

  // Monthly interest saved by the extra payment on the top card
  const topCard = plan[0]
  const monthlySavings = topCard ? topCard.extra * (topCard.apr / 100 / 12) : 0

  const aiExplanation = generateExplanation(budget, canCoverMinimums, plan, remaining)

  return {
    budget,
    totalMinimums,
    canCoverMinimums,
    extraToHighestApr: plan[0]?.extra ?? 0,
    remaining,
    monthlySavings,
    plan,
    strategy: 'avalanche',
    aiExplanation,
  }
}
