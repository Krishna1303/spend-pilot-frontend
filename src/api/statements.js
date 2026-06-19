/**
 * Statement upload API service.
 * Returns mock parsed data now.
 * Swap for real POST /api/statements/upload when backend is ready.
 */

const MOCK_PARSED_STATEMENT = {
  bankName: 'Chase',
  cardName: 'Freedom Unlimited',
  balance: 2450.75,
  minimumPayment: 85.0,
  dueDate: '2026-07-05',
  apr: 28.99,
  confidence: {
    balance: 'found',
    minimumPayment: 'found',
    dueDate: 'found',
    apr: 'manual',
  },
  rawTextPreview: `CHASE FREEDOM UNLIMITED
Account Summary
Previous Balance:      $2,234.50
Payments / Credits:     -$200.00
Purchases:              +$416.25
New Balance:           $2,450.75

Minimum Payment Due:      $85.00
Payment Due Date:      07/05/2026

ANNUAL PERCENTAGE RATE (APR) INFORMATION
Purchase APR: 28.99% Variable

Statement Period: 05/15/2026 – 06/14/2026
Account Number: ****1234`,
}

export async function uploadStatement(file) {
  // When backend is ready, replace with:
  // const form = new FormData()
  // form.append('file', file)
  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/statements/upload`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` },
  //   body: form,
  // })
  // return res.json()

  await new Promise((r) => setTimeout(r, 2000)) // simulate parse time
  return MOCK_PARSED_STATEMENT
}

export async function useDemoStatement() {
  await new Promise((r) => setTimeout(r, 1800))
  return MOCK_PARSED_STATEMENT
}
