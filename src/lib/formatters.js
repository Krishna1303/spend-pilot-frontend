const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(value) {
  return usd.format(value)
}

export function formatCurrencyCompact(value) {
  return usdCompact.format(value)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysUntil(dateStr, fromDate = new Date('2026-06-18')) {
  const due = new Date(dateStr + 'T00:00:00')
  return Math.ceil((due - fromDate) / (1000 * 60 * 60 * 24))
}

export function formatPercent(value) {
  return `${value.toFixed(2)}%`
}
